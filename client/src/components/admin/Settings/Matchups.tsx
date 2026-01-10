import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Toolbar } from 'primereact/toolbar';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { confirmDialog } from 'primereact/confirmdialog';
import api from '../../../api/axios';
import type { Matchup, Team, MatchupForm } from '../types';
import { getLogoUrl } from '../../../utils/logoUtils';

interface MatchupsProps {
    matchups: Matchup[];
    teams: Team[];
    token: string | null;
    fetchData: () => Promise<void>;
    toast: React.RefObject<any>;
}

const emptyMatchup: MatchupForm = {
    week: 1,
    stage: 'REGULAR',
    homeTeamId: 0,
    awayTeamId: 0,
    startTime: new Date()
};

const Matchups: React.FC<MatchupsProps> = ({ matchups, teams, token, fetchData, toast }) => {
    const { t } = useTranslation();
    const [adminSelectedWeek, setAdminSelectedWeek] = useState<number>(1);
    const [adminSelectedStage, setAdminSelectedStage] = useState<string>('REGULAR');
    const [showMatchupDialog, setShowMatchupDialog] = useState(false);
    const [showScoreDialog, setShowScoreDialog] = useState(false);
    const [currentMatchup, setCurrentMatchup] = useState<Matchup | null>(null);
    const [matchupForm, setMatchupForm] = useState<MatchupForm>(emptyMatchup);
    const [homeScore, setHomeScore] = useState<number | null>(0);
    const [awayScore, setAwayScore] = useState<number | null>(0);

    const dialogBreakpoints = { '960px': '75vw', '640px': '95vw' };

    const stageOptions = [
        { label: t('admin.stages.regular'), value: 'REGULAR' },
        { label: t('admin.stages.wildcard'), value: 'WILDCARD' },
        { label: t('admin.stages.divisional'), value: 'DIVISIONAL' },
        { label: t('admin.stages.conference'), value: 'CONFERENCE' },
        { label: t('admin.stages.superbowl'), value: 'SUPERBOWL' }
    ];

    const weekOptions = Array.from({ length: 18 }, (_, i) => ({ label: `${t('admin.form.week')} ${i + 1}`, value: i + 1 }));

    const saveMatchup = async () => {
        try {
            if (matchupForm.id) {
                await api.put('/api/admin/matchups', matchupForm, { headers: { Authorization: `Bearer ${token}` } });
                toast.current?.show({severity:'success', summary: t('admin.success'), detail: t('admin.updated')});
            } else {
                await api.post('/api/admin/matchups', matchupForm, { headers: { Authorization: `Bearer ${token}` } });
                toast.current?.show({severity:'success', summary: t('admin.success'), detail: t('admin.created')});
            }
            setShowMatchupDialog(false);
            fetchData();
        } catch (error: any) {
            let detail = error.response?.data?.message || t('admin.errors.default');
            if (detail === 'SAME_TEAM_CONFLICT') detail = t('admin.errors.sameTeam');
            if (detail === 'TEAM_ALREADY_SCHEDULED') detail = t('admin.errors.teamScheduled');
            toast.current?.show({severity:'error', summary: t('admin.error'), detail});
        }
    }

    const deleteMatchup = (id: number) => {
        confirmDialog({
            message: t('admin.confirmDelete'),
            header: t('admin.confirm.title'),
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            accept: async () => {
                try {
                    await api.delete(`/api/admin/matchups/${id}`, { headers: { Authorization: `Bearer ${token}` } });
                    fetchData();
                } catch (error) { console.error(error); }
            }
        });
    }

    const submitScores = async () => {
        if (!currentMatchup) return;
        try {
            await api.post('/api/admin/simulate', { matchupId: currentMatchup.id, homeScore, awayScore }, { headers: { Authorization: `Bearer ${token}` } });
            setShowScoreDialog(false);
            fetchData();
        } catch (error) { console.error(error); }
    }

    const filteredMatchups = matchups.filter(m => m.week === adminSelectedWeek && m.stage === adminSelectedStage);

    return (
        <div className="py-8 flex flex-col items-center">
            <Toolbar start={(
                <div className="flex flex-wrap gap-3">
                    <Button label={t('admin.newGame')} icon="pi pi-plus" severity="success" className="font-black px-6 py-3 shadow-4" onClick={() => { setMatchupForm(emptyMatchup); setShowMatchupDialog(true); }} />
                </div>
            )} className="w-full max-w-[950px] mb-8 p-4 surface-card border-0 rounded-2xl shadow-4" />

            <div className="w-full max-w-[950px] flex flex-wrap gap-8 items-center bg-gray-800 bg-opacity-30 p-8 rounded-3xl mb-12 border-0 shadow-inner mx-auto">
                <div className="flex items-center gap-4">
                    <span className="font-black text-xs text-gray-500 tracking-widest ">{t('admin.form.stage')}:</span>
                    <Dropdown value={adminSelectedStage} options={stageOptions} onChange={(e) => setAdminSelectedStage(e.value)} className="p-inputtext-sm w-16rem font-black shadow-4" />
                </div>
                <div className="flex items-center gap-12 margin: 120px"></div>
                {adminSelectedStage === 'REGULAR' && (
                    <div className="flex items-center gap-4">
                        <span className="font-black text-xs text-gray-500 tracking-widest">{t('admin.form.week')}:</span>
                        <Dropdown value={adminSelectedWeek} options={weekOptions} onChange={(e) => setAdminSelectedWeek(e.value)} className="p-inputtext-sm w-12rem font-black shadow-4" />
                    </div>
                )}

                <div className="ml-auto">
                    <Tag value={`${filteredMatchups.length} / 18 ${t('nav.games')}`} severity={filteredMatchups.length >= 18 ? 'danger' : 'info'} className="px-6 py-2 font-black shadow-6 rounded-lg text-xs" />
                </div>
            </div>

            <div className="w-fit mx-auto shadow-10 rounded-3xl overflow-hidden border-0 bg-gray-900 bg-opacity-20">
                <DataTable value={filteredMatchups} stripedRows rowHover responsiveLayout="scroll">
                    <Column header="#" body={(_row, options) => <span className="text-gray-600 font-black text-xs px-2">{options.rowIndex + 1}</span>} align="center" headerClassName="justify-content-center"></Column>
                    <Column header="" body={(row) => <div className="py-6 px-4"><img src={getLogoUrl(row.awayTeam.logoUrl, '30')} className="object-contain w-8 h-8 transition-transform hover:scale-110" alt="away-logo" /></div>} align="right" headerClassName="justify-content-center"></Column>
                    <Column header={t('admin.form.away')} body={(row) => <span className="font-black text-sm  tracking-widest px-4 text-white">{row.awayTeam.name}</span>} headerClassName="text-center"></Column>
                    <Column header="" body={() => <span className="text-gray-700 text-2xl font-black italic opacity-20 px-4">@</span>} align="center" headerClassName="text-center"></Column>
                    <Column header={t('admin.form.home')} body={(row) => <span className="font-black text-sm  tracking-widest px-4 text-white">{row.homeTeam.name}</span>} align="right" headerClassName="text-center"></Column>
                    <Column header="" body={(row) => <div className="py-6 px-4"><img src={getLogoUrl(row.homeTeam.logoUrl, '30')} className="object-contain w-8 h-8 transition-transform hover:scale-110" alt="home-logo" /></div>} align="left" headerClassName="justify-content-center"></Column>
                    <Column header={t('admin.status')} body={(row) => <div className="px-4">{row.isFinished ? <Tag severity="success" value={t('admin.finished')} className="text-[10px] font-black px-4 py-1" /> : <Tag severity="warning" value={t('admin.pending')} className="text-[10px] font-black px-4 py-1" />}</div>} align="center" headerClassName="text-center"></Column>
                    <Column header={t('admin.result')} body={(row) => <div className="px-6">{row.isFinished ? <span className="font-black text-primary text-3xl tracking-tighter">{row.awayScore} - {row.homeScore}</span> : <Button label="Score" icon="pi pi-pencil" severity="warning" text className="font-black text-xs p-3 hover:bg-warning-900" onClick={() => { setCurrentMatchup(row); setHomeScore(0); setAwayScore(0); setShowScoreDialog(true); }} />}</div>} align="center" headerClassName="text-center"></Column>
                    <Column header="" align="center" body={(row) => (
                        <div className="flex gap-3 px-8 py-6">
                            <Button icon="pi pi-pencil" rounded text severity="warning" onClick={() => { setMatchupForm({ ...row, startTime: new Date(row.startTime) }); setShowMatchupDialog(true); }} className="p-button-lg shadow-2" />
                            <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => deleteMatchup(row.id)} className="p-button-lg shadow-2" />
                        </div>
                    )}></Column>
                </DataTable>
            </div>

            <Dialog header={matchupForm.id ? t('admin.form.save') : t('admin.form.create')} visible={showMatchupDialog} breakpoints={dialogBreakpoints} style={{ width: '450px' }} onHide={() => setShowMatchupDialog(false)} footer={<div><Button label={t('admin.form.cancel')} icon="pi pi-times" onClick={() => setShowMatchupDialog(false)} className="p-button-text" /><Button label={t('admin.form.save')} icon="pi pi-check" onClick={saveMatchup} /></div>}>
                <div className="flex flex-col gap-6 p-fluid py-4">
                    <div className="flex flex-col gap-4">
                        <label className="font-bold text-xs text-gray-500">{t('admin.form.stage')}</label>
                        <Dropdown value={matchupForm.stage} options={stageOptions} onChange={(e) => setMatchupForm({...matchupForm, stage: e.value})} />
                    </div>
                    <div className="flex flex-col gap-4">
                        <label className="font-bold text-xs text-gray-500">{t('admin.form.week')}</label>
                        <InputNumber value={matchupForm.week} onValueChange={(e) => setMatchupForm({...matchupForm, week: e.value ?? 1})} min={1} max={22} />
                    </div>
                    <div className="flex flex-col gap-4">
                        <label className="font-bold text-xs text-gray-500">{t('admin.form.away')}</label>
                        <Dropdown value={matchupForm.awayTeamId} options={teams.map(t => ({label: t.name, value: t.id}))} filter onChange={(e) => setMatchupForm({...matchupForm, awayTeamId: e.value})} placeholder={t('admin.form.away')} />
                    </div>
                    <div className="flex flex-col gap-4">
                        <label className="font-bold text-xs text-gray-500">{t('admin.form.home')}</label>
                        <Dropdown value={matchupForm.homeTeamId} options={teams.map(t => ({label: t.name, value: t.id}))} filter onChange={(e) => setMatchupForm({...matchupForm, homeTeamId: e.value})} placeholder={t('admin.form.home')} />
                    </div>
                    <div className="flex flex-col gap-4">
                        <label className="font-bold text-xs text-gray-500">{t('admin.form.date')}</label>
                        <Calendar value={matchupForm.startTime} onChange={(e) => setMatchupForm({...matchupForm, startTime: e.value as Date})} showTime hourFormat="24" />
                    </div>
                </div>
            </Dialog>

            <Dialog header={t('admin.form.enterResult')} visible={showScoreDialog} breakpoints={dialogBreakpoints} style={{ width: '400px' }} onHide={() => setShowScoreDialog(false)} footer={<div><Button label={t('admin.form.cancel')} icon="pi pi-times" onClick={() => setShowScoreDialog(false)} className="p-button-text" /><Button label={t('admin.form.submit')} icon="pi pi-check" onClick={submitScores} /></div>}>
                {currentMatchup && (
                    <div className="flex flex-col gap-8 py-6 text-center">
                        <div className="flex justify-between items-center">
                            <div className="flex flex-col items-center gap-4 w-5/12">
                                <img src={getLogoUrl(currentMatchup.awayTeam.logoUrl, '30')} className="w-8 h-8 object-contain" alt="logo" />
                                <span className="font-bold text-xs text-gray-500">{currentMatchup.awayTeam.name}</span>
                                <InputNumber value={awayScore} onValueChange={(e) => setAwayScore(e.value ?? 0)} min={0} inputClassName="text-center text-xl font-bold" />
                            </div>
                            <div className="text-xl font-bold text-gray-400">@</div>
                            <div className="flex flex-col items-center gap-4 w-5/12">
                                <img src={getLogoUrl(currentMatchup.homeTeam.logoUrl, '30')} className="w-8 h-8 object-contain" alt="logo" />
                                <span className="font-bold text-xs text-gray-500">{currentMatchup.homeTeam.name}</span>
                                <InputNumber value={homeScore} onValueChange={(e) => setHomeScore(e.value ?? 0)} min={0} inputClassName="text-center text-xl font-bold" />
                            </div>
                        </div>
                    </div>
                )}
            </Dialog>
        </div>
    );
};

export default Matchups;
