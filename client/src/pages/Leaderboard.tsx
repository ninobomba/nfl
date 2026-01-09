import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAppSelector } from '../store/hooks';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import { TabView, TabPanel } from 'primereact/tabview';
import { Dropdown } from 'primereact/dropdown';
import { useTranslation } from 'react-i18next';
import { Tag } from 'primereact/tag';

interface UserScore {
  id: number;
  username: string;
  score: number;
}

interface WeeklyRanking {
    id: number;
    username: string;
    correctPicks: number;
    lastPickDate: string;
}

const Leaderboard = () => {
  const [users, setUsers] = useState<UserScore[]>([]);
  const [weeklyUsers, setWeeklyUsers] = useState<WeeklyRanking[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const { token } = useAppSelector((state) => state.auth);
  const { t } = useTranslation();

  const weekOptions = Array.from({ length: 18 }, (_, i) => ({ label: `${t('admin.form.week')} ${i + 1}`, value: i + 1 }));

  const fetchGlobal = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/picks/leaderboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (error) { console.error(error); }
  };

  const fetchWeekly = async () => {
      try {
          const response = await axios.get(`http://localhost:3000/api/picks/weekly?week=${selectedWeek}`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          setWeeklyUsers(response.data);
      } catch (error) { console.error(error); }
  }

  useEffect(() => {
    fetchGlobal();
  }, [token]);

  useEffect(() => {
      fetchWeekly();
  }, [token, selectedWeek]);

  return (
    <div className="max-w-6xl mx-auto mt-12 px-4 pb-12">
      <TabView className="shadow-4 rounded-xl overflow-hidden">
          {/* Pestaña Global */}
          <TabPanel header="Season Global Ranking" leftIcon="pi pi-globe mr-2">
              <div className="py-6 px-2">
                  <Card title={t('nav.leaderboard')} subTitle="Accumulated points through the entire season" className="border-none bg-transparent shadow-none">
                    <DataTable value={users} stripedRows responsiveLayout="scroll" paginator rows={10} rowHover size="small" className="mt-4">
                      <Column header="RANK" body={(_rowData, options) => <span className="font-black text-primary">{options.rowIndex + 1}</span>} style={{ width: '6rem' }} align="center"></Column>
                      <Column field="username" header={t('landing.username')} className="font-bold  tracking-widest text-sm"></Column>
                      <Column field="score" header="TOTAL POINTS" body={(row) => <span className="text-2xl font-black text-primary">{row.score}</span>} sortable align="right"></Column>
                    </DataTable>
                  </Card>
              </div>
          </TabPanel>

          {/* Pestaña Semanal */}
          <TabPanel header="Weekly Winners" leftIcon="pi pi-calendar-check mr-2">
              <div className="py-6 px-4">
                  <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-gray-800 bg-opacity-20 p-6 rounded-xl border-0 border-gray-700 gap-4">
                      <div>
                          <h2 className="text-2xl font-black  italic tracking-tighter text-primary">Weekly Challenge</h2>
                          <p className="text-sm text-gray-500 font-bold tracking-wider">Tie-breaker: First to submit wins.</p>
                      </div>
                      <div className="flex items-center gap-4">
                          <span className="font-bold text-xs  text-gray-400">Filter By:</span>
                          <Dropdown value={selectedWeek} options={weekOptions} onChange={(e) => setSelectedWeek(e.value)} className="w-12rem" />
                      </div>
                  </div>

                  <Card className="border-none shadow-none bg-transparent">
                    <DataTable value={weeklyUsers} stripedRows rowHover size="small" emptyMessage="No data recorded for this week." className="mt-2">
                      <Column header="RANK" body={(_row, options) => {
                          const isFirst = options.rowIndex === 0;
                          return (
                              <div className="flex items-center gap-3">
                                  <span className={`font-black ${isFirst ? 'text-2xl text-yellow-500' : 'text-gray-500'}`}>{options.rowIndex + 1}</span>
                                  {isFirst && <i className="pi pi-trophy text-2xl text-yellow-500 animate-pulse"></i>}
                              </div>
                          )
                      }} style={{ width: '8rem' }} align="center"></Column>
                      <Column field="username" header={t('landing.username')} className="font-bold  text-sm"></Column>
                      <Column field="correctPicks" header="CORRECT" align="center" className="font-black text-xl text-primary" style={{width: '8rem'}}></Column>
                      <Column field="lastPickDate" header="SUBMISSION TIME" body={(row) => (
                          <div className="flex flex-col">
                              <span className="text-xs font-bold text-gray-400">
                                  {new Date(row.lastPickDate).toLocaleDateString()}
                              </span>
                              <span className="text-[10px] text-gray-600 font-mono">
                                  {new Date(row.lastPickDate).toLocaleTimeString()}
                              </span>
                          </div>
                      )} style={{width: '12rem'}}></Column>
                      <Column header="STATUS" align="right" body={(_row, options) => (
                          options.rowIndex === 0 ? <Tag value="WINNER" severity="success" className="px-4 py-2 font-black italic tracking-widest" /> : null
                      )} style={{width: '10rem'}}></Column>
                    </DataTable>
                  </Card>
              </div>
          </TabPanel>
      </TabView>
    </div>
  );
};

export default Leaderboard;
