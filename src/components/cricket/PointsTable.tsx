import React, { useState } from 'react';
import { db } from '../../services/db';
import { PointsTableEntry, Team } from '../../types';
import { Trophy, RefreshCw, Info } from 'lucide-react';
import { useRouter } from '../../services/router';

interface PointsTableProps {
  tournamentId: string;
  allowRecalculate?: boolean;
  highlightTeamId?: string;
}

export const PointsTable: React.FC<PointsTableProps> = ({
  tournamentId,
  allowRecalculate = false,
  highlightTeamId,
}) => {
  const { navigate } = useRouter();
  const [isRecalculating, setIsRecalculating] = useState(false);
  const tournament = db.getTournamentById(tournamentId);
  const entries: PointsTableEntry[] = db.getPointsTable(tournamentId);

  const handleRecalculate = () => {
    setIsRecalculating(true);
    setTimeout(() => {
      db.recalculatePointsTable(tournamentId);
      setIsRecalculating(false);
    }, 400);
  };

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
        <p className="text-slate-500 text-sm">No teams or standings recorded for this tournament yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/60">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 font-heading flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span>Tournament Standings</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {tournament?.name || 'Tournament'} • Top teams qualify for playoffs
          </p>
        </div>

        {allowRecalculate && (
          <button
            onClick={handleRecalculate}
            disabled={isRecalculating}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isRecalculating ? 'animate-spin' : ''}`} />
            <span>Recalculate Table</span>
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
              <th className="py-3.5 pl-4 sm:pl-6 pr-2 w-12 text-center">Pos</th>
              <th className="py-3.5 px-3 min-w-[180px]">Team</th>
              <th className="py-3.5 px-2 text-center">P</th>
              <th className="py-3.5 px-2 text-center">W</th>
              <th className="py-3.5 px-2 text-center">L</th>
              <th className="py-3.5 px-2 text-center">T</th>
              <th className="py-3.5 px-2 text-center">NR</th>
              <th className="py-3.5 px-3 text-center font-bold text-slate-900 bg-emerald-50/50">Pts</th>
              <th className="py-3.5 pr-4 sm:pr-6 pl-2 text-right">NRR</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {entries.map((entry, index) => {
              const team: Team | undefined = db.getTeamById(entry.team_id);
              const isFirst = index === 0;
              const isPlayoffZone = index < 2;

              const isHighlighted = highlightTeamId && entry.team_id === highlightTeamId;

              return (
                <tr
                  key={entry.id || entry.team_id}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    isHighlighted ? 'bg-emerald-50/80 font-bold ring-1 ring-emerald-400' : isFirst ? 'bg-amber-50/30' : ''
                  }`}
                >
                  {/* Position */}
                  <td className="py-3.5 pl-4 sm:pl-6 pr-2 text-center">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                        isFirst
                          ? 'bg-amber-100 text-amber-900 ring-2 ring-amber-400'
                          : isPlayoffZone
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {index + 1}
                    </span>
                  </td>

                  {/* Team */}
                  <td className="py-3.5 px-3">
                    <div
                      onClick={() => team && navigate(`/teams/${team.id}`)}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                        {team?.logo ? (
                          <img src={team.logo} alt={team.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-bold text-[10px] text-slate-600">
                            {team?.short_name || 'T'}
                          </span>
                        )}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 group-hover:text-emerald-800 transition-colors block">
                          {team?.name || 'Unknown Team'}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold">
                          {team?.short_name}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Played */}
                  <td className="py-3.5 px-2 text-center font-mono">{entry.matches_played}</td>

                  {/* Won */}
                  <td className="py-3.5 px-2 text-center font-mono text-emerald-800 font-semibold">
                    {entry.wins}
                  </td>

                  {/* Lost */}
                  <td className="py-3.5 px-2 text-center font-mono text-slate-500">
                    {entry.losses}
                  </td>

                  {/* Tied */}
                  <td className="py-3.5 px-2 text-center font-mono text-slate-400">{entry.ties}</td>

                  {/* No Result */}
                  <td className="py-3.5 px-2 text-center font-mono text-slate-400">
                    {entry.no_results}
                  </td>

                  {/* Points */}
                  <td className="py-3.5 px-3 text-center font-mono font-bold text-base text-emerald-900 bg-emerald-50/50">
                    {entry.points}
                  </td>

                  {/* Net Run Rate */}
                  <td className="py-3.5 pr-4 sm:pr-6 pl-2 text-right font-mono font-semibold">
                    <span
                      className={
                        entry.net_run_rate > 0
                          ? 'text-emerald-700'
                          : entry.net_run_rate < 0
                          ? 'text-rose-600'
                          : 'text-slate-500'
                      }
                    >
                      {entry.net_run_rate > 0 ? `+${entry.net_run_rate.toFixed(3)}` : entry.net_run_rate.toFixed(3)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Rules Footnote */}
      <div className="px-4 py-3 bg-slate-50/90 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>Rules: Win = 2 Pts | Tie/NR = 1 Pt | Loss = 0 Pts</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Top 2 Qualify for Playoffs
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Table Leader
          </span>
        </div>
      </div>
    </div>
  );
};
