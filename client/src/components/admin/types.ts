// Admin types
export interface Team {
  id: number;
  name: string;
  city: string;
  logoUrl: string;
  conference: string;
  division: string;
}

export interface Matchup {
  id: number;
  week: number;
  stage: string;
  homeTeamId: number;
  awayTeamId: number;
  homeTeam: Team;
  awayTeam: Team;
  isFinished: boolean;
  winnerId: number | null;
  homeScore: number | null;
  awayScore: number | null;
  startTime: string;
}

export interface MatchupForm {
    id?: number;
    week: number;
    stage: string;
    homeTeamId: number;
    awayTeamId: number;
    startTime: Date;
    homeTeam?: Team;
    awayTeam?: Team;
    isFinished?: boolean;
    winnerId?: number | null;
    homeScore?: number | null;
    awayScore?: number | null;
}

export interface AuditLog {
    id: number;
    action: string;
    details: string;
    createdAt: string;
    user: { username: string } | null;
}

export interface User {
  id: number;
  username: string;
  email: string;
  score: number;
  role: string;
  isActive: boolean;
  deletedAt: string | null;
  createdAt: string;
}
