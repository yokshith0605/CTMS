import {
  User,
  Tournament,
  Team,
  Player,
  Match,
  ScorecardInnings,
  PlayerMatchStats,
  PointsTableEntry,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_TOURNAMENTS,
  INITIAL_TEAMS,
  INITIAL_PLAYERS,
  INITIAL_MATCHES,
  INITIAL_SCORECARDS,
  INITIAL_PLAYER_STATS,
} from './demoData';

const STORAGE_KEYS = {
  USERS: 'ctms_users_v2',
  TOURNAMENTS: 'ctms_tournaments_v2',
  TEAMS: 'ctms_teams_v2',
  PLAYERS: 'ctms_players_v2',
  MATCHES: 'ctms_matches_v2',
  SCORECARDS: 'ctms_scorecards_v2',
  PLAYER_STATS: 'ctms_player_stats_v2',
  POINTS_TABLE: 'ctms_points_table_v2',
  CURRENT_USER: 'ctms_current_user_v2',
};

class DatabaseService {
  private users: User[] = [];
  private tournaments: Tournament[] = [];
  private teams: Team[] = [];
  private players: Player[] = [];
  private matches: Match[] = [];
  private scorecards: ScorecardInnings[] = [];
  private playerStats: PlayerMatchStats[] = [];
  private pointsTable: PointsTableEntry[] = [];
  private currentUser: User | null = null;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.initDatabase();
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  public initDatabase(forceReset = false) {
    if (forceReset) {
      localStorage.removeItem(STORAGE_KEYS.USERS);
      localStorage.removeItem(STORAGE_KEYS.TOURNAMENTS);
      localStorage.removeItem(STORAGE_KEYS.TEAMS);
      localStorage.removeItem(STORAGE_KEYS.PLAYERS);
      localStorage.removeItem(STORAGE_KEYS.MATCHES);
      localStorage.removeItem(STORAGE_KEYS.SCORECARDS);
      localStorage.removeItem(STORAGE_KEYS.PLAYER_STATS);
      localStorage.removeItem(STORAGE_KEYS.POINTS_TABLE);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }

    this.users = this.load(STORAGE_KEYS.USERS, INITIAL_USERS);
    this.tournaments = this.load(STORAGE_KEYS.TOURNAMENTS, INITIAL_TOURNAMENTS);
    this.teams = this.load(STORAGE_KEYS.TEAMS, INITIAL_TEAMS);
    this.players = this.load(STORAGE_KEYS.PLAYERS, INITIAL_PLAYERS);
    this.matches = this.load(STORAGE_KEYS.MATCHES, INITIAL_MATCHES);
    this.scorecards = this.load(STORAGE_KEYS.SCORECARDS, INITIAL_SCORECARDS);
    this.playerStats = this.load(STORAGE_KEYS.PLAYER_STATS, INITIAL_PLAYER_STATS);
    
    // Check current user
    const savedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (savedUser) {
      try {
        this.currentUser = JSON.parse(savedUser);
      } catch {
        this.currentUser = null;
      }
    } else {
      // Default to viewer for initial public visit
      this.currentUser = null;
    }

    // Always recalculate points table to guarantee accuracy
    this.tournaments.forEach((t) => {
      this.recalculatePointsTable(t.id);
    });

    this.notify();
  }

  private load<T>(key: string, defaultValue: T): T {
    const raw = localStorage.getItem(key);
    if (!raw) {
      this.save(key, defaultValue);
      return defaultValue;
    }
    try {
      return JSON.parse(raw);
    } catch {
      this.save(key, defaultValue);
      return defaultValue;
    }
  }

  private save<T>(key: string, data: T) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // ==========================================
  // AUTHENTICATION & SESSIONS
  // ==========================================

  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public setCurrentUser(user: User | null) {
    this.currentUser = user;
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
    this.notify();
  }

