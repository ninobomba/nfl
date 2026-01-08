import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
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

interface AuditLog {
    id: number;
    action: string;
    details: string;
    createdAt: string;
    user: { username: string } | null;
}

const emptyMatchup = {
    week: 1,
    stage: 'REGULAR',
    homeTeamId: 0,
    awayTeamId: 0,
    startTime: new Date()
};

const Admin = () => {
  const [matchups, setMatchups] = useState<Matchup[]>([]);
  const [users, setUsers] = useState<any[]>([]);
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
      { label: 'Regular Season', value: 'REGULAR' },
      { label: 'Wild Card', value: 'WILDCARD' },
      { label: 'Divisional', value: 'DIVISIONAL' },
      { label: 'Conference', value: 'CONFERENCE' },
      { label: 'Super Bowl', value: 'SUPERBOWL' }
  ];

  const themeOptions = [
      { label: 'Lara Dark Blue', value: 'lara-dark-blue' },
      { label: 'Lara Dark Amber', value: 'lara-dark-amber' },
      { label: 'Lara Dark Cyan', value: 'lara-dark-cyan' },
      { label: 'Lara Dark Green', value: 'lara-dark-green' },
      { label: 'Lara Dark Indigo', value: 'lara-dark-indigo' },
      { label: 'Lara Dark Pink', value: 'lara-dark-pink' },
      { label: 'Lara Dark Purple', value: 'lara-dark-purple' },
      { label: 'Lara Dark Teal', value: 'lara-dark-teal' },
      { label: 'Lara Light Blue', value: 'lara-light-blue' },
      { label: 'Lara Light Amber', value: 'lara-light-amber' },
      { label: 'Lara Light Cyan', value: 'lara-light-cyan' },
      { label: 'Lara Light Green', value: 'lara-light-green' },
      { label: 'Lara Light Indigo', value: 'lara-light-indigo' },
      { label: 'Lara Light Pink', value: 'lara-light-pink' },
      { label: 'Lara Light Purple', value: 'lara-light-purple' },
      { label: 'Lara Light Teal', value: 'lara-light-teal' },
      { label: 'Bootstrap 4 Dark Blue', value: 'bootstrap4-dark-blue' },
      { label: 'Bootstrap 4 Dark Purple', value: 'bootstrap4-dark-purple' },
      { label: 'Bootstrap 4 Light Blue', value: 'bootstrap4-light-blue' },
      { label: 'Bootstrap 4 Light Purple', value: 'bootstrap4-light-purple' },
      { label: 'Material Design Dark Indigo', value: 'md-dark-indigo' },
      { label: 'Soho Dark', value: 'soho-dark' },
      { label: 'Viva Dark', value: 'viva-dark' },
      { label: 'Arya Blue', value: 'arya-blue' },
      { label: 'Vela Blue', value: 'vela-blue' },
      { label: 'Saga Blue', value: 'saga-blue' }
  ];

  const confOptions = [{ label: 'AFC', value: 'AFC' }, { label: 'NFC', value: 'NFC' }];
  const divOptions = [{ label: 'East', value: 'East' }, { label: 'North', value: 'North' }, { label: 'South', value: 'South' }, { label: 'West', value: 'West' }];

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [mRes, uRes, tRes, lRes, sRes] = await Promise.all([
          axios.get('http://localhost:3000/api/matchups', { headers }),
          axios.get('http://localhost:3000/api/admin/users', { headers }),
          axios.get('http://localhost:3000/api/teams', { headers }),
          axios.get('http://localhost:3000/api/admin/logs', { headers }),
          axios.get('http://localhost:3000/api/admin/settings', { headers })
      ]);
      setMatchups(mRes.data);
      setUsers(uRes.data);
      setTeams(tRes.data);
      setAuditLogs(lRes.data);
      if (sRes.data.theme) setSelectedTheme(sRes.data.theme);
    } catch (error) { console.error(error); }
  };

  useEffect(() => { fetchData(); }, [token]);

  const [showScoreDialog, setShowScoreDialog] = useState(false);
  const [showTeamDialog, setShowTeamDialog] = useState(false);
  const [showMatchupDialog, setShowMatchupDialog] = useState(false);
  const [currentMatchup, setCurrentMatchup] = useState<any>(null);
  const [currentTeam, setCurrentTeam] = useState<any>(null);
  const [homeScore, setHomeScore] = useState<number | null>(0);
  const [awayScore, setAwayScore] = useState<number | null>(0);
  const [matchupForm, setMatchupForm] = useState<any>(emptyMatchup);

  const saveMatchup = async () => {
      try {
          if (matchupForm.id) {
              await axios.put('http://localhost:3000/api/admin/matchups', matchupForm, { headers: { Authorization: `Bearer ${token}` } });
              toast.current?.show({severity:'success', summary: t('admin.success'), detail: t('admin.updated')});
          } else {
              await axios.post('http://localhost:3000/api/admin/matchups', matchupForm, { headers: { Authorization: `Bearer ${token}` } });
              toast.current?.show({severity:'success', summary: t('admin.success'), detail: t('admin.created')});
          }
          setShowMatchupDialog(false);
          fetchData();
      } catch (error: any) {
          let detail = error.response?.data?.message || 'Error';
          if (detail === 'SAME_TEAM_CONFLICT') detail = 'Un equipo no puede jugar contra sí mismo';
          if (detail === 'TEAM_ALREADY_SCHEDULED') detail = 'Uno de los equipos ya tiene un juego esta semana';
          toast.current?.show({severity:'error', summary: t('admin.error'), detail});
      }
  }

  const deleteMatchup = (id: number) => {
      confirmDialog({
          message: t('admin.confirmDelete'),
          header: 'Confirm',
          icon: 'pi pi-exclamation-triangle',
          acceptClassName: 'p-button-danger',
          accept: async () => {
              try {
                  await axios.delete(`http://localhost:3000/api/admin/matchups/${id}`, { headers: { Authorization: `Bearer ${token}` } });
                  fetchData();
              } catch (error) { console.error(error); }
          }
      });
  }

  const submitScores = async () => {
      if (!currentMatchup) return;
      try {
          await axios.post('http://localhost:3000/api/admin/simulate', { matchupId: currentMatchup.id, homeScore, awayScore }, { headers: { Authorization: `Bearer ${token}` } });
          setShowScoreDialog(false);
          fetchData();
      } catch (error) { console.error(error); }
  }

  const saveTeam = async () => {
      if (!currentTeam) return;
      try {
          await axios.post('http://localhost:3000/api/admin/teams/update', currentTeam, { headers: { Authorization: `Bearer ${token}` } });
          setShowTeamDialog(false);
          fetchData();
      } catch (error) { console.error(error); }
  }

  const clearSeason = async () => {
      confirmDialog({
          message: t('admin.confirmClear'),
          header: 'Confirm',
          icon: 'pi pi-trash',
          acceptClassName: 'p-button-danger',
          accept: async () => {
              try {
                  await axios.post('http://localhost:3000/api/admin/clear-schedule', {}, { headers: { Authorization: `Bearer ${token}` } });
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
                  <label className="font-bold text-xs uppercase text-gray-500">{t('admin.form.stage')}</label>
                  <Dropdown value={matchupForm.stage} options={stageOptions} onChange={(e) => setMatchupForm({...matchupForm, stage: e.value})} />
              </div>
              <div className="flex flex-col gap-4">
                  <label className="font-bold text-xs uppercase text-gray-500">{t('admin.form.week')}</label>
                  <InputNumber value={matchupForm.week} onValueChange={(e) => setMatchupForm({...matchupForm, week: e.value})} min={1} max={22} />
              </div>
              <div className="flex flex-col gap-4">
                  <label className="font-bold text-xs uppercase text-gray-500">{t('admin.form.away')}</label>
                  <Dropdown value={matchupForm.awayTeamId} options={teams.map(t => ({label: t.name, value: t.id}))} filter onChange={(e) => setMatchupForm({...matchupForm, awayTeamId: e.value})} placeholder={t('admin.form.away')} />
              </div>
              <div className="flex flex-col gap-4">
                  <label className="font-bold text-xs uppercase text-gray-500">{t('admin.form.home')}</label>
                  <Dropdown value={matchupForm.homeTeamId} options={teams.map(t => ({label: t.name, value: t.id}))} filter onChange={(e) => setMatchupForm({...matchupForm, homeTeamId: e.value})} placeholder={t('admin.form.home')} />
              </div>
              <div className="flex flex-col gap-4">
                  <label className="font-bold text-xs uppercase text-gray-500">{t('admin.form.date')}</label>
                  <Calendar value={matchupForm.startTime} onChange={(e) => setMatchupForm({...matchupForm, startTime: e.value as Date})} showTime hourFormat="24" />
              </div>
          </div>
      </Dialog>

      <Dialog header={t('admin.form.enterResult')} visible={showScoreDialog} breakpoints={dialogBreakpoints} style={{ width: '400px' }} onHide={() => setShowScoreDialog(false)} footer={<div><Button label={t('admin.form.cancel')} icon="pi pi-times" onClick={() => setShowScoreDialog(false)} className="p-button-text" /><Button label={t('admin.form.submit')} icon="pi pi-check" onClick={submitScores} /></div>}>
          {currentMatchup && (
              <div className="flex flex-col gap-8 py-6 text-center">
                  <div className="flex justify-between items-center">
                      <div className="flex flex-col items-center gap-4 w-5/12">
                          <img src={currentMatchup.awayTeam.logoUrl} className="w-12 h-12" />
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
                      <label className="font-bold text-xs uppercase text-gray-500">{t('admin.city')}</label>
                      <InputText value={currentTeam.city} onChange={(e) => setCurrentTeam({...currentTeam, city: e.target.value})} />
                  </div>
                  <div className="flex flex-col gap-4">
                      <label className="font-bold text-xs uppercase text-gray-500">{t('admin.name')}</label>
                      <InputText value={currentTeam.name} onChange={(e) => setCurrentTeam({...currentTeam, name: e.target.value})} />
                  </div>
                  <div className="flex flex-col gap-4">
                      <label className="font-bold text-xs uppercase text-gray-500">{t('admin.conf')}</label>
                      <Dropdown value={currentTeam.conference} options={confOptions} onChange={(e) => setCurrentTeam({...currentTeam, conference: e.value})} />
                  </div>
                  <div className="flex flex-col gap-4">
                      <label className="font-bold text-xs uppercase text-gray-500">{t('admin.div')}</label>
                      <Dropdown value={currentTeam.division} options={divOptions} onChange={(e) => setCurrentTeam({...currentTeam, division: e.value})} />
                  </div>
              </div>
          )}
      </Dialog>

      {/* DASHBOARD CARD */}
      <Card title={t('admin.panel')} subTitle={t('admin.manage')} className="w-full max-w-[1200px] border-none shadow-10 overflow-hidden rounded-3xl p-2 bg-surface-card text-center">
        <TabView>
            {/* TAB 1: OVERVIEW */}
            <TabPanel header="Overview" leftIcon="pi pi-chart-bar mr-3 font-bold">
                <div className="py-12 px-4 flex flex-col items-center">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 w-full max-w-[900px]">
                        <div className="bg-gray-900 bg-opacity-40 p-8 rounded-3xl border-l-4 border-primary shadow-xl">
                            <span className="text-xs font-black text-gray-500 tracking-widest uppercase">Total Matchups</span>
                            <div className="text-5xl font-black mt-4 text-white">{matchups.length}</div>
                        </div>
                        <div className="bg-gray-900 bg-opacity-40 p-8 rounded-3xl border-l-4 border-green-500 shadow-xl">
                            <span className="text-xs font-black text-gray-500 tracking-widest uppercase">Finished Games</span>
                            <div className="text-5xl font-black mt-4 text-green-500">{matchups.filter(m => m.isFinished).length}</div>
                        </div>
                        <div className="bg-gray-900 bg-opacity-40 p-8 rounded-3xl border-l-4 border-yellow-500 shadow-xl">
                            <span className="text-xs font-black text-gray-500 tracking-widest uppercase">Active Users</span>
                            <div className="text-5xl font-black mt-4 text-yellow-500">{users.filter(u => u.isActive).length}</div>
                        </div>
                    </div>
                </div>
            </TabPanel>

            {/* TAB 2: MATCHUPS (CRUD INCLUDED HERE) */}
            <TabPanel header={t('admin.tabGames')} leftIcon="pi pi-calendar mr-3 font-bold">
                <div className="py-8 flex flex-col items-center">
                    <div className="w-full max-w-[900px] mx-auto">
                        {/* Toolbar MOVIDA AQUÍ */}
                        <Toolbar start={(
                            <div className="flex flex-wrap gap-2">
                                <Button label={t('admin.newGame')} icon="pi pi-plus" severity="success" size="small" className="font-black" onClick={() => { setMatchupForm(emptyMatchup); setShowMatchupDialog(true); }} />
                                <Button label={t('admin.clearAll')} icon="pi pi-trash" severity="danger" size="small" className="font-black" onClick={clearSeason} />
                            </div>
                        )} className="mb-6 p-3 surface-card border-gray-800 rounded-xl shadow-2" />
                        
                        <div className="flex flex-wrap gap-6 items-center bg-gray-800 bg-opacity-20 p-6 rounded-2xl mb-10 border-1 border-gray-800 shadow-inner mx-auto">
                            <div className="flex items-center gap-4">
                                <span className="font-black text-xs text-gray-500 uppercase tracking-widest">{t('admin.form.stage')}:</span>
                                <Dropdown value={adminSelectedStage} options={stageOptions} onChange={(e) => setAdminSelectedStage(e.value)} className="p-inputtext-sm w-14rem font-black" />
                            </div>
                            {adminSelectedStage === 'REGULAR' && (
                                <div className="flex items-center gap-4">
                                    <span className="font-black text-xs text-gray-500 uppercase tracking-widest">{t('admin.form.week')}:</span>
                                    <Dropdown value={adminSelectedWeek} options={weekOptions} onChange={(e) => setAdminSelectedWeek(e.value)} className="p-inputtext-sm w-12rem font-black" />
                                </div>
                            )}
                            <div className="ml-auto hidden lg:block">
                                <Tag value={`${filteredMatchups.length} / 18 Games`} severity={filteredMatchups.length >= 18 ? 'danger' : 'info'} className="px-5 py-2 font-black shadow-4" />
                            </div>
                        </div>
                    </div>

                    <div className="w-fit mx-auto shadow-10 rounded-2xl overflow-hidden border-1 border-gray-800 bg-gray-900 bg-opacity-20">
                        <DataTable value={filteredMatchups} stripedRows rowHover responsiveLayout="scroll">
                            <Column header="#" body={(_row, options) => <span className="text-gray-600 font-black text-xs px-2">{options.rowIndex + 1}</span>} align="center" headerClassName="justify-content-center"></Column>
                            
                            {/* Away Team: 2 columns */}
                            <Column header="" body={(row) => <div className="py-4 px-2"><img src={row.awayTeam.logoUrl} className="object-contain w-12 h-12" /></div>} align="right" headerClassName="justify-content-center"></Column>
                            <Column header={t('admin.form.away')} body={(row) => <span className="font-black text-sm uppercase tracking-widest px-2">{row.awayTeam.name}</span>} headerClassName="text-center"></Column>
                            
                            <Column header="" body={() => <span className="text-gray-700 text-xl font-black italic opacity-30 px-2">@</span>} align="center" headerClassName="text-center"></Column>
                            
                            {/* Home Team: 2 columns */}
                            <Column header={t('admin.form.home')} body={(row) => <span className="font-black text-sm uppercase tracking-widest px-2">{row.homeTeam.name}</span>} align="right" headerClassName="text-center"></Column>
                            <Column header="" body={(row) => <div className="py-4 px-2"><img src={row.homeTeam.logoUrl} className="object-contain w-12 h-12" /></div>} align="left" headerClassName="justify-content-center"></Column>
                            
                            <Column header={t('admin.status')} body={(row) => <div className="px-2">{row.isFinished ? <Tag severity="success" value={t('admin.finished')} className="text-[10px] font-black px-3" /> : <Tag severity="warning" value={t('admin.pending')} className="text-[10px] font-black px-3" />}</div>} align="center" headerClassName="text-center"></Column>
                            <Column header={t('admin.result')} body={(row) => <div className="px-4">{row.isFinished ? <span className="font-black text-primary text-2xl tracking-tighter">{row.awayScore} - {row.homeScore}</span> : <Button label="Score" icon="pi pi-pencil" size="small" severity="warning" text className="font-black text-xs" onClick={() => { setCurrentMatchup(row); setHomeScore(0); setAwayScore(0); setShowScoreDialog(true); }} />}</div>} align="center" headerClassName="text-center"></Column>
                            
                            <Column header="" align="center" body={(row) => (
                                <div className="flex gap-2 px-6 py-4">
                                    <Button icon="pi pi-pencil" rounded text severity="warning" onClick={() => { setMatchupForm({ ...row, startTime: new Date(row.startTime) }); setShowMatchupDialog(true); }} className="p-button-sm shadow-2" />
                                    <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => deleteMatchup(row.id)} className="p-button-sm shadow-2" />
                                </div>
                            )}></Column>
                        </DataTable>
                    </div>
                </div>
            </TabPanel>

            <TabPanel header={t('admin.tabTeams')} leftIcon="pi pi-briefcase mr-3 font-bold">
                <div className="py-12 flex flex-col items-center">
                    <div className="w-fit mx-auto shadow-10 rounded-2xl overflow-hidden border-1 border-gray-800 bg-gray-900 bg-opacity-20">
                        <DataTable value={teams} stripedRows rowHover paginator rows={15} sortField="conference" sortOrder={1} responsiveLayout="scroll">
                            <Column header="" body={(row) => <div className="py-4 px-6"><img src={row.logoUrl} className="w-12 h-12 object-contain" /></div>} align="center"></Column>
                            <Column field="city" header={t('admin.city')} sortable className="text-sm font-bold px-6"></Column>
                            <Column field="name" header={t('admin.name')} sortable className="text-sm font-black uppercase tracking-widest text-primary px-6"></Column>
                            <Column field="conference" header={t('admin.conf')} sortable align="center" className="text-sm font-black px-6"></Column>
                            <Column field="division" header={t('admin.div')} sortable align="center" className="text-sm font-black px-6"></Column>
                            <Column header="" body={(row) => <div className="py-4 px-6"><Button icon="pi pi-pencil" rounded text severity="secondary" onClick={() => { setCurrentTeam(row); setShowTeamDialog(true); }} className="shadow-2 scale-125" /></div>} align="center"></Column>
                        </DataTable>
                    </div>
                </div>
            </TabPanel>

            <TabPanel header={t('admin.tabUsers')} leftIcon="pi pi-users mr-3 font-bold">
                <div className="py-12 flex flex-col items-center">
                    <div className="w-fit mx-auto shadow-10 rounded-2xl overflow-hidden border-1 border-gray-800 bg-gray-900 bg-opacity-20">
                        <DataTable value={users} stripedRows rowHover paginator rows={15} responsiveLayout="scroll">
                            <Column field="username" header={t('landing.username')} sortable className="text-base font-black uppercase tracking-wider px-8 py-6"></Column>
                            <Column field="email" header="Email" className="text-sm font-medium px-8 py-6 text-gray-400"></Column>
                            <Column field="score" header="Points" sortable className="text-3xl font-black text-primary px-8 py-6" align="center"></Column>
                            <Column header="Status" body={(rowData) => (
                                <div className="flex items-center gap-6 px-8 py-6">
                                    <InputSwitch checked={rowData.isActive} onChange={() => {
                                        axios.post('http://localhost:3000/api/admin/users/toggle-status', { id: rowData.id, isActive: !rowData.isActive }, { headers: { Authorization: `Bearer ${token}` } })
                                            .then(() => fetchData());
                                    }} className="scale-125" />
                                    <Tag severity={rowData.isActive ? 'success' : 'danger'} value={rowData.isActive ? "ACTIVE" : "OFF"} className="text-[10px] font-black px-4 py-2 shadow-4" />
                                </div>
                            )} align="center"></Column>
                        </DataTable>
                    </div>
                </div>
            </TabPanel>

            <TabPanel header={t('admin.tabLogs')} leftIcon="pi pi-history mr-3 font-bold">
                <div className="py-12 flex flex-col items-center">
                    <div className="w-fit mx-auto shadow-10 rounded-2xl overflow-hidden border-1 border-gray-800 bg-gray-900 bg-opacity-20">
                        <DataTable value={auditLogs} stripedRows rowHover paginator rows={15} size="small">
                            <Column field="createdAt" header="Timestamp" body={(row) => new Date(row.createdAt).toLocaleString()} sortable className="text-xs font-bold px-6 py-4"></Column>
                            <Column field="user.username" header="User" body={(row) => row.user?.username || 'SYSTEM'} className="text-xs font-black text-primary px-6 py-4"></Column>
                            <Column field="action" header="Action" className="text-xs font-bold px-6 py-4"></Column>
                            <Column field="details" header="Details" className="text-xs text-gray-400 px-6 py-4"></Column>
                        </DataTable>
                    </div>
                </div>
            </TabPanel>

            <TabPanel header={t('admin.tabTheme')} leftIcon="pi pi-palette mr-3 font-bold">
                <div className="py-16 flex flex-col items-center">
                    <div className="w-full max-w-[600px] surface-card p-12 rounded-3xl shadow-10 border-1 border-gray-800 text-center">
                        <h3 className="text-2xl font-black uppercase italic tracking-tighter text-primary mb-8 border-bottom-1 border-gray-800 pb-4">Visual Configuration</h3>
                        <div className="flex flex-col gap-4">
                            <label className="font-black text-xs uppercase tracking-widest text-gray-500 mb-2">{t('admin.theme')}</label>
                            <Dropdown value={selectedTheme} options={themeOptions} onChange={(e) => {
                                setSelectedTheme(e.value);
                                axios.post('http://localhost:3000/api/admin/settings', { key: 'theme', value: e.value }, { headers: { Authorization: `Bearer ${token}` } });
                                (document.getElementById('app-theme') as HTMLLinkElement).href = `/themes/${e.value}/theme.css`;
                            }} className="w-full p-4 font-black shadow-4" />
                            <p className="text-xs text-gray-600 font-bold leading-relaxed mt-4">{t('admin.themeNote')}</p>
                        </div>
                    </div>
                </div>
            </TabPanel>
        </TabView>
      </Card>
    </div>
  );
};

export default Admin;
