import React from 'react';
import { Player, Team } from '../../types';
import { db } from '../../services/db';
import { User, Award, Shield, Edit3, Trash2 } from 'lucide-react';

interface PlayerCardProps {
  player: Player;
  onEdit?: (player: Player) => void;
  onDelete?: (playerId: string) => void;
  canManage?: boolean;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  onEdit,
  onDelete,
  canManage = false,
}) => {
  const team: Team | undefined = db.getTeamById(player.team_id);
  const careerStats = db.getPlayerCareerStats(player.id);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Batsman':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Bowler':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'All-Rounder':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'Wicketkeeper':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between">
      <div className="p-5">
        <div className="flex items-start gap-3.5">
          {/* Avatar & Jersey Number */}
          <div className="relative shrink-0">
            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
              <img
                src={player.photo}
                alt={player.name}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-slate-900 text-amber-400 font-bold font-mono text-[10px] rounded-md shadow-xs border border-slate-800">
              #{player.jersey_number}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <h4 className="font-bold text-slate-900 text-sm sm:text-base truncate font-heading">
                {player.name}
              </h4>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap ${getRoleBadgeColor(
                  player.role
                )}`}
              >
                {player.role}
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-0.5 truncate">
              {team?.name || 'Unassigned'} ({player.age} yrs)
            </p>
          </div>
        </div>

        {/* Styles info */}
        <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Batting</span>
            <span className="font-medium text-slate-700 truncate block">
              {player.batting_style}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Bowling</span>
            <span className="font-medium text-slate-700 truncate block">
              {player.bowling_style}
            </span>
          </div>
        </div>

        {/* Match Statistics */}
        <div className="mt-3 grid grid-cols-4 gap-1.5 p-2.5 rounded-xl bg-slate-50 text-center text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Mat</span>
            <span className="font-bold text-slate-800">{careerStats.matchesCount}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Runs</span>
            <span className="font-bold text-slate-800">{careerStats.totalRuns}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Wkts</span>
            <span className="font-bold text-slate-800">{careerStats.totalWickets}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Avg/Econ</span>
            <span className="font-bold text-slate-800 text-[11px]">
              {player.role === 'Bowler' ? careerStats.bowlingEconomy : careerStats.battingAvg}
            </span>
          </div>
        </div>
      </div>

      {canManage && (
        <div className="px-4 py-2.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-2">
          {onEdit && (
            <button
              onClick={() => onEdit(player)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200 rounded-md transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(player.id)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
