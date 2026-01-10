export interface TeamStats {
  id: string;
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
