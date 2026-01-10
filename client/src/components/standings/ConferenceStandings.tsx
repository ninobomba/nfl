import React from 'react';
import type {TeamStats} from './types';
import StandingsTable from './StandingsTable';
import ConferenceFilter from './ConferenceFilter';
import StandingsSkeleton from './StandingsSkeleton';

interface ConferenceStandingsProps {
  standings: TeamStats[];
  loading: boolean;
  selectedConference: string | null;
  onConferenceChange: (value: string | null) => void;
}

const ConferenceStandings: React.FC<ConferenceStandingsProps> = ({ 
  standings, 
  loading, 
  selectedConference, 
  onConferenceChange 
}) => {
  const afcTeams = standings.filter((t) => t.conference === 'AFC');
  const nfcTeams = standings.filter((t) => t.conference === 'NFC');

  if (loading) return (
    <div className="py-12">
      <StandingsSkeleton />
      <StandingsSkeleton />
    </div>
  );

  return (
    <div className="py-12">
      <ConferenceFilter 
        selectedConference={selectedConference} 
        onConferenceChange={onConferenceChange} 
      />
      
      {(!selectedConference || selectedConference === 'AFC') && (
        <StandingsTable teams={afcTeams} showDetails />
      )}
      
      {(!selectedConference || selectedConference === 'NFC') && (
        <StandingsTable teams={nfcTeams} showDetails />
      )}
    </div>
  );
};

export default ConferenceStandings;
