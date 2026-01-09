import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAppSelector } from '../store/hooks';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { useTranslation } from 'react-i18next';

interface Team {
  id: number;
  name: string;
  logoUrl: string;
}

interface Matchup {
  id: number;
  week: number;
  homeTeam: Team;
  awayTeam: Team;
  homeScore: number;
  awayScore: number;
  winnerId: number;
  isFinished: boolean;
  awayTeamId: number;
  homeTeamId: number;
}

const Results = () => {
  const [results, setResults] = useState<Matchup[]>([]);
  const { token } = useAppSelector((state) => state.auth);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await api.get('/api/matchups', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setResults(response.data.filter((m: Matchup) => m.isFinished));
      } catch (error) {
        console.error('Error fetching results', error);
      }
    };
    fetchResults();
  }, [token]);

  return (
    <div className="max-w-7xl mx-auto mt-4 md:mt-16 px-4 pb-20 font-comfortaa flex flex-col items-center">
      <Card title={t('nav.results')} subTitle="Historical season game scores and official final results" className="w-fit shadow-10 border-none overflow-hidden text-center rounded-3xl">
        <div className="w-fit mx-auto px-4 md:px-16 py-10">
            <DataTable value={results} stripedRows rowHover paginator rows={15} sortField="week" sortOrder={-1} className="border-0 border-gray-800 rounded-2xl overflow-hidden shadow-4">
                <Column field="week" header="WK" style={{width: '6rem'}} sortable className="font-black text-sm py-6 px-6 text-gray-500" align="center" headerClassName="justify-content-center"></Column>
                
                {/* Away Team Section */}
                <Column header="" body={(row) => (
                    <div className="py-6 px-4">
                        <img src={row.awayTeam.logoUrl} className="w-14 h-14 object-contain" alt="" />
                    </div>
                )} style={{width: '7rem'}} align="right" headerClassName="justify-content-end"></Column>
                
                <Column header={t('admin.form.away')} body={(row) => (
                    <div className="py-6 px-2 min-w-[12rem]">
                        <span className={`text-sm md:text-base  tracking-[0.15em] ${row.winnerId === row.awayTeamId ? 'font-black text-white' : 'text-gray-500 font-bold opacity-60'}`}>{row.awayTeam.name}</span>
                    </div>
                )} headerClassName="justify-content-center text-center"></Column>
                
                <Column field="awayScore" header="PTS" body={(row) => <span className={`text-3xl md:text-5xl font-black py-6 px-4 ${row.winnerId === row.awayTeamId ? 'text-primary' : 'opacity-20'}`}>{row.awayScore}</span>} align="center" style={{width: '8rem'}} headerClassName="justify-content-center"></Column>
                
                <Column header="" body={() => <Tag value="FINAL" severity="secondary" className="text-[10px] font-black px-4 py-2 tracking-widest bg-gray-800" />} style={{width: '8rem', textAlign: 'center'}} align="center"></Column>
                
                <Column field="homeScore" header="PTS" body={(row) => <span className={`text-3xl md:text-5xl font-black py-6 px-4 ${row.winnerId === row.homeTeamId ? 'text-primary' : 'opacity-20'}`}>{row.homeScore}</span>} align="center" style={{width: '8rem'}} headerClassName="justify-content-center"></Column>
                
                {/* Home Team Section */}
                <Column header={t('admin.form.home')} body={(row) => (
                    <div className="py-6 px-2 min-w-[12rem]">
                        <span className={`text-sm md:text-base  tracking-[0.15em] ${row.winnerId === row.homeTeamId ? 'font-black text-white' : 'text-gray-500 font-bold opacity-60'}`}>{row.homeTeam.name}</span>
                    </div>
                )} align="right" headerClassName="justify-content-center text-center"></Column>
                
                <Column header="" body={(row) => (
                    <div className="py-6 px-4">
                        <img src={row.homeTeam.logoUrl} className="w-14 h-14 object-contain" alt="" />
                    </div>
                )} style={{width: '7rem'}} align="left" headerClassName="justify-content-start"></Column>
            </DataTable>
        </div>
      </Card>
    </div>
  );
};

export default Results;
