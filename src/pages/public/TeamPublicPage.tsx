import React, { useState } from 'react';
import { db } from '../../services/db';
import { Match } from '../../types';
import { useRouter } from '../../services/router';
import { TeamCard } from '../../components/cricket/TeamCard';
import { PlayerCard } from '../../components/cricket/PlayerCard';
import { MatchCard } from '../../components/cricket/MatchCard';
import { Search, ChevronRight, ArrowLeft, Shield } from 'lucide-react';

interface TeamPublicPageProps {
  teamId?: string;
}

export const TeamPublicPage: React.FC<TeamPublicPageProps> = ({ teamId }) => {
  const { navigate } = useRouter();
  const [search, setSearch] = useState('');

  if (teamId) {
    const team = db.getTeamById(teamId);
    if (!team) {
      return (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
          <p className="text-slate-600 font-bold">Team not found</p>
          <button
            onClick={() => navigate('/teams')}
            className="mt-3 text-xs text-emerald-800 font-bold hover:underline"
          >
            ← Back to Teams
          </button>
        </div>
      );
    }

    const tournament = db.getTournamentById(team.tournament_id);
    const players = db.getPlayers(team.id);
    const teamMatches: Match[] = db.getMatchesForTeam(team.id);

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <button onClick={() => navigate('/teams')} className="hover:text-emerald-800">
            Teams
          </button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-slate-800">{team.name}</span>
        </div>

        {/* Team Banner */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center gap-5">
          <img
            src={team.logo}
            alt={team.name}
            referrerPolicy="no-referrer"
            className="w-20 h-20 rounded-2xl object-cover border border-slate-200 shadow-xs"
          />
          <div>
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
              #{team.short_name}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 mt-1">
              {team.name}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Tournament: <strong className="text-slate-800">{tournament?.name}</strong> • Captain:{' '}
              <strong className="text-slate-800">{team.captain || 'TBD'}</strong> • Coach:{' '}
              <strong className="text-slate-800">{team.coach || 'TBD'}</strong>
            </p>
          </div>
        </div>

        {/* Squad Athletes */}
        <div className="space-y-3">
          <h3 className="text-base font-bold text-slate-900 font-heading">
            Squad Roster ({players.length} Athletes)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {players.map((p) => (
              <PlayerCard key={p.id} player={p} canManage={false} />
            ))}
          </div>
        </div>

        {/* Matches */}
        <div className="space-y-3 pt-4">
          <h3 className="text-base font-bold text-slate-900 font-heading">
            Team Matches & Fixtures ({teamMatches.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teamMatches.map((m) => (
              <MatchCard key={m.id} match={m} canScore={false} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Browse all teams
  const allTeams = db.getTeams();
  const filtered = allTeams.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.short_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-heading">
          Participating Teams
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Explore all registered cricket clubs, rosters, and franchise profiles.
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search team..."
          className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((t) => (
          <TeamCard key={t.id} team={t} canManage={false} />
        ))}
      </div>
    </div>
  );
};
