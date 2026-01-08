import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useAppSelector } from '../store/hooks';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import { Toolbar } from 'primereact/toolbar';
import { Dropdown } from 'primereact/dropdown';
import { TabView, TabPanel } from 'primereact/tabview';
import { InputSwitch } from 'primereact/inputswitch';
import { Dialog } from 'primereact/dialog';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
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
  const [selectedTheme, setSelectedTheme] = useState<string>('lara-dark-blue');
  const [adminSelectedWeek, setAdminSelectedWeek] = useState<number>(1);
  const [adminSelectedStage, setAdminSelectedStage] = useState<string>('REGULAR');
  const { t } = useTranslation();
  
  const [showScoreDialog, setShowScoreDialog] = useState(false);
  const [showTeamDialog, setShowTeamDialog] = useState(false);
  const [showMatchupDialog, setShowMatchupDialog] = useState(false);
  
  const [currentMatchup, setCurrentMatchup] = useState<any>(null);
  const [currentTeam, setCurrentTeam] = useState<any>(null);
  const [homeScore, setHomeScore] = useState<number | null>(0);
  const [awayScore, setAwayScore] = useState<number | null>(0);
  const [matchupForm, setMatchupForm] = useState<any>(emptyMatchup);

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
      { label: 'Lara Light Blue', value: 'lara-light-blue' },
      { label: 'Bootstrap 4 Dark Blue', value: 'bootstrap4-dark-blue' },
      { label: 'Material Design', value: 'md-dark-indigo' }
  ];

  const confOptions = [{ label: 'AFC', value: 'AFC' }, { label: 'NFC', value: 'NFC' }];
  const divOptions = [{ label: 'East', value: 'East' }, { label: 'North', value: 'North' }, { label: 'South', value: 'South' }, { label: 'West', value: 'West' }];

  const fetchMatchups = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/matchups', { headers: { Authorization: `Bearer ${token}` } });
      setMatchups(response.data);
    } catch (error) { console.error(error); }
  };

  const fetchUsers = async () => {
      try {
          const response = await axios.get('http://localhost:3000/api/admin/users', { headers: { Authorization: `Bearer ${token}` } });
          setUsers(response.data);
      } catch (error) { console.error(error); }
  }

  const fetchTeams = async () => {
      try {
          const response = await axios.get('http://localhost:3000/api/teams', { headers: { Authorization: `Bearer ${token}` } });
          setTeams(response.data);
      } catch (error) { console.error(error); }
  }

  const fetchSettings = async () => {
      try {
          const response = await axios.get('http://localhost:3000/api/admin/settings', { headers: { Authorization: `Bearer ${token}` } });
          if (response.data.theme) setSelectedTheme(response.data.theme);
      } catch (error) { console.error(error); }
  }

  useEffect(() => {
    fetchMatchups();
    fetchUsers();
    fetchTeams();
    fetchSettings();
  }, [token]);

  const saveMatchup = async () => {
      try {
          if (matchupForm.id) {
              await axios.put('http://localhost:3000/api/admin/matchups', matchupForm, { headers: { Authorization: `Bearer ${token}` } });
              toast.current?.show({severity:'success', summary: t('admin.success'), detail: t('admin.updated'), life: 3000});
          } else {
              await axios.post('http://localhost:3000/api/admin/matchups', matchupForm, { headers: { Authorization: `Bearer ${token}` } });
              toast.current?.show({severity:'success', summary: t('admin.success'), detail: t('admin.created'), life: 3000});
          }
          setShowMatchupDialog(false);
          fetchMatchups();
      } catch (error: any) {
          let detail = error.response?.data?.message || 'Error';
          if (detail === 'SAME_TEAM_CONFLICT') detail = 'Un equipo no puede jugar contra sí mismo';
          if (detail === 'TEAM_ALREADY_SCHEDULED') detail = 'Uno de los equipos ya tiene un juego esta semana';
          
          toast.current?.show({severity:'error', summary: t('admin.error'), detail: detail, life: 5000});
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
                  toast.current?.show({severity:'success', summary: t('admin.success'), detail: t('admin.deleted'), life: 3000});
                  fetchMatchups();
              } catch (error) { console.error(error); }
          }
      });
  }

  const submitScores = async () => {
      if (!currentMatchup) return;
      try {
          await axios.post('http://localhost:3000/api/admin/simulate', { matchupId: currentMatchup.id, homeScore, awayScore }, { headers: { Authorization: `Bearer ${token}` } });
          toast.current?.show({severity:'success', summary: t('admin.success'), detail: t('admin.updated'), life: 3000});
          setShowScoreDialog(false);
          fetchMatchups();
      } catch (error) { console.error(error); }
  }

  const saveTeam = async () => {
      if (!currentTeam) return;
      try {
          await axios.post('http://localhost:3000/api/admin/teams/update', currentTeam, { headers: { Authorization: `Bearer ${token}` } });
          toast.current?.show({severity:'success', summary: t('admin.success'), detail: t('admin.updated'), life: 3000});
          setShowTeamDialog(false);
          fetchTeams();
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
                  toast.current?.show({severity:'warn', summary: t('admin.success'), detail: t('admin.deleted'), life: 3000});
                  fetchMatchups();
                  fetchUsers();
              } catch (error) { console.error(error); }
          }
      });
  }

  const startContent = (
      <div className="flex flex-wrap gap-2">
          <Button label={t('admin.newGame')} icon="pi pi-plus" severity="success" size="small" onClick={() => { setMatchupForm(emptyMatchup); setShowMatchupDialog(true); }} />
          <Button label={t('admin.clearAll')} icon="pi pi-trash" severity="danger" size="small" onClick={clearSeason} />
      </div>
  );

  const endContent = (
      <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-400 text-sm hidden md:block">{t('admin.theme')}</span>
          <Dropdown value={selectedTheme} options={themeOptions} onChange={(e) => {
              setSelectedTheme(e.value);
              axios.post('http://localhost:3000/api/admin/settings', { key: 'theme', value: e.value }, { headers: { Authorization: `Bearer ${token}` } });
              (document.getElementById('app-theme') as HTMLLinkElement).href = `/themes/${e.value}/theme.css`;
          }} className="w-10rem md:w-14rem p-inputtext-sm" />
      </div>
  );

  const weekOptions = Array.from({ length: 18 }, (_, i) => ({ label: `${t('admin.form.week')} ${i + 1}`, value: i + 1 }));
  const filteredMatchups = matchups.filter(m => m.week === adminSelectedWeek && m.stage === adminSelectedStage);

  return (
    <div className="max-w-7xl mx-auto mt-4 md:mt-8 px-2 pb-12">
      <Toast ref={toast} />
      <ConfirmDialog />
      
      {/* Dialogs */}
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
              <div className="flex flex-col gap-8 py-6">
                  <div className="flex justify-between items-center text-center">
                      <div className="flex flex-col items-center gap-4 w-5/12">
                          <img src={currentMatchup.awayTeam.logoUrl} className="w-12 h-12" />
                          <span className="font-bold text-xs uppercase text-gray-500">{currentMatchup.awayTeam.name}</span>
                          <InputNumber value={awayScore} onValueChange={(e) => setAwayScore(e.value ?? 0)} min={0} inputClassName="text-center text-xl font-bold" />
                      </div>
                      <div className="text-xl font-bold text-gray-400">@</div>
                      <div className="flex flex-col items-center gap-4 w-5/12">
                          <img src={currentMatchup.homeTeam.logoUrl} className="w-12 h-12" />
                          <span className="font-bold text-xs uppercase text-gray-500">{currentMatchup.homeTeam.name}</span>
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

      <Card title={t('admin.panel')} subTitle={t('admin.manage')} className="border-none shadow-4">
        <TabView>
            <TabPanel header={t('admin.tabGames')} leftIcon="pi pi-calendar mr-2">
                <Toolbar start={startContent} end={endContent} className="mb-2 p-2" />
                
                <div className="flex flex-wrap gap-4 items-center bg-gray-800 bg-opacity-20 p-3 rounded-lg mb-4">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-gray-400 uppercase">{t('admin.form.stage')}:</span>
                        <Dropdown value={adminSelectedStage} options={stageOptions} onChange={(e) => setAdminSelectedStage(e.value)} className="p-inputtext-sm" />
                    </div>
                    {adminSelectedStage === 'REGULAR' && (
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-gray-400 uppercase">{t('admin.form.week')}:</span>
                            <Dropdown value={adminSelectedWeek} options={weekOptions} onChange={(e) => setAdminSelectedWeek(e.value)} className="p-inputtext-sm" />
                        </div>
                    )}
                    <div className="ml-auto hidden sm:block">
                        <Tag value={`${filteredMatchups.length} / 18 ${t('nav.games')}`} severity={filteredMatchups.length >= 18 ? 'danger' : 'info'} />
                    </div>
                </div>

                <DataTable value={filteredMatchups} stripedRows rowHover responsiveLayout="scroll" size="small">
                    <Column header="#" body={(_row, options) => <span className="text-gray-500 font-mono text-[10px]">{options.rowIndex + 1}</span>} style={{width: '2rem'}} align="center" headerClassName="text-center"></Column>
                    
                    <Column header="" body={(row) => <img src={row.awayTeam.logoUrl} className="object-contain" style={{ width: '40px', height: '40px' }} />} style={{width: '50px'}} align="right" headerClassName="justify-content-center"></Column>
                    <Column header={t('admin.form.away')} body={(row) => <span className="font-bold text-[10px] uppercase tracking-wider">{row.awayTeam.name}</span>} style={{width: '10rem'}} headerClassName="text-center"></Column>
                    
                    <Column header="" body={() => <span className="text-gray-500 text-[10px] font-black">@</span>} align="center" style={{width: '2rem'}} headerClassName="text-center"></Column>
                    
                    <Column header={t('admin.form.home')} body={(row) => <span className="font-bold text-[10px] uppercase tracking-wider">{row.homeTeam.name}</span>} style={{width: '10rem'}} align="right" headerClassName="text-center"></Column>
                    <Column header="" body={(row) => <img src={row.homeTeam.logoUrl} className="object-contain" style={{ width: '40px', height: '40px' }} />} style={{width: '50px'}} align="left" headerClassName="justify-content-center"></Column>
                    
                    <Column header={t('admin.status')} body={(row) => row.isFinished ? <Tag severity="success" value={t('admin.finished')} className="text-[8px]" /> : <Tag severity="warning" value={t('admin.pending')} className="text-[8px]" />} align="center" headerClassName="text-center"></Column>
                    <Column header={t('admin.result')} body={(row) => row.isFinished ? <span className="font-bold text-primary text-xs">{row.awayScore} - {row.homeScore}</span> : <Button label={t('admin.result')} icon="pi pi-pencil" size="small" severity="warning" text onClick={() => { setCurrentMatchup(row); setHomeScore(0); setAwayScore(0); setShowScoreDialog(true); }} />} className="text-xs" align="center" headerClassName="text-center"></Column>
                    
                    <Column header="" align="center" body={(row) => (
                        <div className="flex gap-1">
                            <Button icon="pi pi-pencil" rounded text severity="warning" onClick={() => {
                                setMatchupForm({ id: row.id, week: row.week, stage: row.stage, homeTeamId: row.homeTeamId, awayTeamId: row.awayTeamId, startTime: new Date(row.startTime) });
                                setShowMatchupDialog(true);
                            }} className="p-button-sm" />
                            <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => deleteMatchup(row.id)} className="p-button-sm" />
                        </div>
                    )}></Column>
                </DataTable>
            </TabPanel>

            <TabPanel header={t('admin.tabTeams')} leftIcon="pi pi-briefcase mr-2">
                <DataTable value={teams} stripedRows rowHover paginator rows={15} size="small" sortField="conference" sortOrder={1} responsiveLayout="scroll">
                    <Column header="" body={(row) => <img src={row.logoUrl} className="w-8 h-8 object-contain" />} style={{width: '3rem'}} align="center"></Column>
                    <Column field="city" header={t('admin.city')} sortable className="text-xs"></Column>
                    <Column field="name" header={t('admin.name')} sortable className="text-xs"></Column>
                    <Column field="conference" header={t('admin.conf')} sortable align="center" className="text-xs"></Column>
                    <Column field="division" header={t('admin.div')} sortable align="center" className="text-xs"></Column>
                    <Column header="" body={(row) => <Button icon="pi pi-pencil" rounded text severity="secondary" onClick={() => { setCurrentTeam(row); setShowTeamDialog(true); }} />} align="center"></Column>
                </DataTable>
            </TabPanel>
            
            <TabPanel header={t('admin.tabUsers')} leftIcon="pi pi-users mr-2">
                <DataTable value={users} stripedRows rowHover paginator rows={15} size="small" responsiveLayout="scroll">
                    <Column field="username" header={t('landing.username')} sortable className="text-xs"></Column>
                    <Column field="email" header="Email" className="text-xs"></Column>
                    <Column field="score" header="Score" sortable className="text-xs"></Column>
                    <Column header={t('admin.status')} body={(rowData) => (
                        <div className="flex items-center gap-2">
                            <InputSwitch checked={rowData.isActive} onChange={() => {
                                axios.post('http://localhost:3000/api/admin/users/toggle-status', { id: rowData.id, isActive: !rowData.isActive }, { headers: { Authorization: `Bearer ${token}` } })
                                    .then(() => fetchUsers());
                            }} className="scale-50" />
                            <Tag severity={rowData.isActive ? 'success' : 'danger'} value={rowData.isActive ? t('admin.success').substring(0,3) : 'OFF'} className="text-[8px]" />
                        </div>
                    )}></Column>
                </DataTable>
            </TabPanel>
        </TabView>
      </Card>
    </div>
  );
};

export default Admin;
