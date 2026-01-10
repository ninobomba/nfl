import React from 'react';
import type {TeamStats} from './types';
import StandingsTable from './StandingsTable';
import StandingsSkeleton from './StandingsSkeleton';

interface LeagueStandingsProps {
  standings: TeamStats[];
  loading: boolean;
}

const LeagueStandings: React.FC<LeagueStandingsProps> = ({ 
  standings, 
  loading
}) => {
  if (loading) return <StandingsSkeleton />;

  return (
    <div className="py-12">
      <StandingsTable teams={standings} title="NFL" showDetails />
    </div>
  );
};

export default LeagueStandings;