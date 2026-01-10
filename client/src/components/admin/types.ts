// Admin types
export interface Team {
  id: string;
  name: string;
  city: string;
  logoUrl: string;
  conference: string;
  division: string;
}

export interface Matchup {
  id: string;
  week: number;
  stage: string;
  homeTeamId: string;
  awayTeamId: string;
  homeTeam: Team;
  awayTeam: Team;
  isFinished: boolean;
  winnerId: string | null;
  homeScore: number | null;
  awayScore: number | null;
  startTime: string;
}

export interface MatchupForm {
    id?: string;
    week: number;
    stage: string;
    homeTeamId: string;
    awayTeamId: string;
    startTime: Date;
    homeTeam?: Team;
    awayTeam?: Team;
    isFinished?: boolean;
    winnerId?: string | null;
    homeScore?: number | null;
    awayScore?: number | null;
}

export interface AuditLog {
    id: string;
    action: string;
    details: string;
    createdAt: string;
    user: { username: string } | null;
}

export interface User {
  id: string;
  username: string;
  email: string;
  score: number;
  role: string;
  isActive: boolean;
  deletedAt: string | null;
  createdAt: string;
}