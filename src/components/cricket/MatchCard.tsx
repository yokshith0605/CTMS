import React from 'react';
import { Match, Team } from '../../types';
import { db } from '../../services/db';
import { StatusBadge } from '../common/StatusBadge';
import { Calendar, MapPin, Clock, Trophy, ChevronRight, Activity } from 'lucide-react';
import { useRouter } from '../../services/router';

interface MatchCardProps {
  match: Match;
  onEdit?: (match: Match) => void;
  canScore?: boolean;
  canManage?: boolean;
}

export const MatchCard: React.FC<MatchCardProps> = ({
  match,
  onEdit,
  canScore = false,
  canManage = false,
}) => {
  const { navigate } = useRouter();
  const team1: Team | undefined = db.getTeamById(match.team1_id);
  const team2: Team | undefined = db.getTeamById(match.team2_id);
  const scorecards = db.getScorecardsForMatch(match.id);
  const inn1 = scorecards.find((s) => s.innings_number === 1);
  const inn2 = scorecards.find((s) => s.innings_number === 2);

  const getTeamScoreText = (teamId: string) => {
    if (inn1 && inn1.batting_team_id === teamId) {
      return `${inn1.runs}/${inn1.wickets} (${inn1.overs} ov)`;
    }
    if (inn2 && inn2.batting_team_id === teamId) {
      return `${inn2.runs}/${inn2.wickets} (${inn2.overs} ov)`;
    }
    return null;
  };

  const team1Score = team1 ? getTeamScoreText(team1.id) : null;
  const team2Score = team2 ? getTeamScoreText(team2.id) : null;

  const isLive = match.status === 'Live';
  const isCompleted = match.status === 'Completed';

  return (
    <div className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-2xs hover:shadow-md ${
      isLive ? 'border-red-200 ring-1 ring-red-100' : 'border-slate-200'
    }`}>
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50/80 border-b border-slate-100 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">{match.match_type}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {match.match_date}
          </span>
          <span className="hidden sm:inline-flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {match.match_time}
          </span>
        </div>
        <StatusBadge status={match.status} size="sm" />
      </div>

      {/* Main Match Body */}
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-4">
          {/* Team 1 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                {team1?.logo ? (
                  <img src={team1.logo} alt={team1.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-bold text-slate-600 text-xs">{team1?.short_name || 'T1'}</span>
                )}
              </div>
              <div className="truncate">
                <p className="font-bold text-slate-900 text-sm sm:text-base truncate">
                  {team1?.name || 'Team 1'}
                </p>
                <span className="text-xs font-semibold text-slate-500">
                  {team1?.short_name || 'T1'}
                </span>
              </div>
            </div>
            {team1Score && (
              <p className="mt-2 text-sm sm:text-base font-bold text-emerald-800 font-mono">
                {team1Score}
              </p>
            )}
          </div>

          {/* VS Divider */}
          <div className="flex flex-col items-center justify-center px-2 shrink-0">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
              VS
            </span>
          </div>

          {/* Team 2 */}
          <div className="flex-1 min-w-0 text-right">
            <div className="flex items-center justify-end gap-3">
              <div className="truncate">
                <p className="font-bold text-slate-900 text-sm sm:text-base truncate">
                  {team2?.name || 'Team 2'}
                </p>
                <span className="text-xs font-semibold text-slate-500">
                  {team2?.short_name || 'T2'}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                {team2?.logo ? (
                  <img src={team2.logo} alt={team2.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-bold text-slate-600 text-xs">{team2?.short_name || 'T2'}</span>
                )}
              </div>
            </div>
            {team2Score && (
              <p className="mt-2 text-sm sm:text-base font-bold text-emerald-800 font-mono">
                {team2Score}
              </p>
            )}
          </div>
        </div>

        {/* Venue Info */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <span className="truncate">{match.venue}</span>
          </div>

          {match.result_description && (
            <div className="flex items-center gap-1 text-emerald-800 font-medium">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>{match.result_description}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="px-4 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          onClick={() => navigate(`/matches/${match.id}`)}
          className="text-xs font-semibold text-slate-700 hover:text-emerald-800 flex items-center gap-1 transition-colors"
        >
          <span>{isCompleted ? 'Full Scorecard' : 'Match Details'}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center gap-2">
          {canScore && (
            <button
              onClick={() => navigate(`/scorer/matches/${match.id}`)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-2xs"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>{isLive ? 'Continue Scoring' : isCompleted ? 'View Score' : 'Start Scoring'}</span>
            </button>
          )}

          {canManage && onEdit && (
            <button
              onClick={() => onEdit(match)}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200/80 rounded-lg transition-colors border border-slate-200"
            >
              Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
