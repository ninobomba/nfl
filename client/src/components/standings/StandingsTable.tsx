import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useTranslation } from 'react-i18next';
import { getLogoUrl } from '../../utils/logoUtils';
import type {TeamStats} from './types';

interface StandingsTableProps {
  teams: TeamStats[];
  title?: string;
  showDetails?: boolean;
}

const StandingsTable: React.FC<StandingsTableProps> = ({ teams, title, showDetails = false }) => {
  const { t } = useTranslation();

  const sortedTeams = [...teams].sort((a, b) => {
    const pctA = Number(a.pct);
    const pctB = Number(b.pct);
    if (pctB !== pctA) return pctB - pctA;
    return (b.wins - b.losses) - (a.wins - a.losses);
  });

  return (
    <div className="mb-12 last:mb-0 flex flex-col items-center animate-fadein">
      {title && (
        <div className="w-full max-w-[700px] flex items-center gap-6 mb-10 border-bottom-1 border-primary-500 pb-4">
          {/*<span className="text-3xl font-black italic tracking-tighter text-primary">{title}</span>*/}
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
                <span className="hidden md:inline text-gray-500 font-black text-[10px] opacity-40">{row.city}</span>
                <span className="font-black text-sm md:text-xl tracking-widest text-white">{row.name}</span>
              </div>
              {showDetails && (
                <div className="ml-auto flex gap-2">
                  <span className="text-[10px] font-bold px-2 py-1 rounded bg-gray-800 text-gray-400">{row.conference}</span>
                  <span className="text-[10px] font-bold px-2 py-1 rounded bg-gray-800 text-gray-400"> - </span>
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

export default StandingsTable;