  public login(emailOrUsername: string, password?: string): { success: boolean; user?: User; error?: string } {
    const cleanQuery = emailOrUsername.trim().toLowerCase();
    const user = this.users.find(
      (u) =>
        u.email.toLowerCase() === cleanQuery ||
        u.name.toLowerCase() === cleanQuery ||
        u.email.split('@')[0].toLowerCase() === cleanQuery
    );

    if (!user) {
      return { success: false, error: 'User not found. Check your email or username.' };
    }

    if (password && user.password && user.password !== password && password !== 'demo') {
      return { success: false, error: 'Invalid password. Please try again.' };
    }

    this.setCurrentUser(user);
    return { success: true, user };
  }

  public logout() {
    this.setCurrentUser(null);
  }

  public registerTeamManager(name: string, email: string, password?: string, teamName?: string): { success: boolean; user?: User; error?: string } {
    if (!name.trim() || !email.trim()) {
      return { success: false, error: 'Name and Email are required.' };
    }

    const exists = this.users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (exists) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    const newUser: User = {
      id: 'user-' + Date.now(),
      name: name.trim(),
      email: email.trim(),
      password: password || 'manager123',
      role: 'team_manager',
      created_at: new Date().toISOString(),
    };

    this.users.push(newUser);
    this.save(STORAGE_KEYS.USERS, this.users);
    this.setCurrentUser(newUser);
    return { success: true, user: newUser };
  }

  public getUsers(): User[] {
    return [...this.users];
  }

  public addUser(user: Omit<User, 'id' | 'created_at'>): User {
    const newUser: User = {
      ...user,
      id: 'user-' + Date.now(),
      created_at: new Date().toISOString(),
    };
    this.users.push(newUser);
    this.save(STORAGE_KEYS.USERS, this.users);
    this.notify();
    return newUser;
  }

  public updateUser(id: string, updates: Partial<User>): User {
    const idx = this.users.findIndex((u) => u.id === id);
    if (idx === -1) throw new Error('User not found');
    this.users[idx] = { ...this.users[idx], ...updates };
    this.save(STORAGE_KEYS.USERS, this.users);
    if (this.currentUser?.id === id) {
      this.setCurrentUser(this.users[idx]);
    }
    this.notify();
    return this.users[idx];
  }

  public deleteUser(id: string) {
    this.users = this.users.filter((u) => u.id !== id);
    this.save(STORAGE_KEYS.USERS, this.users);
    this.notify();
  }

  // ==========================================
  // TOURNAMENTS
  // ==========================================

  public getTournaments(): Tournament[] {
    return [...this.tournaments];
  }

  public getTournamentById(id: string): Tournament | undefined {
    return this.tournaments.find((t) => t.id === id);
  }

  public createTournament(data: Omit<Tournament, 'id' | 'created_at'>): Tournament {
    if (!data.name.trim()) throw new Error('Tournament name is required.');
    if (!data.location.trim()) throw new Error('Location is required.');
    if (!data.start_date) throw new Error('Start date is required.');
    if (data.end_date && new Date(data.end_date) < new Date(data.start_date)) {
      throw new Error('End date cannot be earlier than start date.');
    }

    const newTournament: Tournament = {
      ...data,
      id: 'tourn-' + Date.now(),
      created_at: new Date().toISOString(),
    };

    this.tournaments.unshift(newTournament);
    this.save(STORAGE_KEYS.TOURNAMENTS, this.tournaments);
    this.recalculatePointsTable(newTournament.id);
    this.notify();
    return newTournament;
  }

  public updateTournament(id: string, updates: Partial<Tournament>): Tournament {
    const idx = this.tournaments.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error('Tournament not found');

    if (updates.name !== undefined && !updates.name.trim()) {
      throw new Error('Tournament name cannot be empty.');
    }

    this.tournaments[idx] = { ...this.tournaments[idx], ...updates };
    this.save(STORAGE_KEYS.TOURNAMENTS, this.tournaments);
    this.notify();
    return this.tournaments[idx];
  }

