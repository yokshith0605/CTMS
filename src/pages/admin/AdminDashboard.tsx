import React, { useState } from 'react';
import { db } from '../../services/db';
import { useRouter } from '../../services/router';
import { DashboardCard } from '../../components/common/DashboardCard';
import { MatchCard } from '../../components/cricket/MatchCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Trophy,
  Shield,
  Users,
  Calendar,
  CheckCircle2,
  Activity,
  Plus,
  ArrowRight,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { TournamentFormModal } from '../../components/forms/TournamentFormModal';
import { TeamFormModal } from '../../components/forms/TeamFormModal';
import { PlayerFormModal } from '../../components/forms/PlayerFormModal';
import { MatchScheduleModal } from '../../components/forms/MatchScheduleModal';

export const AdminDashboard: React.FC = () => {
  const { navigate } = useRouter();

  // Modals state
  const [isTournModalOpen, setIsTournModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);

  // Data
  const tournaments = db.getTournaments();
  const teams = db.getTeams();
  const players = db.getPlayers();
  const matches = db.getMatches();

  const activeTournaments = tournaments.filter((t) => t.status === 'Ongoing');
  const upcomingMatches = matches.filter((m) => m.status === 'Scheduled');
  const liveMatches = matches.filter((m) => m.status === 'Live');
  const completedMatches = matches.filter((m) => m.status === 'Completed');

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
            System Administration
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-heading">
            Admin Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time tournament overview, operations control, and resource management.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsTournModalOpen(true)}
            className="px-3 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Tournament</span>
          </button>
          <button
            onClick={() => setIsTeamModalOpen(true)}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Team</span>
          </button>
          <button
            onClick={() => setIsPlayerModalOpen(true)}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Player</span>
          </button>
          <button
            onClick={() => setIsMatchModalOpen(true)}
            className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Schedule Match</span>
          </button>
        </div>
      </div>

      {/* 6 Required Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <DashboardCard
          title="Tournaments"
          value={tournaments.length}
          subtitle={`${activeTournaments.length} active`}
          icon={Trophy}
          variant="emerald"
          onClick={() => navigate('/admin/tournaments')}
        />
        <DashboardCard
          title="Registered Teams"
          value={teams.length}
          subtitle="Across all leagues"
          icon={Shield}
          variant="blue"
          onClick={() => navigate('/admin/teams')}
        />
        <DashboardCard
          title="Total Players"
          value={players.length}
          subtitle="Squad athletes"
          icon={Users}
          variant="slate"
          onClick={() => navigate('/admin/players')}
        />
        <DashboardCard
          title="Upcoming Matches"
          value={upcomingMatches.length}
          subtitle="Scheduled fixtures"
          icon={Calendar}
          variant="amber"
          onClick={() => navigate('/admin/matches')}
        />
        <DashboardCard
          title="Completed"
          value={completedMatches.length}
          subtitle="With scorecards"
          icon={CheckCircle2}
          variant="emerald"
          onClick={() => navigate('/admin/scorecards')}
        />
        <DashboardCard
          title="Live Matches"
          value={liveMatches.length}
          subtitle="In-play scoring"
          icon={Activity}
          variant={liveMatches.length > 0 ? 'amber' : 'slate'}
          onClick={() => navigate('/admin/matches')}
        />
      </div>

      {/* Live & Upcoming Matches Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 font-heading flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-800" />
              <span>Upcoming & Live Fixtures</span>
            </h3>
            <button
              onClick={() => navigate('/admin/matches')}
              className="text-xs font-semibold text-emerald-800 hover:underline flex items-center gap-1"
            >
              <span>View All ({matches.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...liveMatches, ...upcomingMatches].slice(0, 4).map((m) => (
              <MatchCard key={m.id} match={m} canScore={true} />
            ))}
          </div>

          {/* Recent Match Results */}
          <div className="pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-900 font-heading flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Recent Match Results</span>
              </h3>
              <button
                onClick={() => navigate('/admin/scorecards')}
                className="text-xs font-semibold text-emerald-800 hover:underline flex items-center gap-1"
              >
                <span>Scorecards</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedMatches.slice(0, 2).map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Recent Team Registrations & Active Tournaments */}
        <div className="space-y-6">
          {/* Active Tournaments mini list */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 font-heading">
                Active Tournaments
              </h3>
              <button
                onClick={() => navigate('/admin/tournaments')}
                className="text-xs text-emerald-800 font-semibold hover:underline"
              >
                Manage
              </button>
            </div>

            <div className="space-y-3">
              {tournaments.map((t) => (
                <div
                  key={t.id}
                  onClick={() => navigate(`/tournaments/${t.id}`)}
                  className="p-3 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 truncate">
                      {t.name}
                    </span>
                    <StatusBadge status={t.status} size="sm" />
                  </div>
                  <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500">
                    <span>Format: {t.format}</span>
                    <span>{db.getTeams(t.id).length} teams</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Teams */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 font-heading">
                Registered Teams
              </h3>
              <button
                onClick={() => navigate('/admin/teams')}
                className="text-xs text-emerald-800 font-semibold hover:underline"
              >
                View All
              </button>
            </div>

            <div className="space-y-3">
              {teams.slice(0, 4).map((tm) => {
                const teamPlayers = db.getPlayers(tm.id);
                return (
                  <div
                    key={tm.id}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={tm.logo}
                        alt={tm.name}
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{tm.name}</h4>
                        <p className="text-[10px] text-slate-400">Capt: {tm.captain || 'TBD'}</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-600">
                      {teamPlayers.length} athletes
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Forms Modals */}
      <TournamentFormModal
        isOpen={isTournModalOpen}
        onClose={() => setIsTournModalOpen(false)}
      />
      <TeamFormModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
      />
      <PlayerFormModal
        isOpen={isPlayerModalOpen}
        onClose={() => setIsPlayerModalOpen(false)}
      />
      <MatchScheduleModal
        isOpen={isMatchModalOpen}
        onClose={() => setIsMatchModalOpen(false)}
      />
    </div>
  );
};
