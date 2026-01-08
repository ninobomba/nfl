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

  const renderStandingsTable = (teams: TeamStats[]) => {
    const sortedTeams = [...teams].sort((a, b) => {
        if (a.division < b.division) return -1;
        if (a.division > b.division) return 1;
        return Number(b.pct) - Number(a.pct);
    });

    return (
        <DataTable 
            value={sortedTeams} 
            stripedRows 
            rowHover
            responsiveLayout="scroll" 
            rowGroupMode="subheader" 
            groupRowsBy="division"
            size="small"
            className="mt-2"
            rowGroupHeaderTemplate={(data) => (
                <div className="font-black uppercase tracking-widest text-primary py-3 px-4 text-[10px] md:text-xs bg-gray-800 bg-opacity-10 border-bottom-1 border-gray-800">
                    {data.division}
                </div>
            )}
        >
          <Column header="" body={(row) => <img src={row.logoUrl} alt={row.name} className="w-8 h-8 md:w-10 md:h-10 object-contain" />} style={{ width: '6rem' }} align="center" headerClassName="justify-content-center"></Column>
          <Column header={t('admin.tabTeams')} body={(row) => (
              <div className="flex flex-col md:flex-row md:gap-2 items-start md:items-center">
                  <span className="hidden md:inline text-gray-500 font-bold uppercase text-[10px] tracking-tight">{row.city}</span>
                  <span className="font-black text-xs md:text-sm uppercase tracking-wider">{row.name}</span>
              </div>
          )} style={{ width: '40%' }} headerClassName="text-center"></Column>
          <Column field="wins" header="W" sortable className="text-xs font-black" align="center" style={{ width: '4rem' }} headerClassName="justify-content-center"></Column>
          <Column field="losses" header="L" sortable className="text-xs font-black" align="center" style={{ width: '4rem' }} headerClassName="justify-content-center"></Column>
          <Column field="ties" header="T" sortable className="text-xs font-black" align="center" style={{ width: '4rem' }} headerClassName="justify-content-center"></Column>
        </DataTable>
    );
  };

  const afcTeams = standings.filter((t) => t.conference === 'AFC');
  const nfcTeams = standings.filter((t) => t.conference === 'NFC');

  return (
    <div className="max-w-7xl mx-auto mt-4 md:mt-12 px-2 md:px-4 pb-12">
      <Card title={t('nav.standings')} subTitle="NFL Rankings" className="shadow-4 border-none overflow-hidden">
        <TabView className="mt-2 md:mt-4">
          <TabPanel header="AFC" leftIcon="pi pi-shield mr-2">
            <div className="py-2 md:py-6 px-1 md:px-4">
                {renderStandingsTable(afcTeams)}
            </div>
          </TabPanel>
          <TabPanel header="NFC" leftIcon="pi pi-shield mr-2">
            <div className="py-2 md:py-6 px-1 md:px-4">
                {renderStandingsTable(nfcTeams)}
            </div>
          </TabPanel>
        </TabView>
      </Card>
    </div>
  );
};

export default Standings;