  public deleteTournament(id: string) {
    // Cascade delete: teams, players, matches, scorecards
    const teamsInTourn = this.teams.filter((t) => t.tournament_id === id);
    const teamIds = new Set(teamsInTourn.map((t) => t.id));

    this.tournaments = this.tournaments.filter((t) => t.id !== id);
    this.teams = this.teams.filter((t) => t.tournament_id !== id);
    this.players = this.players.filter((p) => !teamIds.has(p.team_id));

    const matchesInTourn = this.matches.filter((m) => m.tournament_id === id);
    const matchIds = new Set(matchesInTourn.map((m) => m.id));

    this.matches = this.matches.filter((m) => m.tournament_id !== id);
    this.scorecards = this.scorecards.filter((sc) => !matchIds.has(sc.match_id));
    this.playerStats = this.playerStats.filter((ps) => !matchIds.has(ps.match_id));
    this.pointsTable = this.pointsTable.filter((pt) => pt.tournament_id !== id);

    this.save(STORAGE_KEYS.TOURNAMENTS, this.tournaments);
    this.save(STORAGE_KEYS.TEAMS, this.teams);
    this.save(STORAGE_KEYS.PLAYERS, this.players);
    this.save(STORAGE_KEYS.MATCHES, this.matches);
    this.save(STORAGE_KEYS.SCORECARDS, this.scorecards);
    this.save(STORAGE_KEYS.PLAYER_STATS, this.playerStats);
    this.save(STORAGE_KEYS.POINTS_TABLE, this.pointsTable);
    this.notify();
  }

  // ==========================================
  // TEAMS
  // ==========================================

  public getTeams(tournamentId?: string): Team[] {
    if (tournamentId) {
      return this.teams.filter((t) => t.tournament_id === tournamentId);
    }
    return [...this.teams];
  }

  public getTeamById(id: string): Team | undefined {
    return this.teams.find((t) => t.id === id);
  }

  public createTeam(data: Omit<Team, 'id' | 'created_at'>): Team {
    if (!data.name.trim()) throw new Error('Team name is required.');
    if (!data.tournament_id) throw new Error('Please select a tournament.');

    // Duplicate check within same tournament
    const exists = this.teams.some(
      (t) =>
        t.tournament_id === data.tournament_id &&
        t.name.trim().toLowerCase() === data.name.trim().toLowerCase()
    );
    if (exists) {
      throw new Error('This team is already registered for this tournament.');
    }

    const newTeam: Team = {
      ...data,
      id: 'team-' + Date.now(),
      created_at: new Date().toISOString(),
      logo: data.logo || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=160&auto=format&fit=crop&q=80',
    };

    this.teams.push(newTeam);
    this.save(STORAGE_KEYS.TEAMS, this.teams);
    this.recalculatePointsTable(data.tournament_id);
    this.notify();
    return newTeam;
  }

  public updateTeam(id: string, updates: Partial<Team>): Team {
    const idx = this.teams.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error('Team not found');

    if (updates.name) {
      const tournId = updates.tournament_id || this.teams[idx].tournament_id;
      const dup = this.teams.some(
        (t) =>
          t.id !== id &&
          t.tournament_id === tournId &&
          t.name.trim().toLowerCase() === updates.name!.trim().toLowerCase()
      );
      if (dup) throw new Error('Another team in this tournament already has this name.');
    }

    this.teams[idx] = { ...this.teams[idx], ...updates };
    this.save(STORAGE_KEYS.TEAMS, this.teams);
    this.notify();
    return this.teams[idx];
  }

