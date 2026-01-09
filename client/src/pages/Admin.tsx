import { useEffect, useState, useRef, useCallback } from 'react';
import api from '../api/axios';
import { useAppSelector } from '../store/hooks';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { Dropdown } from 'primereact/dropdown';
import { TabView, TabPanel } from 'primereact/tabview';
import { InputSwitch } from 'primereact/inputswitch';
import { Dialog } from 'primereact/dialog';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Card } from 'primereact/card';
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog';
import { useTranslation } from 'react-i18next';

interface Team {
  id: number;
  name: string;
  city: string;
  logoUrl: string;
  conference: string;
  division: string;
}

interface Matchup {
  id: number;
  week: number;
  stage: string;
  homeTeamId: number;
  awayTeamId: number;
  homeTeam: Team;
  awayTeam: Team;
  isFinished: boolean;
  winnerId: number | null;
  homeScore: number | null;
  awayScore: number | null;
  startTime: string;
}

interface MatchupForm {
    id?: number;
    week: number;
    stage: string;
    homeTeamId: number;
    awayTeamId: number;
    startTime: Date;
    homeTeam?: Team;
    awayTeam?: Team;
    isFinished?: boolean;
    winnerId?: number | null;
    homeScore?: number | null;
    awayScore?: number | null;
}

interface AuditLog {
    id: number;
    action: string;
    details: string;
    createdAt: string;
    user: { username: string } | null;
}

interface User {
  id: number;
  username: string;
  email: string;
  score: number;
  role: string;
  isActive: boolean;
  deletedAt: string | null;
  createdAt: string;
}

const emptyMatchup: MatchupForm = {
    week: 1,
    stage: 'REGULAR',
    homeTeamId: 0,
    awayTeamId: 0,
    startTime: new Date()
};

