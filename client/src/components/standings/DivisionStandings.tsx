import React from 'react';
import type {TeamStats} from './types';
import StandingsTable from './StandingsTable';
import ConferenceFilter from './ConferenceFilter';
import StandingsSkeleton from './StandingsSkeleton';

interface DivisionStandingsProps {
  standings: TeamStats[];
  loading: boolean;
  selectedConference: string | null;
  onConferenceChange: (value: string | null) => void;
}

const DivisionStandings: React.FC<DivisionStandingsProps> = ({ 
  standings, 
  loading, 
  selectedConference, 
  onConferenceChange 
}) => {
  const divisions = ['East', 'North', 'South', 'West'];
  const afcTeams = standings.filter((t) => t.conference === 'AFC');
  const nfcTeams = standings.filter((t) => t.conference === 'NFC');

  if (loading) return <StandingsSkeleton />;

  return (
    <div className="py-12">
      <ConferenceFilter 
        selectedConference={selectedConference} 
        onConferenceChange={onConferenceChange} 
      />
      
      {(!selectedConference || selectedConference === 'AFC') && (
        <div className="mb-20">
          {/*<h2 className="text-2xl font-black text-blue-500 mb-8 italic text-center">American Football Conference</h2>*/}
          {divisions.map(div => {
            const teams = afcTeams.filter(t => t.division === div);
            return <StandingsTable key={`afc-${div}`} teams={teams} title={div} />;
          })}
        </div>
      )}

      {(!selectedConference || selectedConference === 'NFC') && (
        <div>
          {/*<h2 className="text-2xl font-black text-red-500 mb-8 italic text-center">National Football Conference</h2>*/}
          {divisions.map(div => {
            const teams = nfcTeams.filter(t => t.division === div);
            return <StandingsTable key={`nfc-${div}`} teams={teams} title={div} />;
          })}
        </div>
      )}
    </div>
  );
};

export default DivisionStandings;
