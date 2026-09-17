import React, { useState } from 'react';
import { Match, ScorecardInnings, PlayerMatchStats, Team } from '../../types';
import { db } from '../../services/db';
import { Trophy, Calendar, MapPin, Award, CheckCircle2, ChevronDown } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

interface ScorecardViewProps {
  match?: Match;
  matchId?: string;
}

export const ScorecardView: React.FC<ScorecardViewProps> = ({ match: propMatch, matchId }) => {
  const match = propMatch || (matchId ? db.getMatchById(matchId) : undefined);

  if (!match) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-slate-600 font-bold">Match details not found.</p>
      </div>
    );
  }

  const tournament = db.getTournamentById(match.tournament_id);
  const team1: Team | undefined = db.getTeamById(match.team1_id);
  const team2: Team | undefined = db.getTeamById(match.team2_id);
  const winnerTeam: Team | undefined = match.winner_team_id ? db.getTeamById(match.winner_team_id) : undefined;

  const scorecards = db.getScorecardsForMatch(match.id);
  const inn1 = scorecards.find((s) => s.innings_number === 1);
  const inn2 = scorecards.find((s) => s.innings_number === 2);

  const inn1Stats = db.getPlayerStatsForMatch(match.id, 1);
  const inn2Stats = db.getPlayerStatsForMatch(match.id, 2);

  const [activeTab, setActiveTab] = useState<1 | 2>(1);

  // Teams for Innings 1
  const inn1BattingTeam = inn1 ? db.getTeamById(inn1.batting_team_id) : team1;
  const inn1BowlingTeam = inn1 ? db.getTeamById(inn1.bowling_team_id) : team2;

  // Teams for Innings 2
  const inn2BattingTeam = inn2 ? db.getTeamById(inn2.batting_team_id) : team2;
  const inn2BowlingTeam = inn2 ? db.getTeamById(inn2.bowling_team_id) : team1;

  const renderInningsTable = (
    inningsNumber: 1 | 2,
    innings: ScorecardInnings | undefined,
    battingTeam: Team | undefined,
    bowlingTeam: Team | undefined,
    stats: PlayerMatchStats[]
  ) => {
    if (!innings) {
      return (
        <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200">
          <p className="text-slate-500 text-sm">Innings {inningsNumber} has not started or has no recorded data.</p>
        </div>
      );
    }

    // Split stats into batters (who batted or faced balls/scored runs) and bowlers (overs_bowled > 0)
    const batters = stats.filter((s) => s.balls > 0 || s.runs > 0 || s.is_out || s.team_id === battingTeam?.id);
    const bowlers = stats.filter((s) => s.overs_bowled > 0 || s.balls_bowled > 0 || s.runs_conceded > 0);

    return (
      <div className="space-y-6">
        {/* Innings Summary Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-emerald-950 text-white rounded-xl shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/10 p-1 flex items-center justify-center">
              {battingTeam?.logo && <img src={battingTeam.logo} alt="" className="w-full h-full object-cover rounded" />}
            </div>
            <div>
              <h4 className="font-bold text-base font-heading">
                {battingTeam?.name} <span className="text-xs font-normal text-emerald-300">({battingTeam?.short_name}) - Innings {inningsNumber}</span>
              </h4>
              <p className="text-xs text-emerald-200">
                vs {bowlingTeam?.name}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold font-mono text-emerald-300">
              {innings.runs}/{innings.wickets}
            </div>
            <p className="text-xs text-emerald-200 font-mono">
              Overs: {innings.overs} | Extras: {innings.extras?.total || 0}
            </p>
          </div>
        </div>

        {/* Batting Table */}
        <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 font-bold text-xs uppercase tracking-wider text-slate-600">
            Batting
          </div>
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase">
                <th className="py-2.5 px-4">Batter</th>
                <th className="py-2.5 px-3">Dismissal</th>
                <th className="py-2.5 px-2 text-center font-bold text-slate-800">R</th>
                <th className="py-2.5 px-2 text-center">B</th>
                <th className="py-2.5 px-2 text-center">4s</th>
                <th className="py-2.5 px-2 text-center">6s</th>
                <th className="py-2.5 pr-4 text-right">SR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {batters.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-4 px-4 text-center text-slate-400 text-xs">
                    No individual batting details recorded for this innings.
                  </td>
                </tr>
              ) : (
                batters.map((b) => (
                  <tr key={b.id || b.player_id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {b.player_name}
                    </td>
                    <td className="py-3 px-3 text-slate-500 text-xs italic">
                      {b.dismissal_info || (b.is_out ? 'out' : 'not out')}
                    </td>
                    <td className="py-3 px-2 text-center font-mono font-bold text-slate-900 bg-slate-50/50">
                      {b.runs}
                    </td>
                    <td className="py-3 px-2 text-center font-mono text-slate-600">{b.balls}</td>
                    <td className="py-3 px-2 text-center font-mono text-slate-600">{b.fours}</td>
                    <td className="py-3 px-2 text-center font-mono text-slate-600">{b.sixes}</td>
                    <td className="py-3 pr-4 text-right font-mono font-semibold text-slate-700">
                      {b.strike_rate || (b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(1) : '0.0')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {/* Extras row */}
            <tfoot>
              <tr className="bg-slate-50 border-t border-slate-200 text-xs text-slate-600 font-medium">
                <td colSpan={2} className="py-2.5 px-4 font-semibold">
                  Extras: (w {innings.extras?.wides || 0}, nb {innings.extras?.no_balls || 0}, b {innings.extras?.byes || 0}, lb {innings.extras?.leg_byes || 0})
                </td>
                <td className="py-2.5 px-2 text-center font-mono font-bold text-slate-900 bg-slate-100">
                  {innings.extras?.total || 0}
                </td>
                <td colSpan={4} className="py-2.5 pr-4 text-right font-semibold text-slate-800">
                  Total: <span className="font-mono font-bold text-emerald-900">{innings.runs}/{innings.wickets}</span> ({innings.overs} Ov, RR: {(innings.overs > 0 ? (innings.runs / innings.overs).toFixed(2) : '0.00')})
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Bowling Table */}
        <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 font-bold text-xs uppercase tracking-wider text-slate-600">
            Bowling
          </div>
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase">
                <th className="py-2.5 px-4">Bowler</th>
                <th className="py-2.5 px-2 text-center">O</th>
                <th className="py-2.5 px-2 text-center">M</th>
                <th className="py-2.5 px-2 text-center">R</th>
                <th className="py-2.5 px-2 text-center font-bold text-slate-900">W</th>
                <th className="py-2.5 pr-4 text-right">Econ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bowlers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-4 px-4 text-center text-slate-400 text-xs">
                    No individual bowling details recorded for this innings.
                  </td>
                </tr>
              ) : (
                bowlers.map((bw) => (
                  <tr key={bw.id || bw.player_id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {bw.player_name}
                    </td>
                    <td className="py-3 px-2 text-center font-mono text-slate-600">{bw.overs_bowled}</td>
                    <td className="py-3 px-2 text-center font-mono text-slate-600">{bw.maidens}</td>
                    <td className="py-3 px-2 text-center font-mono text-slate-600">{bw.runs_conceded}</td>
                    <td className="py-3 px-2 text-center font-mono font-bold text-emerald-800 bg-slate-50/50">
                      {bw.wickets}
                    </td>
                    <td className="py-3 pr-4 text-right font-mono font-semibold text-slate-700">
                      {bw.economy || (bw.overs_bowled > 0 ? (bw.runs_conceded / bw.overs_bowled).toFixed(2) : '0.00')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Match Information Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              {match.match_type} Match
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading mt-2">
              {team1?.name} vs {team2?.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {tournament?.name}
            </p>
          </div>
          <StatusBadge status={match.status} />
        </div>

        {/* Match details metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>{match.match_date} at {match.match_time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-400" />
            <span>{match.venue}</span>
          </div>
          {match.toss_winner_team_id && (
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span>
                Toss: {db.getTeamById(match.toss_winner_team_id)?.short_name} elected to {match.toss_decision}
              </span>
            </div>
          )}
        </div>

        {/* Result Announcement */}
        {match.result_description && (
          <div className="mt-4 p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2.5 text-amber-900 text-sm font-semibold">
            <Trophy className="w-5 h-5 text-amber-600 shrink-0" />
            <span>Result: {match.result_description}</span>
          </div>
        )}
      </div>

      {/* Innings Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab(1)}
          className={`pb-3 px-4 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 1
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>1st Innings: {inn1BattingTeam?.short_name || 'Team 1'}</span>
          {inn1 && <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-700">{inn1.runs}/{inn1.wickets}</span>}
        </button>

        <button
          onClick={() => setActiveTab(2)}
          className={`pb-3 px-4 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 2
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>2nd Innings: {inn2BattingTeam?.short_name || 'Team 2'}</span>
          {inn2 && <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-700">{inn2.runs}/{inn2.wickets}</span>}
        </button>
      </div>

      {/* Active Innings Content */}
      {activeTab === 1 && renderInningsTable(1, inn1, inn1BattingTeam, inn1BowlingTeam, inn1Stats)}
      {activeTab === 2 && renderInningsTable(2, inn2, inn2BattingTeam, inn2BowlingTeam, inn2Stats)}
    </div>
  );
};
