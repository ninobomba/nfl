import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useAppSelector } from '../store/hooks';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import { SelectButton } from 'primereact/selectbutton';
import { clsx } from 'clsx';
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
    try {
      const [matchupsRes, picksRes] = await Promise.all([
          axios.get('http://localhost:3000/api/matchups', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:3000/api/picks', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setMatchups(matchupsRes.data);
      setUserPicks(picksRes.data.map((p: any) => ({ matchupId: p.matchupId, selectedTeamId: p.selectedTeamId })));
    } catch (error) {
      console.error('Error fetching data', error);
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

  return (
    <div className="max-w-7xl mx-auto mt-8 px-4 pb-12">
      <Toast ref={toast} />
      
      <div className="flex flex-col gap-8 mb-12 surface-card p-8 rounded-xl shadow-lg border-1 border-primary-500 bg-opacity-50">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
                <h1 className="text-4xl font-black mb-2 text-primary italic uppercase tracking-tighter">{t('dashboard.title')}</h1>
                <p className="text-gray-400 font-bold text-sm tracking-widest">{t('dashboard.description')}</p>
            </div>
            <SelectButton value={selectedStage} options={stageOptions} onChange={(e) => setSelectedStage(e.value)} />
        </div>

        {selectedStage === 'REGULAR' && (
            <div className="flex items-center gap-4 justify-center md:justify-start border-t border-gray-700 pt-6">
                <span className="font-bold text-sm uppercase tracking-wider text-gray-500">{t('dashboard.selectWeek')}</span>
                <Dropdown 
                    value={selectedWeek} 
                    options={weekOptions} 
                    onChange={(e) => setSelectedWeek(e.value)} 
                    placeholder={t('dashboard.selectWeek')} 
                    className="w-full md:w-16rem"
                />
            </div>
        )}
      </div>
      
      {filteredMatchups.length === 0 ? (
          <div className="text-center p-16 surface-card rounded-xl border-1 border-dashed border-gray-600">
              <i className="pi pi-calendar-times text-6xl mb-6 text-gray-600"></i>
              <p className="text-2xl text-gray-400 font-black uppercase tracking-widest">{t('dashboard.noMatchups')}</p>
              <p className="text-gray-500 mt-2">{t('dashboard.checkBack', { stage: selectedStage.toLowerCase() })}</p>
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredMatchups.map((matchup) => (
              <Card 
                key={matchup.id} 
                className={clsx(
                    "surface-card border-round border-none overflow-hidden transition-all transition-duration-300 pt-4",
                    matchup.isFinished ? "opacity-80 shadow-1" : "shadow-4 hover:shadow-8 hover:-translate-y-1"
                )}
              >
                <div className="text-center mb-4">
                    <Tag value={matchup.stage} severity={matchup.stage === 'REGULAR' ? 'info' : 'success'} className="px-3 text-[10px] font-bold" />
                </div>
                <div className="flex justify-between items-center mb-6 px-4 gap-2">
                  {/* Away Team */}
                  <div className={clsx(
                      "flex flex-col items-center w-5/12 text-center gap-3 p-3 rounded-xl transition-all",
                      matchup.isFinished && matchup.winnerId === matchup.awayTeamId && "bg-green-900 bg-opacity-20 border-1 border-green-500 scale-105",
                      matchup.isFinished && matchup.winnerId === matchup.homeTeamId && "opacity-40 grayscale"
                  )}>
                    <img src={matchup.awayTeam.logoUrl} alt={matchup.awayTeam.name} className="w-12 h-12 object-contain" />
                    <div className="text-xs font-black uppercase tracking-tighter h-8 flex items-center justify-center">
                        {matchup.awayTeam.name}
                    </div>
                    {matchup.isFinished ? (
                        <div className="text-3xl font-black">{matchup.awayScore}</div>
                    ) : (
                        <Checkbox 
                            inputId={`pick-${matchup.id}-away`}
                            onChange={() => handlePick(matchup.id, matchup.awayTeam.id, matchup.awayTeam.name)} 
                            checked={isSelected(matchup.id, matchup.awayTeam.id)}
                            className="scale-125"
                        />
                    )}
                  </div>
                  
                  <div className="flex flex-col items-center gap-2 w-2/12">
                      <div className="text-xl font-black text-gray-600">@</div>
                      {matchup.isFinished && <Tag value="FINAL" severity="secondary" className="text-[9px] font-bold px-2" />}
                  </div>
                  
                  {/* Home Team */}
                  <div className={clsx(
                      "flex flex-col items-center w-5/12 text-center gap-3 p-3 rounded-xl transition-all",
                      matchup.isFinished && matchup.winnerId === matchup.homeTeamId && "bg-green-900 bg-opacity-20 border-1 border-green-500 scale-105",
                      matchup.isFinished && matchup.winnerId === matchup.awayTeamId && "opacity-40 grayscale"
                  )}>
                    <img src={matchup.homeTeam.logoUrl} alt={matchup.homeTeam.name} className="w-14 h-14 object-contain" />
                    <div className="text-xs font-black uppercase tracking-tighter h-8 flex items-center justify-center">
                        {matchup.homeTeam.name}
                    </div>
                    {matchup.isFinished ? (
                        <div className="text-3xl font-black">{matchup.homeScore}</div>
                    ) : (
                        <Checkbox 
                            inputId={`pick-${matchup.id}-home`}
                            onChange={() => handlePick(matchup.id, matchup.homeTeam.id, matchup.homeTeam.name)} 
                            checked={isSelected(matchup.id, matchup.homeTeam.id)}
                            className="scale-125"
                        />
                    )}
                  </div>
                </div>
                {matchup.isFinished && isSelected(matchup.id, matchup.winnerId!) && (
                    <div className="text-center pb-4 text-green-400 font-bold text-[10px] tracking-widest animate-bounce">
                        <i className="pi pi-check-circle mr-1"></i> {t('dashboard.correct')}
                    </div>
                )}
                {matchup.isFinished && !isSelected(matchup.id, matchup.winnerId!) && isSelected(matchup.id, -1) && (
                    <div className="text-center pb-4 text-red-400 font-bold text-[10px] tracking-widest opacity-70">
                        <i className="pi pi-times-circle mr-1"></i> {t('dashboard.incorrect')}
                    </div>
                )}
              </Card>
            ))}
          </div>
      )}
    </div>
  );
};

export default Dashboard;
