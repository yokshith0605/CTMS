import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { useRouter } from '../../services/router';
import { Match } from '../../types';
import { DashboardCard } from '../../components/common/DashboardCard';
import { PlayerCard } from '../../components/cricket/PlayerCard';
import { MatchCard } from '../../components/cricket/MatchCard';
import { PointsTable } from '../../components/cricket/PointsTable';
import { TeamFormModal } from '../../components/forms/TeamFormModal';
import { PlayerFormModal } from '../../components/forms/PlayerFormModal';
import {
  Shield,
  Users,
  Calendar,
  Trophy,
  CheckCircle2,
  Plus,
  Edit2,
  AlertCircle
} from 'lucide-react';

interface ManagerDashboardProps {
  viewTab?: 'dashboard' | 'team' | 'players' | 'fixtures' | 'results' | 'points-table';
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ viewTab = 'dashboard' }) => {
  const { user } = useAuth();
  const { navigate } = useRouter();

  // Find assigned team (or default to first team if user has team_id or pick team_1)
  const teamId = user?.team_id || db.getTeams()[0]?.id;
  const team = teamId ? db.getTeamById(teamId) : undefined;
  const tournament = team ? db.getTournamentById(team.tournament_id) : undefined;

  // Modals
  const [isEditTeamModalOpen, setIsEditTeamModalOpen] = useState(false);
  const [isAddPlayerModalOpen, setIsAddPlayerModalOpen] = useState(false);

  if (!team) {
    return (
      <div className="p-10 text-center bg-white rounded-2xl border border-slate-200">
        <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
        <h3 className="font-bold text-slate-800">No Team Assigned</h3>
        <p className="text-xs text-slate-500 mt-1">
          Your account is not currently linked to a team franchise. Contact the administrator.
        </p>
      </div>
    );
  }

  const players = db.getPlayers(team.id);
  const teamMatches: Match[] = db.getMatchesForTeam(team.id);
  const fixtures: Match[] = teamMatches.filter((m: Match) => m.status === 'Scheduled' || m.status === 'Live');
  const results: Match[] = teamMatches.filter((m: Match) => m.status === 'Completed');

  // Stats calculation
  const wins = results.filter((m: Match) => m.winner_team_id === team.id).length;
  const losses = results.filter((m: Match) => m.winner_team_id && m.winner_team_id !== team.id).length;

  return (
    <div className="space-y-6">
      {/* Team Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={team.logo}
              alt={team.name}
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-2xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Team Manager Portal
                </span>
                <span className="text-xs font-mono font-bold text-slate-400">#{team.short_name}</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 font-heading mt-1">
                {team.name}
              </h1>
              <p className="text-xs text-slate-500">
                Tournament: <strong className="text-slate-800">{tournament?.name}</strong> • Captain:{' '}
                <strong className="text-slate-800">{team.captain || 'TBD'}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditTeamModalOpen(true)}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Details</span>
            </button>
            <button
              onClick={() => setIsAddPlayerModalOpen(true)}
              className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Player</span>
            </button>
          </div>
        </div>

        {/* 4 Key Team Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 font-medium">Squad Athletes</span>
            <p className="text-xl font-bold font-mono text-slate-900 mt-0.5">{players.length}</p>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Matches Played</span>
            <p className="text-xl font-bold font-mono text-slate-900 mt-0.5">{results.length}</p>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Wins / Losses</span>
            <p className="text-xl font-bold font-mono text-slate-900 mt-0.5">
              <span className="text-emerald-700">{wins}W</span> - <span className="text-rose-700">{losses}L</span>
            </p>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Head Coach</span>
            <p className="text-sm font-bold text-slate-900 mt-1">{team.coach || 'Unassigned'}</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation if selected */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        {[
          { id: 'dashboard', label: 'Overview' },
          { id: 'players', label: `Squad Roster (${players.length})` },
          { id: 'fixtures', label: `Fixtures (${fixtures.length})` },
          { id: 'results', label: `Results (${results.length})` },
          { id: 'points-table', label: 'Points Table' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => navigate(tab.id === 'dashboard' ? '/manager/dashboard' : `/manager/${tab.id}`)}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-colors ${
              viewTab === tab.id
                ? 'bg-emerald-800 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main View Display */}
      {(viewTab === 'dashboard' || viewTab === 'players') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 font-heading">
              Registered Squad Athletes
            </h3>
            <button
              onClick={() => setIsAddPlayerModalOpen(true)}
              className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Player</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {players.map((p) => (
              <PlayerCard key={p.id} player={p} canManage={true} />
            ))}
          </div>
        </div>
      )}

      {(viewTab === 'dashboard' || viewTab === 'fixtures') && (
        <div className="space-y-4 pt-4">
          <h3 className="text-base font-bold text-slate-900 font-heading">
            Team Upcoming Fixtures
          </h3>
          {fixtures.length === 0 ? (
            <div className="p-6 text-center bg-white rounded-xl border border-slate-200 text-xs text-slate-500">
              No pending fixtures scheduled for this team.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fixtures.map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
            </div>
          )}
        </div>
      )}

      {(viewTab === 'dashboard' || viewTab === 'results') && (
        <div className="space-y-4 pt-4">
          <h3 className="text-base font-bold text-slate-900 font-heading">
            Recent Match Results
          </h3>
          {results.length === 0 ? (
            <div className="p-6 text-center bg-white rounded-xl border border-slate-200 text-xs text-slate-500">
              No completed matches yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
            </div>
          )}
        </div>
      )}

      {viewTab === 'points-table' && tournament && (
        <div className="max-w-4xl mx-auto">
          <PointsTable tournamentId={tournament.id} highlightTeamId={team.id} />
        </div>
      )}

      <TeamFormModal
        isOpen={isEditTeamModalOpen}
        onClose={() => setIsEditTeamModalOpen(false)}
        team={team}
      />
      <PlayerFormModal
        isOpen={isAddPlayerModalOpen}
        onClose={() => setIsAddPlayerModalOpen(false)}
        defaultTeamId={team.id}
      />
    </div>
  );
};
