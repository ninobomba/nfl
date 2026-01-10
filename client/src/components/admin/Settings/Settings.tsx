import React from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import { useTranslation } from 'react-i18next';
import Matchups from './Matchups';
import Teams from './Teams';
import Users from './Users';
import Logs from './Logs';
import Theme from './Theme';
import type { Matchup, Team, User, AuditLog } from '../types';

interface SettingsProps {
    matchups: Matchup[];
    teams: Team[];
    users: User[];
    auditLogs: AuditLog[];
    selectedTheme: string;
    setSelectedTheme: (theme: string) => void;
    token: string | null;
    fetchData: () => Promise<void>;
    toast: React.RefObject<any>;
}

const Settings: React.FC<SettingsProps> = ({ 
    matchups, teams, users, auditLogs, selectedTheme, setSelectedTheme, token, fetchData, toast 
}) => {
    const { t } = useTranslation();

    return (
        <div className="py-4">
            <TabView className="p-tabs-custom">
                <TabPanel header={t('admin.tabGames')} leftIcon="pi pi-calendar mr-2 font-bold ">
                    <Matchups matchups={matchups} teams={teams} token={token} fetchData={fetchData} toast={toast} />
                </TabPanel>

                <TabPanel header={t('admin.tabTeams')} leftIcon="pi pi-briefcase mr-2 font-bold">
                    <Teams teams={teams} token={token} fetchData={fetchData} />
                </TabPanel>

                <TabPanel header={t('admin.tabUsers')} leftIcon="pi pi-users mr-2 font-bold">
                    <Users users={users} token={token} fetchData={fetchData} toast={toast} />
                </TabPanel>

                <TabPanel header={t('admin.tabLogs')} leftIcon="pi pi-history mr-2 font-bold">
                    <Logs auditLogs={auditLogs} />
                </TabPanel>

                <TabPanel header={t('admin.tabTheme')} leftIcon="pi pi-palette mr-2 font-bold">
                    <Theme selectedTheme={selectedTheme} setSelectedTheme={setSelectedTheme} token={token} />
                </TabPanel>
            </TabView>
        </div>
    );
};

export default Settings;
