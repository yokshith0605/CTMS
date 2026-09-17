export type UserRole = 'admin' | 'team_manager' | 'scorer' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  team_id?: string; // If role is team_manager, points to their assigned team
  created_at: string;
}

export type TournamentFormat = 'T20' | 'ODI' | 'Test' | 'Custom';
export type TournamentStatus = 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';

export interface Tournament {
  id: string;
  name: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string;
  format: TournamentFormat;
  status: TournamentStatus;
  max_teams: number;
  created_at: string;
}

export interface Team {
  id: string;
  tournament_id: string;
  name: string;
  short_name: string;
  logo: string;
  captain: string;
  coach: string;
  manager: string;
  contact: string;
  created_at: string;
}

export type PlayerRole = 'Batsman' | 'Bowler' | 'All-Rounder' | 'Wicketkeeper';

export interface Player {
  id: string;
  team_id: string;
  name: string;
  date_of_birth: string;
  age: number;
  jersey_number: number;
  role: PlayerRole;
  batting_style: string;
  bowling_style: string;
  contact: string;
  photo: string;
  created_at: string;
}

export type MatchStatus = 'Scheduled' | 'Live' | 'Completed' | 'Cancelled';
export type MatchType = 'League' | 'Semi-Final' | 'Final' | 'Qualifier' | 'Eliminator';

export interface Match {
  id: string;
  tournament_id: string;
  team1_id: string;
  team2_id: string;
  match_date: string;
  match_time: string;
  venue: string;
  match_type: MatchType;
  status: MatchStatus;
  winner_team_id?: string;
  result_description?: string;
  toss_winner_team_id?: string;
  toss_decision?: 'bat' | 'bowl';
  current_innings?: 1 | 2;
  created_at: string;
}

export interface InningsExtras {
  wides: number;
  no_balls: number;
  byes: number;
  leg_byes: number;
  penalty?: number;
  total: number;
}

export interface ScorecardInnings {
  id: string;
  match_id: string;
  innings_number: 1 | 2;
  batting_team_id: string;
  bowling_team_id: string;
  runs: number;
  wickets: number;
  overs: number; // e.g. 19.4 -> 19 overs + 4 balls
  balls: number; // exact ball count e.g. 118
  extras: InningsExtras;
  result?: string;
  created_at: string;
}

export interface PlayerMatchStats {
  id: string;
  match_id: string;
  player_id: string;
  player_name: string;
  team_id: string;
  innings_number: 1 | 2;
  // Batting
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  is_out: boolean;
  dismissal_info?: string;
  strike_rate: number;
  // Bowling
  overs_bowled: number;
  balls_bowled: number;
  maidens: number;
  runs_conceded: number;
  wickets: number;
  economy: number;
  created_at: string;
}

export interface PointsTableEntry {
  id: string;
  tournament_id: string;
  team_id: string;
  matches_played: number;
  wins: number;
  losses: number;
  ties: number;
  no_results: number;
  points: number;
  net_run_rate: number;
  runs_scored: number;
  overs_faced: number;
  runs_conceded: number;
  overs_bowled: number;
  updated_at: string;
}

export interface LiveBallEvent {
  id: string;
  match_id: string;
  innings_number: 1 | 2;
  over_number: number;
  ball_number: number;
  batsman_id: string;
  bowler_id: string;
  runs: number;
  is_wicket: boolean;
  wicket_type?: string;
  extra_type?: 'wide' | 'no_ball' | 'bye' | 'leg_bye' | 'none';
  extra_runs?: number;
  commentary?: string;
  timestamp: string;
}
