import { useEffect, useState } from 'react';
import axios from 'axios';
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
        const response = await axios.get('http://localhost:3000/api/matchups', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setResults(response.data.filter((m: any) => m.isFinished));
      } catch (error) {
        console.error('Error fetching results', error);
      }
    };
    fetchResults();
  }, [token]);

  return (
    <div className="max-w-7xl mx-auto mt-4 md:mt-12 px-2 md:px-4 pb-12">
      <Card title={t('nav.results')} subTitle="Season History" className="shadow-4 border-none overflow-hidden">
        <DataTable value={results} stripedRows rowHover paginator rows={15} sortField="week" sortOrder={-1} size="small" className="mt-4">
            <Column field="week" header="WK" style={{width: '4rem'}} sortable className="font-bold text-xs" align="center" headerClassName="justify-content-center"></Column>
            
            {/* Away Team Section */}
            <Column header="" body={(row) => <img src={row.awayTeam.logoUrl} className="w-8 h-8 md:w-12 md:h-12 object-contain" alt="" />} style={{width: '5rem'}} align="right" headerClassName="justify-content-end"></Column>
            <Column header={t('admin.form.away')} body={(row) => <span className={`text-[10px] md:text-sm uppercase tracking-tighter truncate ${row.winnerId === row.awayTeamId ? 'font-black text-primary' : 'text-gray-500 font-bold'}`}>{row.awayTeam.name}</span>} style={{width: '12rem'}} headerClassName="justify-content-center text-center"></Column>
            
            <Column field="awayScore" header="PTS" body={(row) => <span className={`text-xl md:text-3xl font-black ${row.winnerId === row.awayTeamId ? 'text-primary' : 'opacity-40'}`}>{row.awayScore}</span>} align="center" style={{width: '5rem'}} headerClassName="justify-content-center"></Column>
            
            <Column header="" body={() => <Tag value="FINAL" severity="secondary" className="text-[8px] md:text-[10px] font-bold px-2" />} style={{width: '5rem', textAlign: 'center'}} align="center"></Column>
            
            <Column field="homeScore" header="PTS" body={(row) => <span className={`text-xl md:text-3xl font-black ${row.winnerId === row.homeTeamId ? 'text-primary' : 'opacity-40'}`}>{row.homeScore}</span>} align="center" style={{width: '5rem'}} headerClassName="justify-content-center"></Column>
            
            {/* Home Team Section */}
            <Column header={t('admin.form.home')} body={(row) => <span className={`text-[10px] md:text-sm uppercase tracking-tighter truncate ${row.winnerId === row.homeTeamId ? 'font-black text-primary' : 'text-gray-500 font-bold'}`}>{row.homeTeam.name}</span>} style={{width: '12rem'}} align="right" headerClassName="justify-content-center text-center"></Column>
            <Column header="" body={(row) => <img src={row.homeTeam.logoUrl} className="w-8 h-8 md:w-12 md:h-12 object-contain" alt="" />} style={{width: '5rem'}} align="left" headerClassName="justify-content-start"></Column>
        </DataTable>
      </Card>
    </div>
  );
};

export default Results;