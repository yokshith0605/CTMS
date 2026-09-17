import React from 'react';
import { Team } from '../../types';
import { db } from '../../services/db';
import { Users, Trophy, Shield, ArrowRight } from 'lucide-react';
import { useRouter } from '../../services/router';

interface TeamCardProps {
  team: Team;
  onEdit?: (team: Team) => void;
  onDelete?: (teamId: string) => void;
  canManage?: boolean;
}

export const TeamCard: React.FC<TeamCardProps> = ({
  team,
  onEdit,
  onDelete,
  canManage = false,
}) => {
  const { navigate } = useRouter();
  const players = db.getPlayers(team.id);
  const tournament = db.getTournamentById(team.tournament_id);
  const teamStats = db.getManagerStats(team.id);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center p-1">
              <img
                src={team.logo}
                alt={team.name}
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base font-heading">{team.name}</h4>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md text-xs font-bold font-mono">
                  {team.short_name}
                </span>
                {tournament && (
                  <span className="text-xs text-slate-500 truncate max-w-[140px]">
                    {tournament.name}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-2.5 mt-5 p-3 rounded-xl bg-slate-50 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Captain</span>
            <span className="font-semibold text-slate-800">{team.captain || 'Not assigned'}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Coach</span>
            <span className="font-semibold text-slate-800">{team.coach || 'Not assigned'}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Squad Size</span>
            <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
              <Users className="w-3.5 h-3.5 text-slate-500" />
              {players.length} Players
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Points / Wins</span>
            <span className="font-semibold text-emerald-800 flex items-center gap-1 mt-0.5">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              {teamStats.points} Pts ({teamStats.wins}W - {teamStats.losses}L)
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          onClick={() => navigate(`/teams/${team.id}`)}
          className="text-xs font-semibold text-slate-700 hover:text-emerald-800 flex items-center gap-1 transition-colors"
        >
          <span>View Squad</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        {canManage && (
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={() => onEdit(team)}
                className="px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200 rounded-md transition-colors"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(team.id)}
                className="px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                Remove
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
