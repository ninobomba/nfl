import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useAppSelector } from '../store/hooks';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import { SelectButton } from 'primereact/selectbutton';
import { Skeleton } from 'primereact/skeleton';
import { useTranslation } from 'react-i18next';

interface Team {
  id: number;
  name: string;
  abbreviation: string;
  city: string;
  logoUrl: string;
}

interface Matchup {
  id: number;
  week: number;
  stage: string;
  startTime: string;
  homeTeam: Team;
  awayTeam: Team;
  homeTeamId: number;
  awayTeamId: number;
  winnerId: number | null;
  homeScore: number | null;
  awayScore: number | null;
  isFinished: boolean;
}

interface UserPick {
    matchupId: number;
    selectedTeamId: number;
}

const Dashboard = () => {
  const [matchups, setMatchups] = useState<Matchup[]>([]);
  const [userPicks, setUserPicks] = useState<UserPick[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [selectedStage, setSelectedStage] = useState<string>('REGULAR');
  const [loading, setLoading] = useState(true);
  
  const { token } = useAppSelector((state) => state.auth);
  const toast = useRef<Toast>(null);
  const { t } = useTranslation();

  const stageOptions = [
      { label: t('admin.form.stage') + ' Regular', value: 'REGULAR' },
      { label: 'Playoffs', value: 'PLAYOFFS' },
      { label: 'Super Bowl', value: 'SUPERBOWL' }
  ];

  const playoffStages = ['WILDCARD', 'DIVISIONAL', 'CONFERENCE'];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [matchupsRes, picksRes] = await Promise.all([
          axios.get('http://localhost:3000/api/matchups', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:3000/api/picks', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setMatchups(matchupsRes.data);
      setUserPicks(picksRes.data.map((p: any) => ({ matchupId: p.matchupId, selectedTeamId: p.selectedTeamId })));
    } catch (error) {
      toast.current?.show({severity:'error', summary: 'Error', detail: 'Could not fetch data'});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handlePick = async (matchupId: number, selectedTeamId: number, teamName: string) => {
    try {
      await axios.post(
        'http://localhost:3000/api/picks',
        { matchupId, selectedTeamId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.current?.show({severity:'success', summary: t('admin.success'), detail: teamName, life: 2000});
      setUserPicks(prev => {
          const filtered = prev.filter(p => p.matchupId !== matchupId);
          return [...filtered, { matchupId, selectedTeamId }];
      });
    } catch (error) {
      toast.current?.show({severity:'error', summary: t('admin.error'), detail: 'Error', life: 3000});
    }
  };

  const isSelected = (matchupId: number, teamId: number) => {
      return userPicks.some(p => p.matchupId === matchupId && p.selectedTeamId === teamId);
  }

  const filteredMatchups = matchups.filter(m => {
      if (selectedStage === 'REGULAR') return m.stage === 'REGULAR' && m.week === selectedWeek;
      if (selectedStage === 'PLAYOFFS') return playoffStages.includes(m.stage);
      if (selectedStage === 'SUPERBOWL') return m.stage === 'SUPERBOWL';
      return false;
  });

  const weekOptions = Array.from({ length: 18 }, (_, i) => ({ label: `${t('admin.form.week')} ${i + 1}`, value: i + 1 }));

  const loadingTemplate = () => (
      <div className="w-full max-w-[900px] flex flex-col gap-4 mt-8">
          <Skeleton height="4rem" className="rounded-xl"></Skeleton>
          <Skeleton height="4rem" className="rounded-xl"></Skeleton>
          <Skeleton height="4rem" className="rounded-xl"></Skeleton>
      </div>
  );

  return (
    <div className="max-w-7xl mx-auto mt-8 px-4 pb-12 font-comfortaa flex flex-col items-center">
      <Toast ref={toast} />
      
      <div className="w-full max-w-[900px] flex flex-col gap-6 mb-12 surface-card p-10 rounded-3xl shadow-xl border-0 border-primary-500 bg-opacity-50 transition-all">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
                <h1 className="text-4xl font-black mb-2 text-primary italic tracking-tighter">{t('dashboard.title')}</h1>
                <p className="text-gray-400 font-bold text-sm tracking-[0.2em]">{t('dashboard.description')}</p>
            </div>
            <SelectButton value={selectedStage} options={stageOptions} onChange={(e) => setSelectedStage(e.value)} className="shadow-2" />
        </div>

        {selectedStage === 'REGULAR' && (
            <div className="flex items-center gap-4 justify-center md:justify-start border-t border-gray-700 pt-8">
                <span className="font-black text-xs tracking-widest text-gray-500">{t('dashboard.selectWeek')}</span>
                <Dropdown 
                    value={selectedWeek} 
                    options={weekOptions} 
                    onChange={(e) => setSelectedWeek(e.value)} 
                    placeholder={t('dashboard.selectWeek')} 
                    className="w-full md:w-16rem p-inputtext-sm font-bold shadow-4 border-none bg-gray-900"
                />
            </div>
        )}
      </div>
      
      {loading ? loadingTemplate() : (
          filteredMatchups.length === 0 ? (
              <div className="w-full max-w-[900px] text-center p-20 surface-card rounded-2xl border-0 border-dashed border-gray-600 shadow-4">
                  <i className="pi pi-calendar-times text-7xl mb-6 text-gray-600"></i>
                  <p className="text-2xl text-gray-400 font-black tracking-widest">{t('dashboard.noMatchups')}</p>
              </div>
          ) : (
              <div className="w-fit mx-auto pb-12 px-2 md:px-10">
                  <DataTable 
                    value={filteredMatchups} 
                    stripedRows 
                    rowHover 
                    responsiveLayout="scroll" 
                    className="shadow-8 rounded-3xl overflow-hidden border-0 border-gray-800"
                  >
                    <Column header="" body={(row) => (
                        <div className="py-6 px-4">
                            <img src={row.awayTeam.logoUrl} className="w-14 h-14 object-contain transition-transform hover:scale-110" alt="" />
                        </div>
                    )} style={{width: '7rem'}} align="right" headerClassName="justify-content-center"></Column>
                    
                    <Column header={t('admin.form.away')} body={(row) => (
                        <div className="py-6 px-2">
                            <span className={`text-sm md:text-base tracking-widest font-black ${row.isFinished && row.winnerId === row.awayTeamId ? 'text-primary' : 'text-gray-400'}`}>{row.awayTeam.name}</span>
                        </div>
                    )} style={{width: '14rem'}} headerClassName="text-center"></Column>
                    
                    <Column header="" body={(row) => (
                        <div className="py-6 px-4">
                            {row.isFinished ? <span className="text-4xl font-black text-white">{row.awayScore}</span> :
                            <Checkbox 
                                onChange={() => handlePick(row.id, row.awayTeam.id, row.awayTeam.name)} 
                                checked={isSelected(row.id, row.awayTeam.id)}
                                className="scale-150"
                            />}
                        </div>
                    )} align="center" style={{width: '6rem'}} headerClassName="justify-content-center"></Column>

                    <Column header="" body={(row) => (
                        <div className="py-6 px-4">
                            {row.isFinished ? <Tag value="FINAL" severity="secondary" className="text-[10px] font-black px-4 py-2 tracking-widest" /> : <span className="text-gray-600 font-black text-2xl italic opacity-30">@</span>}
                        </div>
                    )} align="center" style={{width: '7rem'}} headerClassName="justify-content-center"></Column>

                    <Column header="" body={(row) => (
                        <div className="py-6 px-4">
                            {row.isFinished ? <span className="text-4xl font-black text-white">{row.homeScore}</span> :
                            <Checkbox 
                                onChange={() => handlePick(row.id, row.homeTeam.id, row.homeTeam.name)} 
                                checked={isSelected(row.id, row.homeTeam.id)}
                                className="scale-150"
                            />}
                        </div>
                    )} align="center" style={{width: '6rem'}} headerClassName="justify-content-center"></Column>

                    <Column header={t('admin.form.home')} body={(row) => (
                        <div className="py-6 px-2">
                            <span className={`text-sm md:text-base tracking-widest font-black ${row.isFinished && row.winnerId === row.homeTeamId ? 'text-primary' : 'text-gray-400'}`}>{row.homeTeam.name}</span>
                        </div>
                    )} style={{width: '14rem'}} align="left" headerClassName="justify-content-center text-center"></Column>
                    
                    <Column header="" body={(row) => (
                        <div className="py-6 px-4">
                            <img src={row.homeTeam.logoUrl} className="w-14 h-14 object-contain transition-transform hover:scale-110" alt="" />
                        </div>
                    )} style={{width: '7rem'}} align="left" headerClassName="justify-content-center"></Column>

                    <Column header="" body={(row) => {
                        if (!row.isFinished) return null;
                        const correct = isSelected(row.id, row.winnerId!);
                        return (
                            <div className="py-6 px-8">
                                <Tag 
                                    icon={correct ? "pi pi-check" : "pi pi-times"} 
                                    severity={correct ? "success" : "danger"} 
                                    value={correct ? t('dashboard.correct') : t('dashboard.incorrect')}
                                    className="text-[9px] font-black italic px-5 py-3 shadow-6 tracking-[0.2em]"
                                />
                            </div>
                        )
                    }} align="center" style={{width: '16rem'}} headerClassName="justify-content-center"></Column>
                  </DataTable>
              </div>
          )
      )}
    </div>
  );
};

export default Dashboard;