import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAppSelector } from '../store/hooks';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import { TabView, TabPanel } from 'primereact/tabview';
import { Skeleton } from 'primereact/skeleton';
import { useTranslation } from 'react-i18next';

interface TeamStats {
  id: number;
  name: string;
  city: string;
  abbreviation: string;
  logoUrl: string;
  conference: string;
  division: string;
  wins: number;
  losses: number;
  ties: number;
  pct: string;
  pointsFor: number;
  pointsAgainst: number;
  diff: number;
}

const Standings = () => {
  const [standings, setStandings] = useState<TeamStats[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAppSelector((state) => state.auth);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchStandings = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:3000/api/standings', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStandings(response.data);
      } catch (error) {
        console.error('Error fetching standings', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStandings();
  }, [token]);

  const divisions = ['East', 'North', 'South', 'West'];

  const renderDivisionTable = (teams: TeamStats[], divisionName: string) => {
    const divisionTeams = teams
        .filter(t => t.division === divisionName)
        .sort((a, b) => Number(b.pct) - Number(a.pct));

    return (
        <div key={divisionName} className="mb-24 last:mb-0 flex flex-col items-center animate-fadein">
            <div className="w-full max-w-[700px] flex items-center gap-6 mb-10 border-bottom-1 border-primary-500 pb-4">
                <span className="text-3xl font-black italic tracking-tighter text-primary">{divisionName}</span>
                <div className="flex-grow border-bottom-1 border-gray-800 opacity-20"></div>
            </div>
            
            <div className="w-fit shadow-10 rounded-3xl overflow-hidden border-0 border-gray-800 bg-surface-card transition-all hover:shadow-primary-500/10">
                <DataTable 
                    value={divisionTeams} 
                    stripedRows 
                    rowHover
                    responsiveLayout="scroll" 
                    style={{ minWidth: '650px' }}
                >
                  <Column header="" body={(row) => (
                      <div className="flex justify-center py-4 px-6">
                          <img src={row.logoUrl} alt={row.name} className="w-14 h-14 object-contain transition-transform hover:scale-110" />
                      </div>
                  )} style={{ width: '8rem' }} align="center" headerClassName="justify-content-center"></Column>
                  
                  <Column header={t('admin.tabTeams')} body={(row) => (
                      <div className="flex flex-col md:flex-row md:gap-4 items-start md:items-center py-4 px-6">
                          <span className="hidden md:inline text-gray-500 font-black text-[10px] tracking-[0.3em] opacity-40">{row.city}</span>
                          <span className="font-black text-sm md:text-xl tracking-widest text-white">{row.name}</span>
                      </div>
                  )} style={{ width: '24rem' }} headerClassName="text-center"></Column>
                  
                  <Column field="wins" header="W" className="text-xl font-black py-4 px-8 text-green-500" align="center" style={{ width: '6rem' }} headerClassName="justify-content-center"></Column>
                  <Column field="losses" header="L" className="text-xl font-black py-4 px-8 text-red-500" align="center" style={{ width: '6rem' }} headerClassName="justify-content-center"></Column>
                  <Column field="ties" header="T" className="text-xl font-black py-4 px-8 text-gray-400" align="center" style={{ width: '6rem' }} headerClassName="justify-content-center"></Column>
                </DataTable>
            </div>
        </div>
    );
  };

  const loadingTemplate = () => (
      <div className="max-w-[800px] mx-auto py-20 flex flex-col gap-12">
          <div className="flex flex-col gap-4">
              <Skeleton width="20%" height="2rem" />
              <Skeleton height="15rem" borderRadius="24px" />
          </div>
          <div className="flex flex-col gap-4">
              <Skeleton width="20%" height="2rem" />
              <Skeleton height="15rem" borderRadius="24px" />
          </div>
      </div>
  );

  const afcTeams = standings.filter((t) => t.conference === 'AFC');
  const nfcTeams = standings.filter((t) => t.conference === 'NFC');

  return (
    <div className="max-w-7xl mx-auto mt-4 md:mt-12 px-4 pb-24 font-comfortaa">
      <Card title={t('nav.standings')} subTitle="National Football League Rankings by Division" className="shadow-10 border-none overflow-hidden text-center rounded-3xl bg-surface-card border-0 border-gray-800">
        <TabView className="mt-8">
          <TabPanel header="American Football Conference" leftIcon="pi pi-shield mr-3 text-blue-500 font-bold">
            <div className="py-12">
                {loading ? loadingTemplate() : divisions.map(div => renderDivisionTable(afcTeams, div))}
            </div>
          </TabPanel>
          <TabPanel header="National Football Conference" leftIcon="pi pi-shield mr-3 text-red-500 font-bold">
            <div className="py-12">
                {loading ? loadingTemplate() : divisions.map(div => renderDivisionTable(nfcTeams, div))}
            </div>
          </TabPanel>
        </TabView>
      </Card>
    </div>
  );
};

export default Standings;