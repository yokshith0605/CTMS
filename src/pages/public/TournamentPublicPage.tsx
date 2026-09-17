import React, { useState } from 'react';
import { db } from '../../services/db';
import { Tournament, TournamentFormat, TournamentStatus } from '../../types';
import { useRouter } from '../../services/router';
import { StatusBadge } from '../../components/common/StatusBadge';
import { MatchCard } from '../../components/cricket/MatchCard';
import { TeamCard } from '../../components/cricket/TeamCard';
import { PlayerCard } from '../../components/cricket/PlayerCard';
import { PointsTable } from '../../components/cricket/PointsTable';
import {
  Trophy,
  Calendar,
  MapPin,
  Search,
  Filter,
  Users,
  Shield,
  Clock,
  ArrowRight,
  ChevronRight
} from 'lucide-react';

interface TournamentPublicPageProps {
  tournamentId?: string;
}

export const TournamentPublicPage: React.FC<TournamentPublicPageProps> = ({
  tournamentId,
}) => {
  const { navigate } = useRouter();
  const tournaments = db.getTournaments();

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [formatFilter, setFormatFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Active tab if viewing a specific tournament
  const [activeTab, setActiveTab] = useState<'overview' | 'teams' | 'fixtures' | 'results' | 'points' | 'players'>('overview');

  // Selected tournament
  const selectedTournament: Tournament | undefined = tournamentId
    ? db.getTournamentById(tournamentId)
    : undefined;

  // If a specific tournament is selected, render the dedicated tournament view with the 6 tabs
  if (selectedTournament) {
    const teams = db.getTeams(selectedTournament.id);
    const matches = db.getMatches(selectedTournament.id);
    const fixtures = matches.filter((m) => m.status === 'Scheduled' || m.status === 'Live');
    const results = matches.filter((m) => m.status === 'Completed');
    const teamIds = new Set(teams.map((t) => t.id));
    const players = db.getPlayers().filter((p) => teamIds.has(p.team_id));

    return (
      <div className="space-y-6">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <button onClick={() => navigate('/tournaments')} className="hover:text-emerald-800">
            Tournaments
          </button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-slate-800 truncate">{selectedTournament.name}</span>
        </div>

        {/* Tournament Hero Banner */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {selectedTournament.format}
                </span>
                <StatusBadge status={selectedTournament.status} />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 mt-2">
                {selectedTournament.name}
              </h1>
              <p className="mt-1 text-sm text-slate-600 max-w-2xl leading-relaxed">
                {selectedTournament.description}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5 pt-4 border-t border-slate-100 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>
                {selectedTournament.start_date} to {selectedTournament.end_date}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>{selectedTournament.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-slate-400" />
              <span>{teams.length} Registered Teams</span>
            </div>
          </div>
        </div>

        {/* 6 Tabs as specified: Overview, Teams, Fixtures, Results, Points Table, Players */}
        <div className="border-b border-slate-200 flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'teams', label: `Teams (${teams.length})` },
            { id: 'fixtures', label: `Fixtures (${fixtures.length})` },
            { id: 'results', label: `Results (${results.length})` },
            { id: 'points', label: 'Points Table' },
            { id: 'players', label: `Players (${players.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-4 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-emerald-800 text-emerald-900'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-heading mb-3">
                    Upcoming & Live Matches
                  </h3>
                  {fixtures.length === 0 ? (
                    <div className="p-6 text-center bg-white rounded-xl border border-slate-200 text-xs text-slate-500">
                      No upcoming matches scheduled currently.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {fixtures.slice(0, 4).map((m) => (
                        <MatchCard key={m.id} match={m} />
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 font-heading mb-3">
                    Recent Match Results
                  </h3>
                  {results.length === 0 ? (
                    <div className="p-6 text-center bg-white rounded-xl border border-slate-200 text-xs text-slate-500">
                      No completed matches recorded yet.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {results.slice(0, 2).map((m) => (
                        <MatchCard key={m.id} match={m} />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <PointsTable tournamentId={selectedTournament.id} />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Teams */}
        {activeTab === 'teams' && (
          <div>
            {teams.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-xs text-slate-500">
                No teams registered for this tournament yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {teams.map((t) => (
                  <TeamCard key={t.id} team={t} canManage={false} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Fixtures */}
        {activeTab === 'fixtures' && (
          <div className="space-y-4">
            {fixtures.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-xs text-slate-500">
                No upcoming fixtures scheduled.
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

        {/* Tab 4: Results */}
        {activeTab === 'results' && (
          <div className="space-y-4">
            {results.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-xs text-slate-500">
                No match results recorded yet.
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

        {/* Tab 5: Points Table */}
        {activeTab === 'points' && (
          <div className="max-w-4xl mx-auto">
            <PointsTable tournamentId={selectedTournament.id} />
          </div>
        )}

        {/* Tab 6: Players */}
        {activeTab === 'players' && (
          <div>
            {players.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-xs text-slate-500">
                No players registered yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {players.map((p) => (
                  <PlayerCard key={p.id} player={p} canManage={false} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Otherwise: List of all tournaments with search and filters
  const filteredTournaments = tournaments.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFormat = formatFilter === 'all' || t.format === formatFilter;
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesFormat && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-heading">
            Cricket Tournaments
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse live competitions, schedules, participating squads, and standings.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tournament name, venue..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={formatFilter}
            onChange={(e) => setFormatFilter(e.target.value)}
            className="text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700"
          >
            <option value="all">All Formats</option>
            <option value="T20">T20</option>
            <option value="ODI">ODI</option>
            <option value="Test">Test</option>
            <option value="Custom">Custom</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700"
          >
            <option value="all">All Statuses</option>
            <option value="Ongoing">Ongoing</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Tournaments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTournaments.map((t) => {
          const tTeams = db.getTeams(t.id);
          const tMatches = db.getMatches(t.id);

          return (
            <div
              key={t.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-bold font-mono bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {t.format}
                  </span>
                  <StatusBadge status={t.status} size="sm" />
                </div>

                <h3 className="text-lg font-bold text-slate-900 font-heading hover:text-emerald-800 transition-colors">
                  {t.name}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
                  {t.description}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {t.start_date} to {t.end_date}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{t.location}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 text-xs text-slate-500 font-semibold">
                  <span>{tTeams.length} Teams</span>
                  <span>•</span>
                  <span>{tMatches.length} Matches</span>
                </div>

                <button
                  onClick={() => navigate(`/tournaments/${t.id}`)}
                  className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <span>Explore</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