  public deleteTeam(id: string) {
    const team = this.teams.find((t) => t.id === id);
    if (!team) return;

    // Remove team, players, and match references
    this.teams = this.teams.filter((t) => t.id !== id);
    this.players = this.players.filter((p) => p.team_id !== id);
    
    // Invalidate or update matches involving this team
    this.matches = this.matches.filter((m) => m.team1_id !== id && m.team2_id !== id);
    
    this.save(STORAGE_KEYS.TEAMS, this.teams);
    this.save(STORAGE_KEYS.PLAYERS, this.players);
    this.save(STORAGE_KEYS.MATCHES, this.matches);
    this.recalculatePointsTable(team.tournament_id);
    this.notify();
  }

  // ==========================================
  // PLAYERS
  // ==========================================

  public getPlayers(teamId?: string): Player[] {
    if (teamId) {
      return this.players.filter((p) => p.team_id === teamId);
    }
    return [...this.players];
  }

  public getPlayerById(id: string): Player | undefined {
    return this.players.find((p) => p.id === id);
  }

  public createPlayer(data: Omit<Player, 'id' | 'created_at'>): Player {
    if (!data.name.trim()) throw new Error('Player name is required.');
    if (!data.team_id) throw new Error('Player must belong to a valid team.');
    if (data.jersey_number === undefined || data.jersey_number === null || isNaN(data.jersey_number)) {
      throw new Error('Valid jersey number is required.');
    }

    // Unique jersey number within same team
    const dupJersey = this.players.some(
      (p) => p.team_id === data.team_id && p.jersey_number === Number(data.jersey_number)
    );
    if (dupJersey) {
      throw new Error(`Jersey #${data.jersey_number} is already taken by another player in this team.`);
    }

    const newPlayer: Player = {
      ...data,
      jersey_number: Number(data.jersey_number),
      age: Number(data.age) || 21,
      id: 'player-' + Date.now(),
      created_at: new Date().toISOString(),
      photo: data.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&auto=format&fit=crop&q=80',
    };

    this.players.push(newPlayer);
    this.save(STORAGE_KEYS.PLAYERS, this.players);
    this.notify();
    return newPlayer;
  }

  public updatePlayer(id: string, updates: Partial<Player>): Player {
    const idx = this.players.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Player not found');

    const target = this.players[idx];
    const newTeamId = updates.team_id || target.team_id;
    const newJersey = updates.jersey_number !== undefined ? Number(updates.jersey_number) : target.jersey_number;

    if (newJersey !== target.jersey_number || newTeamId !== target.team_id) {
      const dup = this.players.some(
        (p) => p.id !== id && p.team_id === newTeamId && p.jersey_number === newJersey
      );
      if (dup) {
        throw new Error(`Jersey #${newJersey} is already taken by another player in this team.`);
      }
    }

    this.players[idx] = {
      ...this.players[idx],
      ...updates,
      jersey_number: newJersey,
      age: updates.age !== undefined ? Number(updates.age) : target.age,
    };
    this.save(STORAGE_KEYS.PLAYERS, this.players);
    this.notify();
    return this.players[idx];
  }

  public deletePlayer(id: string) {
    this.players = this.players.filter((p) => p.id !== id);
    this.save(STORAGE_KEYS.PLAYERS, this.players);
    this.notify();
  }

  public getPlayerCareerStats(playerId: string) {
    const stats = this.playerStats.filter((ps) => ps.player_id === playerId);
    const matchesCount = stats.length;
    const totalRuns = stats.reduce((acc, curr) => acc + (curr.runs || 0), 0);
    const totalBalls = stats.reduce((acc, curr) => acc + (curr.balls || 0), 0);
    const totalFours = stats.reduce((acc, curr) => acc + (curr.fours || 0), 0);
    const totalSixes = stats.reduce((acc, curr) => acc + (curr.sixes || 0), 0);
    const dismissals = stats.filter((s) => s.is_out).length;
    const battingAvg = dismissals > 0 ? (totalRuns / dismissals).toFixed(2) : totalRuns.toString();
    const battingSr = totalBalls > 0 ? ((totalRuns / totalBalls) * 100).toFixed(2) : '0.00';

    const totalWickets = stats.reduce((acc, curr) => acc + (curr.wickets || 0), 0);
    const totalBallsBowled = stats.reduce((acc, curr) => acc + (curr.balls_bowled || 0), 0);
    const totalRunsConceded = stats.reduce((acc, curr) => acc + (curr.runs_conceded || 0), 0);
    const oversBowledDecimal = totalBallsBowled / 6;
    const bowlingEconomy = oversBowledDecimal > 0 ? (totalRunsConceded / oversBowledDecimal).toFixed(2) : '0.00';

    return {
      matchesCount,
      totalRuns,
      totalBalls,
      totalFours,
      totalSixes,
      battingAvg,
      battingSr,
      totalWickets,
      totalBallsBowled,
      totalRunsConceded,
      bowlingEconomy,
    };
  }

