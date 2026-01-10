import { useEffect, useState } from 'react';
import api from '../api/axios';
import logger from '../utils/logger';
import { useAppSelector } from '../store/hooks';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import { TabView, TabPanel } from 'primereact/tabview';
import { Skeleton } from 'primereact/skeleton';
import { Dropdown } from 'primereact/dropdown';
import { useTranslation } from 'react-i18next';
import { getLogoUrl } from '../utils/logoUtils';

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
  const [selectedConference, setSelectedConference] = useState<string | null>('AFC');
  const { token } = useAppSelector((state) => state.auth);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchStandings = async () => {
      setLoading(true);
      logger.info('Fetching standings...');
      try {
        const response = await api.get('/api/standings', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStandings(response.data);
        logger.debug(`Standings fetched successfully: ${response.data.length} teams`);
      } catch (error) {
        logger.error('Error fetching standings', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStandings();
  }, [token]);

  const divisions = ['East', 'North', 'South', 'West'];
  const conferences = [
    { label: 'American Football Conference', value: 'AFC' },
    { label: 'National Football Conference', value: 'NFC' }
  ];

  const renderDivisionTabs = (teams: TeamStats[], conferenceName: string) => (
    <div className="py-8">
      <h2 className={`text-2xl font-black mb-12 italic ${conferenceName === 'AFC' ? 'text-blue-500' : 'text-red-500'}`}>
        {conferenceName === 'AFC' ? 'American Football Conference' : 'National Football Conference'}
      </h2>
      <TabView className="mt-4 shadow-2 rounded-2xl overflow-hidden border-1 border-gray-800">
        {divisions.map(div => (
          <TabPanel key={`${conferenceName}-${div}`} header={div}>
            <div className="py-12 bg-gray-900/20">
              {renderTable(teams.filter(t => t.division === div), div)}
            </div>
          </TabPanel>
        ))}
      </TabView>
    </div>
  );

  const renderTable = (teams: TeamStats[], title?: string, ignoreFilter = false) => {
    const filteredTeams = (selectedConference && !ignoreFilter)
      ? teams.filter(t => t.conference === selectedConference)
      : teams;

    if (filteredTeams.length === 0 && selectedConference && !ignoreFilter) return null;

    const sortedTeams = [...filteredTeams].sort((a, b) => {
      const pctA = Number(a.pct);
      const pctB = Number(b.pct);
      if (pctB !== pctA) return pctB - pctA;
      return (b.wins - b.losses) - (a.wins - a.losses);
    });

    return (
      <div key={title || 'league'} className="mb-12 last:mb-0 flex flex-col items-center animate-fadein">
        {title && (
          <div className="w-full max-w-[700px] flex items-center gap-6 mb-10 border-bottom-1 border-primary-500 pb-4">
            <span className="text-3xl font-black italic tracking-tighter text-primary">{title}</span>
            <div className="flex-grow border-bottom-1 border-gray-800 opacity-20"></div>
          </div>
        )}

        <div className="w-fit shadow-10 rounded-3xl overflow-hidden border-0 border-gray-800 bg-surface-card transition-all hover:shadow-primary-500/10">
          <DataTable
            value={sortedTeams}
            stripedRows
            rowHover
            responsiveLayout="scroll"
            style={{ minWidth: '650px' }}
          >
            <Column header="" body={(row) => (
              <div className="flex justify-center py-4 px-6">
                <img src={getLogoUrl(row.logoUrl, '30')} alt={row.name} className="w-8 h-8 object-contain transition-transform hover:scale-110" />
              </div>
            )} style={{ width: '8rem' }} align="center" headerClassName="justify-content-center"></Column>

            <Column header={t('admin.tabTeams')} body={(row) => (
              <div className="flex flex-col md:flex-row md:gap-4 items-start md:items-center py-4 px-6">
                <div className="flex flex-col">
                    <span className="hidden md:inline text-gray-500 font-black text-[10px] tracking-[0.3em] opacity-40">{row.city}</span>
                    <span className="font-black text-sm md:text-xl tracking-widest text-white">{row.name}</span>
                </div>
                {(!divisions.includes(title || '')) && (
                    <div className="ml-auto flex gap-2">
                        <span className="text-[10px] font-bold px-2 py-1 rounded bg-gray-800 text-gray-400">{row.conference}</span>
                        <span className="text-[10px] font-bold px-2 py-1 rounded bg-gray-800 text-gray-400">{row.division}</span>
                    </div>
                )}
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
    </div>
  );

  const afcTeams = standings.filter((t) => t.conference === 'AFC');
  const nfcTeams = standings.filter((t) => t.conference === 'NFC');

  const renderFilter = () => (
    <div className="flex justify-center mb-8">
      <div className="flex flex-col items-center gap-2">
        <label className="text-xs font-bold text-gray-500 tracking-widest">{t('admin.conf')}</label>
        <Dropdown 
          value={selectedConference} 
          options={conferences} 
          onChange={(e) => setSelectedConference(e.value)} 
          placeholder="Select Conference"
          showClear
          className="w-full md:w-20rem shadow-5 rounded-xl border-none bg-gray-900/50"
        />
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto mt-4 md:mt-12 px-4 pb-24 font-comfortaa">
      <Card 
        title={t('nav.standings')} 
        subTitle="National Football League Rankings" 
        className="shadow-10 border-none overflow-hidden text-center rounded-3xl bg-surface-card border-0 border-gray-800"
      >
        <TabView className="mt-8">
          {/* DIVISION TAB */}
          <TabPanel header={t('standings_tabs.division')} leftIcon="pi pi-th-large mr-3">
             <div className="py-12">
                {renderFilter()}
                {loading ? (
                    loadingTemplate()
                ) : (
                    <>
                        {(!selectedConference || selectedConference === 'AFC') && renderDivisionTabs(afcTeams, 'AFC')}
                        {(!selectedConference || selectedConference === 'NFC') && renderDivisionTabs(nfcTeams, 'NFC')}
                    </>
                )}
             </div>
          </TabPanel>

          {/* CONFERENCE TAB */}
          <TabPanel header={t('standings_tabs.conference')} leftIcon="pi pi-shield mr-3">
            <div className="py-12">
              {renderFilter()}
              {loading ? (
                <>
                  {loadingTemplate()}
                  {loadingTemplate()}
                </>
              ) : (
                <>
                  {(!selectedConference || selectedConference === 'AFC') && renderTable(afcTeams, 'American Football Conference')}
                  {(!selectedConference || selectedConference === 'NFC') && renderTable(nfcTeams, 'National Football Conference')}
                </>
              )}
            </div>
          </TabPanel>

          {/* LEAGUE TAB */}
          <TabPanel header={t('standings_tabs.league')} leftIcon="pi pi-globe mr-3">
            <div className="py-12">
              {loading ? loadingTemplate() : renderTable(standings, 'NFL', true)}
            </div>
          </TabPanel>
        </TabView>
      </Card>
    </div>
  );
};

export default Standings;