const Admin = () => {
  const [matchups, setMatchups] = useState<Matchup[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<string>('lara-dark-blue');
  const [adminSelectedWeek, setAdminSelectedWeek] = useState<number>(1);
  const [adminSelectedStage, setAdminSelectedStage] = useState<string>('REGULAR');
  
  const { t } = useTranslation();
  const { token } = useAppSelector((state) => state.auth);
  const toast = useRef<Toast>(null);

  const dialogBreakpoints = { '960px': '75vw', '640px': '95vw' };

  const stageOptions = [
      { label: t('admin.stages.regular'), value: 'REGULAR' },
      { label: t('admin.stages.wildcard'), value: 'WILDCARD' },
      { label: t('admin.stages.divisional'), value: 'DIVISIONAL' },
      { label: t('admin.stages.conference'), value: 'CONFERENCE' },
      { label: t('admin.stages.superbowl'), value: 'SUPERBOWL' }
  ];

  const themeOptions = [
      { label: 'Arya Blue', value: 'arya-blue' },
      { label: 'Arya Green', value: 'arya-green' },
      { label: 'Arya Orange', value: 'arya-orange' },
      { label: 'Arya Purple', value: 'arya-purple' },
      { label: 'Bootstrap 4 Dark Blue', value: 'bootstrap4-dark-blue' },
      { label: 'Bootstrap 4 Dark Purple', value: 'bootstrap4-dark-purple' },
      { label: 'Bootstrap 4 Light Blue', value: 'bootstrap4-light-blue' },
      { label: 'Bootstrap 4 Light Purple', value: 'bootstrap4-light-purple' },
      { label: 'Fluent Light', value: 'fluent-light' },
      { label: 'Lara Dark Amber', value: 'lara-dark-amber' },
      { label: 'Lara Dark Blue', value: 'lara-dark-blue' },
      { label: 'Lara Dark Cyan', value: 'lara-dark-cyan' },
      { label: 'Lara Dark Green', value: 'lara-dark-green' },
      { label: 'Lara Dark Indigo', value: 'lara-dark-indigo' },
      { label: 'Lara Dark Pink', value: 'lara-dark-pink' },
      { label: 'Lara Dark Purple', value: 'lara-dark-purple' },
      { label: 'Lara Dark Teal', value: 'lara-dark-teal' },
      { label: 'Lara Light Amber', value: 'lara-light-amber' },
      { label: 'Lara Light Blue', value: 'lara-light-blue' },
      { label: 'Lara Light Cyan', value: 'lara-light-cyan' },
      { label: 'Lara Light Green', value: 'lara-light-green' },
      { label: 'Lara Light Indigo', value: 'lara-light-indigo' },
      { label: 'Lara Light Pink', value: 'lara-light-pink' },
      { label: 'Lara Light Purple', value: 'lara-light-purple' },
      { label: 'Lara Light Teal', value: 'lara-light-teal' },
      { label: 'Luna Amber', value: 'luna-amber' },
      { label: 'Luna Blue', value: 'luna-blue' },
      { label: 'Luna Green', value: 'luna-green' },
      { label: 'Luna Pink', value: 'luna-pink' },
      { label: 'Material Design Dark Deep Purple', value: 'md-dark-deeppurple' },
      { label: 'Material Design Dark Indigo', value: 'md-dark-indigo' },
      { label: 'Material Design Light Deep Purple', value: 'md-light-deeppurple' },
      { label: 'Material Design Light Indigo', value: 'md-light-indigo' },
      { label: 'Material Design Compact Dark Deep Purple', value: 'mdc-dark-deeppurple' },
      { label: 'Material Design Compact Dark Indigo', value: 'mdc-dark-indigo' },
      { label: 'Material Design Compact Light Deep Purple', value: 'mdc-light-deeppurple' },
      { label: 'Material Design Compact Light Indigo', value: 'mdc-light-indigo' },
      { label: 'Mira', value: 'mira' },
      { label: 'Nano', value: 'nano' },
      { label: 'Nova', value: 'nova' },
      { label: 'Nova Accent', value: 'nova-accent' },
      { label: 'Nova Alt', value: 'nova-alt' },
      { label: 'Rhea', value: 'rhea' },
      { label: 'Saga Blue', value: 'saga-blue' },
      { label: 'Saga Green', value: 'saga-green' },
      { label: 'Saga Orange', value: 'saga-orange' },
      { label: 'Saga Purple', value: 'saga-purple' },
      { label: 'Soho Dark', value: 'soho-dark' },
      { label: 'Soho Light', value: 'soho-light' },
      { label: 'Tailwind Light', value: 'tailwind-light' },
      { label: 'Vela Blue', value: 'vela-blue' },
      { label: 'Vela Green', value: 'vela-green' },
      { label: 'Vela Orange', value: 'vela-orange' },
      { label: 'Vela Purple', value: 'vela-purple' },
      { label: 'Viva Dark', value: 'viva-dark' },
      { label: 'Viva Light', value: 'viva-light' }
  ];

  const confOptions = [{ label: 'AFC', value: 'AFC' }, { label: 'NFC', value: 'NFC' }];
  const divOptions = [{ label: 'East', value: 'East' }, { label: 'North', value: 'North' }, { label: 'South', value: 'South' }, { label: 'West', value: 'West' }];

  const fetchData = useCallback(async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [mRes, uRes, tRes, lRes, sRes] = await Promise.all([
          api.get('/api/matchups', { headers }),
          api.get('/api/admin/users', { headers }),
          api.get('/api/teams', { headers }),
          api.get('/api/admin/logs', { headers }),
          api.get('/api/admin/settings', { headers })
      ]);
      setMatchups(mRes.data);
      setUsers(uRes.data);
      setTeams(tRes.data);
      setAuditLogs(lRes.data);
      if (sRes.data.theme) setSelectedTheme(sRes.data.theme);
    } catch (error) { console.error(error); }
  }, [token]);

  useEffect(() => {
    const run = async () => {
        await fetchData();
    };
    run();
  }, [fetchData]);

  const [showScoreDialog, setShowScoreDialog] = useState(false);
  const [showTeamDialog, setShowTeamDialog] = useState(false);
  const [showMatchupDialog, setShowMatchupDialog] = useState(false);
  const [currentMatchup, setCurrentMatchup] = useState<Matchup | null>(null);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [homeScore, setHomeScore] = useState<number | null>(0);
  const [awayScore, setAwayScore] = useState<number | null>(0);
  const [matchupForm, setMatchupForm] = useState<MatchupForm>(emptyMatchup);

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
      } catch (error: unknown) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let detail = (error as any).response?.data?.message || t('admin.errors.default');
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

  const saveTeam = async () => {
      if (!currentTeam) return;
      try {
          await api.post('/api/admin/teams/update', currentTeam, { headers: { Authorization: `Bearer ${token}` } });
          setShowTeamDialog(false);
          fetchData();
      } catch (error) { console.error(error); }
  }

  const handleDeleteUser = (id: number, type: 'soft' | 'hard') => {
    confirmDialog({
        message: type === 'soft' ? t('admin.confirmSoftDelete') : t('admin.confirmHardDelete'),
        header: t('admin.confirm.title'),
        icon: 'pi pi-exclamation-triangle',
        acceptClassName: type === 'hard' ? 'p-button-danger' : 'p-button-warning',
        accept: async () => {
            try {
                await api.delete(`/api/admin/users/${id}?type=${type}`, { headers: { Authorization: `Bearer ${token}` } });
                toast.current?.show({severity:'success', summary: t('admin.success'), detail: t('admin.userDeleted')});
                fetchData();
            } catch (error) { console.error(error); }
        }
    });
  }

  const filteredMatchups = matchups.filter(m => m.week === adminSelectedWeek && m.stage === adminSelectedStage);
  const weekOptions = Array.from({ length: 18 }, (_, i) => ({ label: `${t('admin.form.week')} ${i + 1}`, value: i + 1 }));

  return (
    <div className="max-w-7xl mx-auto mt-4 md:mt-12 px-2 md:px-4 pb-20 font-comfortaa flex flex-col items-center">
      <Toast ref={toast} />
      <ConfirmDialog />

      {/* DIALOGS */}
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
                          <img src={currentMatchup.awayTeam.logoUrl} className="w-12 h-12"  alt="logo"/>
                          <span className="font-bold text-xs text-gray-500">{currentMatchup.awayTeam.name}</span>
                          <InputNumber value={awayScore} onValueChange={(e) => setAwayScore(e.value ?? 0)} min={0} inputClassName="text-center text-xl font-bold" />
                      </div>
                      <div className="text-xl font-bold text-gray-400">@</div>
                      <div className="flex flex-col items-center gap-4 w-5/12">
                          <img src={currentMatchup.homeTeam.logoUrl} className="w-12 h-12" />
                          <span className="font-bold text-xs text-gray-500">{currentMatchup.homeTeam.name}</span>
                          <InputNumber value={homeScore} onValueChange={(e) => setHomeScore(e.value ?? 0)} min={0} inputClassName="text-center text-xl font-bold" />
                      </div>
                  </div>
              </div>
          )}
      </Dialog>

      <Dialog header={t('admin.editTeam')} visible={showTeamDialog} breakpoints={dialogBreakpoints} style={{ width: '400px' }} onHide={() => setShowTeamDialog(false)} footer={<div><Button label={t('admin.form.cancel')} icon="pi pi-times" onClick={() => setShowTeamDialog(false)} className="p-button-text" /><Button label={t('admin.form.save')} icon="pi pi-check" onClick={saveTeam} /></div>}>
          {currentTeam && (
              <div className="flex flex-col gap-6 py-4 p-fluid">
                  <div className="flex flex-col gap-4">
                      <label className="font-bold text-xs text-gray-500">{t('admin.city')}</label>
                      <InputText value={currentTeam.city} onChange={(e) => setCurrentTeam({...currentTeam, city: e.target.value})} />
                  </div>
                  <div className="flex flex-col gap-4">
                      <label className="font-bold text-xs text-gray-500">{t('admin.name')}</label>
                      <InputText value={currentTeam.name} onChange={(e) => setCurrentTeam({...currentTeam, name: e.target.value})} />
                  </div>
                  <div className="flex flex-col gap-4">
                      <label className="font-bold text-xs text-gray-500">{t('admin.conf')}</label>
                      <Dropdown value={currentTeam.conference} options={confOptions} onChange={(e) => setCurrentTeam({...currentTeam, conference: e.value})} />
                  </div>
                  <div className="flex flex-col gap-4">
                      <label className="font-bold text-xs text-gray-500">{t('admin.div')}</label>
                      <Dropdown value={currentTeam.division} options={divOptions} onChange={(e) => setCurrentTeam({...currentTeam, division: e.value})} />
                  </div>
              </div>
          )}
      </Dialog>

      {/* ADMIN CONTENT */}
      <Card title={t('admin.panel')} subTitle={t('admin.manage')} className="w-full border-0 shadow-10 overflow-hidden rounded-3xl p-2 bg-surface-card text-center">
        <TabView>
            {/* TAB 1: OVERVIEW - REDISEÑADO */}
            <TabPanel header={t('admin.overview')} leftIcon="pi pi-chart-bar mr-3 font-bold">
                <div className="py-16 px-4 flex flex-col items-center animate-fadein">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 w-full max-w-[1000px]">
                        <div className="surface-card p-10 rounded-[2rem] border-l-8 border-primary shadow-xl flex flex-col items-center transition-all hover:scale-105">
                            <div className="bg-primary bg-opacity-10 p-4 rounded-full mb-4">
                                <i className="pi pi-calendar text-3xl text-primary"></i>
                            </div>
                            <span className="text-xs font-black text-gray-500 tracking-[0.2em] ">{t('admin.stats.totalMatchups')}</span>
                            <div className="text-6xl font-black mt-4 text-white tracking-tighter">{matchups.length}</div>
                        </div>
                        
                        <div className="surface-card p-10 rounded-[2rem] border-l-8 border-green-500 shadow-xl flex flex-col items-center transition-all hover:scale-105">
                            <div className="bg-green-500 bg-opacity-10 p-4 rounded-full mb-4">
                                <i className="pi pi-check-circle text-3xl text-green-500"></i>
                            </div>
                            <span className="text-xs font-black text-gray-500 tracking-[0.2em] ">{t('admin.stats.finishedGames')}</span>
                            <div className="text-6xl font-black mt-4 text-green-500 tracking-tighter">{matchups.filter(m => m.isFinished).length}</div>
                        </div>

                        <div className="surface-card p-10 rounded-[2rem] border-l-8 border-yellow-500 shadow-xl flex flex-col items-center transition-all hover:scale-105">
                            <div className="bg-yellow-500 bg-opacity-10 p-4 rounded-full mb-4">
                                <i className="pi pi-users text-3xl text-yellow-500"></i>
                            </div>
                            <span className="text-xs font-black text-gray-500 tracking-[0.2em] ">{t('admin.stats.activeUsers')}</span>
                            <div className="text-6xl font-black mt-4 text-yellow-500 tracking-tighter">{users.filter(u => u.isActive).length}</div>
                        </div>
                    </div>
                    <div className="mt-12 text-gray-600 font-bold italic opacity-40 text-sm tracking-widest ">
                        <i className="pi pi-spin pi-spinner mr-2"></i> {t('admin.stats.realTime')}
                    </div>
                </div>
            </TabPanel>

            {/* TAB 2: SETTINGS (Sub-Tabs) */}
            <TabPanel header={t('admin.settings')} leftIcon="pi pi-cog mr-3 font-bold">
                <div className="py-4">
                    <TabView className="p-tabs-custom">
                        <TabPanel header={t('admin.tabGames')} leftIcon="pi pi-calendar mr-2 font-bold ">
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
                                        <Column header="" body={(row) => <div className="py-6 px-4"><img src={row.awayTeam.logoUrl} className="object-contain w-14 h-14 transition-transform hover:scale-110" /></div>} align="right" headerClassName="justify-content-center"></Column>
                                        <Column header={t('admin.form.away')} body={(row) => <span className="font-black text-sm  tracking-widest px-4 text-white">{row.awayTeam.name}</span>} headerClassName="text-center"></Column>
                                        <Column header="" body={() => <span className="text-gray-700 text-2xl font-black italic opacity-20 px-4">@</span>} align="center" headerClassName="text-center"></Column>
                                        <Column header={t('admin.form.home')} body={(row) => <span className="font-black text-sm  tracking-widest px-4 text-white">{row.homeTeam.name}</span>} align="right" headerClassName="text-center"></Column>
                                        <Column header="" body={(row) => <div className="py-6 px-4"><img src={row.homeTeam.logoUrl} className="object-contain w-14 h-14 transition-transform hover:scale-110" /></div>} align="left" headerClassName="justify-content-center"></Column>
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
                            </div>
                        </TabPanel>

                        <TabPanel header={t('admin.tabTeams')} leftIcon="pi pi-briefcase mr-2 font-bold">
                            <div className="py-12 flex flex-col items-center">
                                <div className="w-fit mx-auto shadow-10 rounded-3xl overflow-hidden border-0 bg-gray-900 bg-opacity-20">
                                    <DataTable value={teams} stripedRows rowHover paginator rows={15} sortField="conference" sortOrder={1} responsiveLayout="scroll">
                                        <Column header="" body={(row) => <div className="py-6 px-8"><img src={row.logoUrl} className="w-14 h-14 object-contain transition-transform hover:scale-110" /></div>} align="center"></Column>
                                        <Column field="city" header={t('admin.city')} sortable className="text-sm font-bold px-8 text-gray-400"></Column>
                                        <Column field="name" header={t('admin.name')} sortable className="text-lg font-black  tracking-widest text-primary px-8"></Column>
                                        <Column field="conference" header={t('admin.conf')} sortable align="center" className="text-sm font-black px-8"></Column>
                                        <Column field="division" header={t('admin.div')} sortable align="center" className="text-sm font-black px-8"></Column>
                                        <Column header="" body={(row) => <div className="py-6 px-8"><Button icon="pi pi-pencil" rounded text severity="secondary" onClick={() => { setCurrentTeam(row); setShowTeamDialog(true); }} className="shadow-2 scale-150" /></div>} align="center"></Column>
                                    </DataTable>
                                </div>
                            </div>
                        </TabPanel>

                        <TabPanel header={t('admin.tabUsers')} leftIcon="pi pi-users mr-2 font-bold">
                            <div className="py-12 flex flex-col items-center">
                                <div className="w-fit mx-auto shadow-10 rounded-3xl overflow-hidden border-0 bg-gray-900 bg-opacity-20">
                                    <DataTable value={users} stripedRows rowHover paginator rows={15} responsiveLayout="scroll">
                                        <Column field="username" header={t('landing.username')} sortable className="text-lg font-black  tracking-wider px-10 py-8"></Column>
                                        <Column field="email" header="Email" className="text-sm font-medium px-10 py-8 text-gray-400"></Column>
                                        <Column field="score" header="Points" sortable className="text-4xl font-black text-primary px-10 py-8" align="center"></Column>
                                        <Column header="Status" body={(rowData: User) => (
                                            <div className="flex items-center gap-8 px-10 py-8">
                                                <InputSwitch checked={rowData.isActive} disabled={!!rowData.deletedAt} onChange={(e) => {
                                                    api.post('/api/admin/users/toggle-status', { id: rowData.id, isActive: e.value }, { headers: { Authorization: `Bearer ${token}` } })
                                                        .then(() => fetchData());
                                                }} />
                                                <Tag severity={rowData.deletedAt ? 'danger' : (rowData.isActive ? 'success' : 'warning')} 
                                                     value={rowData.deletedAt ? t('admin.userStatus.deleted') : (rowData.isActive ? t('admin.userStatus.active') : t('admin.userStatus.off'))} 
                                                     className="text-[10px] font-black px-5 py-3 shadow-6" />
                                            </div>
                                        )} align="center"></Column>
                                        <Column header="Actions" body={(rowData: User) => (
                                            <div className="flex gap-3 px-10 py-8">
                                                {!rowData.deletedAt && (
                                                    <Button icon="pi pi-user-minus" rounded text severity="warning" tooltip={t('admin.softDelete')} onClick={() => handleDeleteUser(rowData.id, 'soft')} />
                                                )}
                                                <Button icon="pi pi-user-times" rounded text severity="danger" tooltip={t('admin.hardDelete')} onClick={() => handleDeleteUser(rowData.id, 'hard')} />
                                            </div>
                                        )} align="center"></Column>
                                    </DataTable>
                                </div>
                            </div>
                        </TabPanel>

                        <TabPanel header={t('admin.tabLogs')} leftIcon="pi pi-history mr-2 font-bold">
                            <div className="py-12 flex flex-col items-center">
                                <div className="w-fit mx-auto shadow-10 rounded-3xl overflow-hidden border-0 bg-gray-900 bg-opacity-20">
                                    <DataTable value={auditLogs} stripedRows rowHover paginator rows={15}>
                                        <Column field="createdAt" header="Timestamp" body={(row) => <div className="py-4 px-6 text-xs font-bold text-gray-400">{new Date(row.createdAt).toLocaleString()}</div>} sortable></Column>
                                        <Column field="user.username" header="User" body={(row) => <div className="py-4 px-6 text-sm font-black text-primary  tracking-widest">{row.user?.username || 'SYSTEM'}</div>}></Column>
                                        <Column field="action" header="Action" body={(row) => <div className="py-4 px-6 text-xs font-black">{row.action}</div>}></Column>
                                        <Column field="details" header="Details" body={(row) => <div className="py-4 px-6 text-xs text-gray-500 italic">{row.details}</div>}></Column>
                                    </DataTable>
                                </div>
                            </div>
                        </TabPanel>

                        <TabPanel header={t('admin.tabTheme')} leftIcon="pi pi-palette mr-2 font-bold">
                            <div className="py-20 flex flex-col items-center animate-fadein">
                                <div className="w-full max-w-[650px] surface-card p-16 rounded-[3rem] shadow-10 border-0 text-center">
                                    <div className="bg-primary bg-opacity-10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8">
                                        <i className="pi pi-palette text-4xl text-primary"></i>
                                    </div>
                                    <h3 className="text-3xl font-black italic text-primary mb-10 tracking-tighter">{t('admin.tabTheme')}</h3>
                                    <div className="flex flex-col gap-6 text-left p-fluid">
                                        <label className="font-black text-xs text-gray-500 tracking-[0.3em]  pl-2">{t('admin.theme')}</label>
                                        <Dropdown value={selectedTheme} options={themeOptions} onChange={(e) => {
                                            setSelectedTheme(e.value);
                                            api.post('/api/admin/settings', { key: 'theme', value: e.value }, { headers: { Authorization: `Bearer ${token}` } });
                                            (document.getElementById('app-theme') as HTMLLinkElement).href = `/themes/${e.value}/theme.css`;
                                        }} className="w-full p-4 font-black shadow-8 rounded-2xl bg-gray-900 border-none" />
                                        <p className="text-xs text-gray-600 font-bold leading-relaxed mt-6 px-4 text-center italic">{t('admin.themeNote')}</p>
                                    </div>
                                </div>
                            </div>
                        </TabPanel>
                    </TabView>
                </div>
            </TabPanel>
        </TabView>
      </Card>
    </div>
  );
};

export default Admin;