  // ==========================================
  // MATCHES
  // ==========================================

  public getMatches(tournamentId?: string): Match[] {
    if (tournamentId) {
      return this.matches.filter((m) => m.tournament_id === tournamentId);
    }
    return [...this.matches];
  }

  public getMatchById(id: string): Match | undefined {
    return this.matches.find((m) => m.id === id);
  }

  public createMatch(data: Omit<Match, 'id' | 'created_at'>): Match {
    if (!data.tournament_id) throw new Error('Please select a tournament.');
    if (!data.team1_id || !data.team2_id) throw new Error('Both Team 1 and Team 2 are required.');
    if (data.team1_id === data.team2_id) {
      throw new Error('Team 1 and Team 2 must be different teams.');
    }
    if (!data.match_date) throw new Error('Please select a valid match date.');
    if (!data.venue.trim()) throw new Error('Match venue is required.');

    const newMatch: Match = {
      ...data,
      id: 'match-' + Date.now(),
      status: data.status || 'Scheduled',
      created_at: new Date().toISOString(),
    };

    this.matches.push(newMatch);
    this.save(STORAGE_KEYS.MATCHES, this.matches);
    this.notify();
    return newMatch;
  }

  public updateMatch(id: string, updates: Partial<Match>): Match {
    const idx = this.matches.findIndex((m) => m.id === id);
    if (idx === -1) throw new Error('Match not found');

    const current = this.matches[idx];
    const team1 = updates.team1_id || current.team1_id;
    const team2 = updates.team2_id || current.team2_id;

    if (team1 === team2) {
      throw new Error('Team 1 and Team 2 cannot be the same team.');
    }

    const updated = { ...current, ...updates };
    this.matches[idx] = updated;
    this.save(STORAGE_KEYS.MATCHES, this.matches);

    // If match was completed or winner changed, recalculate Points Table
    if (updated.status === 'Completed' || current.status === 'Completed') {
      this.recalculatePointsTable(updated.tournament_id);
    }

    this.notify();
    return updated;
  }

  public deleteMatch(id: string) {
    const match = this.matches.find((m) => m.id === id);
    if (!match) return;

    this.matches = this.matches.filter((m) => m.id !== id);
    this.scorecards = this.scorecards.filter((sc) => sc.match_id !== id);
    this.playerStats = this.playerStats.filter((ps) => ps.match_id !== id);

    this.save(STORAGE_KEYS.MATCHES, this.matches);
    this.save(STORAGE_KEYS.SCORECARDS, this.scorecards);
    this.save(STORAGE_KEYS.PLAYER_STATS, this.playerStats);

    this.recalculatePointsTable(match.tournament_id);
    this.notify();
  }

  // ==========================================
  // SCORECARDS & LIVE SCORING
  // ==========================================

  public getScorecardsForMatch(matchId: string): ScorecardInnings[] {
    return this.scorecards.filter((sc) => sc.match_id === matchId).sort((a, b) => a.innings_number - b.innings_number);
  }

  public getPlayerStatsForMatch(matchId: string, inningsNumber?: 1 | 2): PlayerMatchStats[] {
    return this.playerStats
      .filter((ps) => ps.match_id === matchId && (inningsNumber === undefined || ps.innings_number === inningsNumber));
  }

