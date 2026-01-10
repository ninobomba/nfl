import { useEffect, useState, useRef, useCallback } from 'react';
import api from '../api/axios';
import { useAppSelector } from '../store/hooks';
import { Toast } from 'primereact/toast';
import { TabView, TabPanel } from 'primereact/tabview';
import { Card } from 'primereact/card';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { useTranslation } from 'react-i18next';

import Overview from '../components/admin/Overview/Overview';
import Settings from '../components/admin/Settings/Settings';
import type {Matchup, User, Team, AuditLog} from '../components/admin/types';

const Admin = () => {
  const [matchups, setMatchups] = useState<Matchup[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<string>('lara-dark-blue');
  
  const { t } = useTranslation();
  const { token } = useAppSelector((state) => state.auth);
  const toast = useRef<Toast>(null);

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
    fetchData();
  }, [fetchData]);

  return (
    <div className="max-w-7xl mx-auto mt-4 md:mt-12 px-2 md:px-4 pb-20 font-comfortaa flex flex-col items-center">
      <Toast ref={toast} />
      <ConfirmDialog />

      <Card title={t('admin.panel')} subTitle={t('admin.manage')} className="w-full border-0 shadow-10 overflow-hidden rounded-3xl p-2 bg-surface-card text-center">
        <TabView>
            <TabPanel header={t('admin.overview')} leftIcon="pi pi-chart-bar mr-3 font-bold">
                <Overview matchups={matchups} users={users} />
            </TabPanel>

            <TabPanel header={t('admin.settings')} leftIcon="pi pi-cog mr-3 font-bold">
                <Settings 
                    matchups={matchups} 
                    teams={teams} 
                    users={users} 
                    auditLogs={auditLogs} 
                    selectedTheme={selectedTheme} 
                    setSelectedTheme={setSelectedTheme} 
                    token={token} 
                    fetchData={fetchData} 
                    toast={toast} 
                />
            </TabPanel>
        </TabView>
      </Card>
    </div>
  );
};

export default Admin;
