import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAppSelector } from '../store/hooks';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import { TabView, TabPanel } from 'primereact/tabview';
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
  const { token } = useAppSelector((state) => state.auth);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchStandings = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/standings', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStandings(response.data);
      } catch (error) {
        console.error('Error fetching standings', error);
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
        <div key={divisionName} className="mb-20 last:mb-0 flex flex-col items-center">
            <div className="w-full max-w-[700px] flex items-center gap-6 mb-8 border-bottom-1 border-primary-500 pb-4">
                <span className="text-3xl font-black  italic tracking-tighter text-primary">{divisionName}</span>
                <div className="flex-grow border-bottom-1 border-gray-800 opacity-20"></div>
            </div>
            
            <div className="w-fit shadow-10 rounded-2xl overflow-hidden border-1 border-gray-800 bg-surface-card transition-all hover:shadow-primary-500/10">
                <DataTable 
                    value={divisionTeams} 
                    stripedRows 
                    rowHover
                    responsiveLayout="scroll" 
                    className="p-datatable-lg"
                    style={{ minWidth: '650px' }}
                >
                  <Column header="" body={(row) => (
                      <div className="flex justify-center py-2 px-4">
                          <img src={row.logoUrl} alt={row.name} className="w-12 h-12 md:w-14 md:h-12 object-contain" />
                      </div>
                  )} style={{ width: '7rem' }} align="center" headerClassName="justify-content-center"></Column>
                  
                  <Column header={t('admin.tabTeams')} body={(row) => (
                      <div className="flex flex-col md:flex-row md:gap-4 items-start md:items-center py-2 px-4">
                          <span className="hidden md:inline text-gray-500 font-black  text-[10px] tracking-[0.2em] opacity-40">{row.city}</span>
                          <span className="font-black text-sm md:text-lg  tracking-widest text-white">{row.name}</span>
                      </div>
                  )} style={{ width: '22rem' }} headerClassName="text-center"></Column>
                  
                  <Column field="wins" header="W" className="text-base font-black py-4 px-6 text-green-500" align="center" style={{ width: '6rem' }} headerClassName="justify-content-center"></Column>
                  <Column field="losses" header="L" className="text-base font-black py-4 px-6 text-red-500" align="center" style={{ width: '6rem' }} headerClassName="justify-content-center"></Column>
                  <Column field="ties" header="T" className="text-base font-black py-4 px-6 text-gray-400" align="center" style={{ width: '6rem' }} headerClassName="justify-content-center"></Column>
                </DataTable>
            </div>
        </div>
    );
  };

  const afcTeams = standings.filter((t) => t.conference === 'AFC');
  const nfcTeams = standings.filter((t) => t.conference === 'NFC');

  return (
    <div className="max-w-7xl mx-auto mt-12 px-4 pb-20 font-comfortaa">
      <Card title={t('nav.standings')} subTitle="National Football League Rankings by Division" className="shadow-8 border-none overflow-hidden text-center rounded-3xl">
        <TabView className="mt-8">
          <TabPanel header="American Football Conference (AFC)" leftIcon="pi pi-shield mr-3 text-blue-500 font-bold">
            <div className="py-16">
                {divisions.map(div => renderDivisionTable(afcTeams, div))}
            </div>
          </TabPanel>
          <TabPanel header="National Football Conference (NFC)" leftIcon="pi pi-shield mr-3 text-red-500 font-bold">
            <div className="py-16">
                {divisions.map(div => renderDivisionTable(nfcTeams, div))}
            </div>
          </TabPanel>
        </TabView>
      </Card>
    </div>
  );
};

export default Standings;