  public saveInningsScore(
    matchId: string,
    inningsNumber: 1 | 2,
    battingTeamId: string,
    bowlingTeamId: string,
    runs: number,
    wickets: number,
    overs: number,
    balls: number,
    extras: { wides: number; no_balls: number; byes: number; leg_byes: number; total: number }
  ): ScorecardInnings {
    const existingIdx = this.scorecards.findIndex(
      (sc) => sc.match_id === matchId && sc.innings_number === inningsNumber
    );

    const resultSummary = `${runs}/${wickets} (${overs} Ov)`;

    let inningsRecord: ScorecardInnings;
    if (existingIdx !== -1) {
      inningsRecord = {
        ...this.scorecards[existingIdx],
        batting_team_id: battingTeamId,
        bowling_team_id: bowlingTeamId,
        runs,
        wickets,
        overs,
        balls,
        extras,
        result: resultSummary,
      };
      this.scorecards[existingIdx] = inningsRecord;
    } else {
      inningsRecord = {
        id: `sc-${matchId}-inn${inningsNumber}`,
        match_id: matchId,
        innings_number: inningsNumber,
        batting_team_id: battingTeamId,
        bowling_team_id: bowlingTeamId,
        runs,
        wickets,
        overs,
        balls,
        extras,
        result: resultSummary,
        created_at: new Date().toISOString(),
      };
      this.scorecards.push(inningsRecord);
    }

    this.save(STORAGE_KEYS.SCORECARDS, this.scorecards);
    this.notify();
    return inningsRecord;
  }

  public savePlayerStats(stats: PlayerMatchStats[]): void {
    stats.forEach((newStat) => {
      const idx = this.playerStats.findIndex(
        (ps) => ps.match_id === newStat.match_id && ps.player_id === newStat.player_id && ps.innings_number === newStat.innings_number
      );
      if (idx !== -1) {
        this.playerStats[idx] = { ...this.playerStats[idx], ...newStat };
      } else {
        this.playerStats.push(newStat);
      }
    });

    this.save(STORAGE_KEYS.PLAYER_STATS, this.playerStats);
    this.notify();
  }

  public finishMatchAndRecordResult(
    matchId: string,
    winnerTeamId: string | undefined,
    resultDescription: string
  ): Match {
    const match = this.getMatchById(matchId);
    if (!match) throw new Error('Match not found');

    const updated = this.updateMatch(matchId, {
      status: 'Completed',
      winner_team_id: winnerTeamId,
      result_description: resultDescription,
    });

    // Auto-calculate Points Table
    this.recalculatePointsTable(match.tournament_id);
    return updated;
  }

  // ==========================================
  // POINTS TABLE & AUTOMATIC CALCULATIONS
  // ==========================================

