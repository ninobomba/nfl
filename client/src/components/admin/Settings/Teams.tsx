import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { TabView, TabPanel } from 'primereact/tabview';
import api from '../../../api/axios';
import type { Team } from '../types';
import { getLogoUrl } from '../../../utils/logoUtils';

interface TeamsProps {
    teams: Team[];
    token: string | null;
    fetchData: () => Promise<void>;
}

const Teams: React.FC<TeamsProps> = ({ teams, token, fetchData }) => {
    const { t } = useTranslation();
    const [showTeamDialog, setShowTeamDialog] = useState(false);
    const [currentTeam, setCurrentTeam] = useState<Team | null>(null);

    const dialogBreakpoints = { '960px': '75vw', '640px': '95vw' };
    const confOptions = [{ label: 'AFC', value: 'AFC' }, { label: 'NFC', value: 'NFC' }];
    const divOptions = [{ label: 'East', value: 'East' }, { label: 'North', value: 'North' }, { label: 'South', value: 'South' }, { label: 'West', value: 'West' }];

    const saveTeam = async () => {
        if (!currentTeam) return;
        try {
            await api.post('/api/admin/teams/update', currentTeam, { headers: { Authorization: `Bearer ${token}` } });
            setShowTeamDialog(false);
            fetchData();
        } catch (error) { console.error(error); }
    }

    const sortTeams = (teamList: Team[]) => {
        return [...teamList].sort((a, b) => {
            if (a.division !== b.division) {
                return a.division.localeCompare(b.division);
            }
            return a.city.localeCompare(b.city);
        });
    };

    const afcTeams = sortTeams(teams.filter(t => t.conference === 'AFC'));
    const nfcTeams = sortTeams(teams.filter(t => t.conference === 'NFC'));

    const renderTeamTable = (data: Team[]) => (
        <div className="w-fit mx-auto shadow-10 rounded-3xl overflow-hidden border-0 bg-gray-900 bg-opacity-20">
            <DataTable value={data} stripedRows rowHover responsiveLayout="scroll">
                <Column header="" body={(row) => <div className="py-6 px-8"><img src={getLogoUrl(row.logoUrl, '30')} className="w-8 h-8 object-contain transition-transform hover:scale-110" alt="logo" /></div>} align="center"></Column>
                <Column field="city" header={t('admin.city')} sortable className="text-sm font-bold px-8 text-gray-400"></Column>
                <Column field="name" header={t('admin.name')} sortable className="text-lg font-black  tracking-widest text-primary px-8"></Column>
                <Column field="conference" header={t('admin.conf')} sortable align="center" className="text-sm font-black px-8"></Column>
                <Column field="division" header={t('admin.div')} sortable align="center" className="text-sm font-black px-8"></Column>
                <Column header="" body={(row) => <div className="py-6 px-8"><Button icon="pi pi-pencil" rounded text severity="secondary" onClick={() => { setCurrentTeam(row); setShowTeamDialog(true); }} className="shadow-2 scale-150" /></div>} align="center"></Column>
            </DataTable>
        </div>
    );

    return (
        <div className="py-8 flex flex-col items-center w-full">
            <TabView className="w-full max-w-6xl">
                <TabPanel header="AFC" leftIcon="pi pi-star-fill mr-2 text-red-500">
                    <div className="py-8">
                        {renderTeamTable(afcTeams)}
                    </div>
                </TabPanel>
                <TabPanel header="NFC" leftIcon="pi pi-star-fill mr-2 text-blue-500">
                    <div className="py-8">
                        {renderTeamTable(nfcTeams)}
                    </div>
                </TabPanel>
            </TabView>

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
        </div>
    );
};

export default Teams;