  public getPointsTable(tournamentId: string): PointsTableEntry[] {
    return this.pointsTable
      .filter((pt) => pt.tournament_id === tournamentId)
      .sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        return b.net_run_rate - a.net_run_rate;
      });
  }

  public recalculatePointsTable(tournamentId: string): PointsTableEntry[] {
    const teams = this.getTeams(tournamentId);
    const matches = this.matches.filter((m) => m.tournament_id === tournamentId && m.status === 'Completed');

    // Initialize stats map for each team
    const statsMap: Record<
      string,
      {
        played: number;
        wins: number;
        losses: number;
        ties: number;
        noResults: number;
        points: number;
        runsScored: number;
        ballsFaced: number;
        runsConceded: number;
        ballsBowled: number;
      }
    > = {};

    teams.forEach((t) => {
      statsMap[t.id] = {
        played: 0,
        wins: 0,
        losses: 0,
        ties: 0,
        noResults: 0,
        points: 0,
        runsScored: 0,
        ballsFaced: 0,
        runsConceded: 0,
        ballsBowled: 0,
      };
    });

    matches.forEach((m) => {
      const t1 = m.team1_id;
      const t2 = m.team2_id;

      if (!statsMap[t1]) {
        statsMap[t1] = { played: 0, wins: 0, losses: 0, ties: 0, noResults: 0, points: 0, runsScored: 0, ballsFaced: 0, runsConceded: 0, ballsBowled: 0 };
      }
      if (!statsMap[t2]) {
        statsMap[t2] = { played: 0, wins: 0, losses: 0, ties: 0, noResults: 0, points: 0, runsScored: 0, ballsFaced: 0, runsConceded: 0, ballsBowled: 0 };
      }

      statsMap[t1].played += 1;
      statsMap[t2].played += 1;

      if (m.winner_team_id === t1) {
        statsMap[t1].wins += 1;
        statsMap[t1].points += 2;
        statsMap[t2].losses += 1;
      } else if (m.winner_team_id === t2) {
        statsMap[t2].wins += 1;
        statsMap[t2].points += 2;
        statsMap[t1].losses += 1;
      } else if (m.result_description?.toLowerCase().includes('tie')) {
        statsMap[t1].ties += 1;
        statsMap[t1].points += 1;
        statsMap[t2].ties += 1;
        statsMap[t2].points += 1;
      } else {
        // No result / abandoned
        statsMap[t1].noResults += 1;
        statsMap[t1].points += 1;
        statsMap[t2].noResults += 1;
        statsMap[t2].points += 1;
      }

      // Compute Net Run Rate inputs from scorecards
      const sc1 = this.scorecards.find((sc) => sc.match_id === m.id && sc.innings_number === 1);
      const sc2 = this.scorecards.find((sc) => sc.match_id === m.id && sc.innings_number === 2);

      if (sc1 && sc2) {
        const inn1Batting = sc1.batting_team_id;
        const inn2Batting = sc2.batting_team_id;

        // Innings 1
        // If all out (10 wickets in standard match), full 20 overs (120 balls) is considered in NRR
        const inn1BallsFaced = sc1.wickets >= 10 ? 120 : (sc1.balls || Math.floor(sc1.overs) * 6 + Math.round((sc1.overs % 1) * 10));
        if (statsMap[inn1Batting]) {
          statsMap[inn1Batting].runsScored += sc1.runs;
          statsMap[inn1Batting].ballsFaced += Math.max(inn1BallsFaced, 1);
        }
        if (statsMap[sc1.bowling_team_id]) {
          statsMap[sc1.bowling_team_id].runsConceded += sc1.runs;
          statsMap[sc1.bowling_team_id].ballsBowled += Math.max(inn1BallsFaced, 1);
        }

        // Innings 2
        const inn2BallsFaced = sc2.wickets >= 10 ? 120 : (sc2.balls || Math.floor(sc2.overs) * 6 + Math.round((sc2.overs % 1) * 10));
        if (statsMap[inn2Batting]) {
          statsMap[inn2Batting].runsScored += sc2.runs;
          statsMap[inn2Batting].ballsFaced += Math.max(inn2BallsFaced, 1);
        }
        if (statsMap[sc2.bowling_team_id]) {
          statsMap[sc2.bowling_team_id].runsConceded += sc2.runs;
          statsMap[sc2.bowling_team_id].ballsBowled += Math.max(inn2BallsFaced, 1);
        }
      }
    });

    // Generate table entries
    const updatedEntries: PointsTableEntry[] = teams.map((team) => {
      const s = statsMap[team.id] || { played: 0, wins: 0, losses: 0, ties: 0, noResults: 0, points: 0, runsScored: 0, ballsFaced: 0, runsConceded: 0, ballsBowled: 0 };
      
      const oversFaced = s.ballsFaced / 6;
      const oversBowled = s.ballsBowled / 6;

      const runRateFor = oversFaced > 0 ? s.runsScored / oversFaced : 0;
      const runRateAgainst = oversBowled > 0 ? s.runsConceded / oversBowled : 0;
      const nrr = s.played > 0 ? Number((runRateFor - runRateAgainst).toFixed(3)) : 0.000;

      return {
        id: `pt-${tournamentId}-${team.id}`,
        tournament_id: tournamentId,
        team_id: team.id,
        matches_played: s.played,
        wins: s.wins,
        losses: s.losses,
        ties: s.ties,
        no_results: s.noResults,
        points: s.points,
        net_run_rate: nrr,
        runs_scored: s.runsScored,
        overs_faced: Number(oversFaced.toFixed(1)),
        runs_conceded: s.runsConceded,
        overs_bowled: Number(oversBowled.toFixed(1)),
        updated_at: new Date().toISOString(),
      };
    });

    // Replace entries for this tournament
    this.pointsTable = [
      ...this.pointsTable.filter((pt) => pt.tournament_id !== tournamentId),
      ...updatedEntries,
    ];

    this.save(STORAGE_KEYS.POINTS_TABLE, this.pointsTable);
    return this.getPointsTable(tournamentId);
  }

  // ==========================================
  // DASHBOARD STATISTICS
  // ==========================================

  public getAdminStats() {
    return {
      totalTournaments: this.tournaments.length,
      activeTournaments: this.tournaments.filter((t) => t.status === 'Ongoing').length,
      totalTeams: this.teams.length,
      totalPlayers: this.players.length,
      totalMatches: this.matches.length,
      completedMatches: this.matches.filter((m) => m.status === 'Completed').length,
      upcomingMatches: this.matches.filter((m) => m.status === 'Scheduled').length,
      liveMatches: this.matches.filter((m) => m.status === 'Live').length,
    };
  }

  public getManagerStats(teamId: string) {
    const team = this.getTeamById(teamId);
    if (!team) {
      return {
        teamName: 'Unknown Team',
        playersCount: 0,
        upcomingMatches: 0,
        wins: 0,
        losses: 0,
        points: 0,
        nrr: 0,
      };
    }

    const playersCount = this.getPlayers(teamId).length;
    const teamMatches = this.matches.filter((m) => m.team1_id === teamId || m.team2_id === teamId);
    const upcomingMatches = teamMatches.filter((m) => m.status === 'Scheduled').length;
    const completedMatches = teamMatches.filter((m) => m.status === 'Completed');
    const wins = completedMatches.filter((m) => m.winner_team_id === teamId).length;
    const losses = completedMatches.filter((m) => m.winner_team_id && m.winner_team_id !== teamId).length;

    const ptEntry = this.pointsTable.find((pt) => pt.tournament_id === team.tournament_id && pt.team_id === teamId);

    return {
      teamName: team.name,
      teamShortName: team.short_name,
      playersCount,
      upcomingMatches,
      wins,
      losses,
      points: ptEntry ? ptEntry.points : wins * 2,
      nrr: ptEntry ? ptEntry.net_run_rate : 0,
    };
  }

  public getScorerStats() {
    return {
      todayMatches: this.matches.filter((m) => m.status === 'Scheduled' || m.status === 'Live').length,
      liveMatches: this.matches.filter((m) => m.status === 'Live').length,
      completedMatches: this.matches.filter((m) => m.status === 'Completed').length,
      upcomingMatches: this.matches.filter((m) => m.status === 'Scheduled').length,
    };
  }

  public getMatchesForTeam(teamId: string): Match[] {
    return this.matches.filter((m) => m.team1_id === teamId || m.team2_id === teamId);
  }

  public resetToInitialSeed(): void {
    this.initDatabase(true);
  }

  public getPointsTables(): PointsTableEntry[] {
    return [...this.pointsTable];
  }

  public updateUserRole(userId: string, role: any): User {
    return this.updateUser(userId, { role });
  }
}

export const db = new DatabaseService();
