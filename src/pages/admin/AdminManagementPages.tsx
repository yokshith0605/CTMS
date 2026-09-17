import React, { useState } from 'react';
import { db } from '../../services/db';
import { Tournament, Team, Player, Match, User } from '../../types';
import { useRouter } from '../../services/router';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PointsTable } from '../../components/cricket/PointsTable';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { useToast } from '../../components/common/Toast';
import { TournamentFormModal } from '../../components/forms/TournamentFormModal';
import { TeamFormModal } from '../../components/forms/TeamFormModal';
import { PlayerFormModal } from '../../components/forms/PlayerFormModal';
import { MatchScheduleModal } from '../../components/forms/MatchScheduleModal';
import {
  Trophy,
  Shield,
  Users,
  Calendar,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  FileText,
  Printer,
  Download,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  UserCheck,
  Settings,
  Activity,
  Award
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';

// ==========================================
// 1. ADMIN TOURNAMENTS PAGE
// ==========================================
export const AdminTournamentsPage: React.FC = () => {
  const { navigate } = useRouter();
  const { showToast } = useToast();
  const tournaments = db.getTournaments();

  const [search, setSearch] = useState('');
  const [selectedTourn, setSelectedTourn] = useState<Tournament | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Tournament | null>(null);

  const filtered = tournaments.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.location.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = () => {
    if (!deleteTarget) return;
    try {
      db.deleteTournament(deleteTarget.id);
      showToast('Tournament deleted successfully.');
      setDeleteTarget(null);
    } catch (err: any) {
      showToast(err.message || 'Cannot delete tournament.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-heading">Tournaments Management</h1>
          <p className="text-xs text-slate-500">Create, configure, and maintain cricket tournaments.</p>
        </div>
        <button
          onClick={() => {
            setSelectedTourn(null);
            setIsModalOpen(true);
          }}
          className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Tournament</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tournaments..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
          <span className="text-xs text-slate-400 font-semibold">{filtered.length} Tournaments</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Name & Details</th>
                <th className="py-3 px-3">Format</th>
                <th className="py-3 px-3">Duration</th>
                <th className="py-3 px-3">Location</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Teams</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((t) => {
                const count = db.getTeams(t.id).length;
                return (
                  <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900 text-sm">{t.name}</p>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{t.description}</p>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {t.format}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px]">
                      {t.start_date} <br />
                      <span className="text-slate-400">to {t.end_date}</span>
                    </td>
                    <td className="py-3 px-3">{t.location}</td>
                    <td className="py-3 px-3">
                      <StatusBadge status={t.status} size="sm" />
                    </td>
                    <td className="py-3 px-3 font-bold font-mono text-slate-800">{count}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedTourn(t);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(t)}
                          className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <TournamentFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tournament={selectedTourn}
      />
      <ConfirmationDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Tournament"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? All associated matches and tables will be impacted.`}
        confirmText="Yes, Delete"
        type="danger"
      />
    </div>
  );
};

// ==========================================
// 2. ADMIN TEAMS PAGE
// ==========================================
export const AdminTeamsPage: React.FC = () => {
  const { showToast } = useToast();
  const teams = db.getTeams();
  const tournaments = db.getTournaments();

  const [search, setSearch] = useState('');
  const [tournFilter, setTournFilter] = useState('all');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Team | null>(null);

  const filtered = teams.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.short_name.toLowerCase().includes(search.toLowerCase());
    const matchesTourn = tournFilter === 'all' || t.tournament_id === tournFilter;
    return matchesSearch && matchesTourn;
  });

  const handleDelete = () => {
    if (!deleteTarget) return;
    try {
      db.deleteTeam(deleteTarget.id);
      showToast('Team removed successfully.');
      setDeleteTarget(null);
    } catch (err: any) {
      showToast(err.message || 'Cannot delete team.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-heading">Team Franchises</h1>
          <p className="text-xs text-slate-500">Manage participating teams, captains, and staff.</p>
        </div>
        <button
          onClick={() => {
            setSelectedTeam(null);
            setIsModalOpen(true);
          }}
          className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Register Team</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search team name, code..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <select
            value={tournFilter}
            onChange={(e) => setTournFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5"
          >
            <option value="all">All Tournaments</option>
            {tournaments.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Team</th>
                <th className="py-3 px-3">Tournament</th>
                <th className="py-3 px-3">Captain</th>
                <th className="py-3 px-3">Coach</th>
                <th className="py-3 px-3">Manager</th>
                <th className="py-3 px-3">Athletes</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((tm) => {
                const tourney = db.getTournamentById(tm.tournament_id);
                const pCount = db.getPlayers(tm.id).length;
                return (
                  <tr key={tm.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 flex items-center gap-3">
                      <img
                        src={tm.logo}
                        alt={tm.name}
                        referrerPolicy="no-referrer"
                        className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div>
                        <span className="font-bold text-slate-900 text-sm block">{tm.name}</span>
                        <span className="font-mono text-[10px] font-bold text-slate-400">
                          {tm.short_name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-700 font-medium truncate max-w-[160px]">
                      {tourney?.name || 'Unassigned'}
                    </td>
                    <td className="py-3 px-3">{tm.captain || '—'}</td>
                    <td className="py-3 px-3">{tm.coach || '—'}</td>
                    <td className="py-3 px-3 text-[11px] text-slate-500">{tm.manager || '—'}</td>
                    <td className="py-3 px-3 font-bold font-mono">{pCount}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedTeam(tm);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(tm)}
                          className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <TeamFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        team={selectedTeam}
      />
      <ConfirmationDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Team"
        message={`Are you sure you want to remove team "${deleteTarget?.name}"?`}
        confirmText="Yes, Delete"
        type="danger"
      />
    </div>
  );
};

// ==========================================
// 3. ADMIN PLAYERS PAGE
// ==========================================
export const AdminPlayersPage: React.FC = () => {
  const { showToast } = useToast();
  const players = db.getPlayers();
  const teams = db.getTeams();

  const [search, setSearch] = useState('');
  const [teamFilter, setTeamFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Player | null>(null);

  const filtered = players.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesTeam = teamFilter === 'all' || p.team_id === teamFilter;
    const matchesRole = roleFilter === 'all' || p.role === roleFilter;
    return matchesSearch && matchesTeam && matchesRole;
  });

  const handleDelete = () => {
    if (!deleteTarget) return;
    try {
      db.deletePlayer(deleteTarget.id);
      showToast('Player profile removed.');
      setDeleteTarget(null);
    } catch (err: any) {
      showToast(err.message || 'Cannot delete player.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-heading">Players Directory</h1>
          <p className="text-xs text-slate-500">Manage player rosters, jersey numbers, and roles.</p>
        </div>
        <button
          onClick={() => {
            setSelectedPlayer(null);
            setIsModalOpen(true);
          }}
          className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Athlete</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search player name..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5"
            >
              <option value="all">All Teams</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5"
            >
              <option value="all">All Roles</option>
              <option value="Batsman">Batsman</option>
              <option value="Bowler">Bowler</option>
              <option value="All-Rounder">All-Rounder</option>
              <option value="Wicketkeeper">Wicketkeeper</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-3">Player</th>
                <th className="py-3 px-3">Team</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3">Batting Style</th>
                <th className="py-3 px-3">Bowling Style</th>
                <th className="py-3 px-3">Age</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => {
                const tm = db.getTeamById(p.team_id);
                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-800">
                      #{p.jersey_number}
                    </td>
                    <td className="py-3 px-3 flex items-center gap-2.5">
                      <img
                        src={p.photo}
                        alt={p.name}
                        referrerPolicy="no-referrer"
                        className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                      <span className="font-bold text-slate-900">{p.name}</span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-700">{tm?.name || '—'}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {p.role}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[11px]">{p.batting_style}</td>
                    <td className="py-3 px-3 text-[11px]">{p.bowling_style}</td>
                    <td className="py-3 px-3 font-mono">{p.age}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedPlayer(p);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(p)}
                          className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <PlayerFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        player={selectedPlayer}
      />
      <ConfirmationDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Player"
        message={`Are you sure you want to remove player "${deleteTarget?.name}"?`}
        confirmText="Yes, Delete"
        type="danger"
      />
    </div>
  );
};

// ==========================================
// 4. ADMIN MATCHES PAGE
// ==========================================
export const AdminMatchesPage: React.FC = () => {
  const { showToast } = useToast();
  const { navigate } = useRouter();
  const matches = db.getMatches();
  const tournaments = db.getTournaments();

  const [tournFilter, setTournFilter] = useState('all');
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Match | null>(null);

  const filtered = matches.filter(
    (m) => tournFilter === 'all' || m.tournament_id === tournFilter
  );

  const handleDelete = () => {
    if (!deleteTarget) return;
    try {
      db.deleteMatch(deleteTarget.id);
      showToast('Match fixture removed.');
      setDeleteTarget(null);
    } catch (err: any) {
      showToast(err.message || 'Cannot delete match.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-heading">Match Schedules</h1>
          <p className="text-xs text-slate-500">Plan tournament fixtures, venues, and status transitions.</p>
        </div>
        <button
          onClick={() => {
            setSelectedMatch(null);
            setIsModalOpen(true);
          }}
          className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Match</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3">
          <select
            value={tournFilter}
            onChange={(e) => setTournFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5"
          >
            <option value="all">All Tournaments</option>
            {tournaments.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <span className="text-xs text-slate-400 font-semibold">{filtered.length} Matches</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Fixture</th>
                <th className="py-3 px-3">Date & Time</th>
                <th className="py-3 px-3">Venue</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Result / Score</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((m) => {
                const t1 = db.getTeamById(m.team1_id);
                const t2 = db.getTeamById(m.team2_id);
                return (
                  <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {t1?.name} <span className="text-slate-400 font-normal">vs</span> {t2?.name}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px]">
                      {m.match_date} @ {m.match_time}
                    </td>
                    <td className="py-3 px-3 text-slate-600 truncate max-w-[150px]">{m.venue}</td>
                    <td className="py-3 px-3 font-semibold">{m.match_type}</td>
                    <td className="py-3 px-3">
                      <StatusBadge status={m.status} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-[11px] text-slate-500">
                      {m.result_description || 'Pending play'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => navigate(`/scorer/matches/${m.id}`)}
                          className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-md font-bold text-[10px] transition-colors"
                        >
                          Score
                        </button>
                        <button
                          onClick={() => {
                            setSelectedMatch(m);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(m)}
                          className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <MatchScheduleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        match={selectedMatch}
      />
      <ConfirmationDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Match"
        message="Are you sure you want to delete this match fixture?"
        confirmText="Yes, Delete"
        type="danger"
      />
    </div>
  );
};

// ==========================================
// 5. ADMIN SCORECARDS PAGE
// ==========================================
export const AdminScorecardsPage: React.FC = () => {
  const { navigate } = useRouter();
  const matches = db.getMatches();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-heading">Match Scorecards</h1>
        <p className="text-xs text-slate-500">Inspect full official score records, innings stats, and player breakdowns.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {matches.map((m) => {
          const t1 = db.getTeamById(m.team1_id);
          const t2 = db.getTeamById(m.team2_id);
          const scs = db.getScorecardsForMatch(m.id);
          return (
            <div key={m.id} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500">{m.match_type} Match</span>
                <StatusBadge status={m.status} size="sm" />
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-1">
                {t1?.name} vs {t2?.name}
              </h3>
              <p className="text-xs text-slate-500 mb-4">{m.venue} • {m.match_date}</p>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-500">
                  {scs.length} Innings recorded
                </span>
                <button
                  onClick={() => navigate(`/scorecards/${m.id}`)}
                  className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1 shadow-2xs"
                >
                  <span>View Scorecard</span>
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

// ==========================================
// 6. ADMIN POINTS TABLE PAGE
// ==========================================
export const AdminPointsTablePage: React.FC = () => {
  const { showToast } = useToast();
  const tournaments = db.getTournaments();
  const [selectedTournId, setSelectedTournId] = useState(tournaments[0]?.id || '');

  const handleRecalculate = () => {
    db.recalculatePointsTable(selectedTournId);
    showToast('Points table standings and NRR recalculated from match records!', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-heading">Points Table Standings</h1>
          <p className="text-xs text-slate-500">
            Automated Net Run Rate (NRR) and point calculations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedTournId}
            onChange={(e) => setSelectedTournId(e.target.value)}
            className="text-xs font-bold bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
          >
            {tournaments.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleRecalculate}
            className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Recalculate Table</span>
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <PointsTable tournamentId={selectedTournId} />
      </div>
    </div>
  );
};

// ==========================================
// 7. ADMIN REPORTS PAGE
// ==========================================
export const AdminReportsPage: React.FC = () => {
  const tournaments = db.getTournaments();
  const teams = db.getTeams();
  const matches = db.getMatches();
  const players = db.getPlayers();
  const [reportType, setReportType] = useState<'tournament' | 'teams' | 'standings'>('tournament');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-heading">Tournament Reports</h1>
          <p className="text-xs text-slate-500">Comprehensive analytical and audit reports ready for export.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'tournament', label: 'Tournament Overview' },
          { id: 'teams', label: 'Team Performance' },
          { id: 'standings', label: 'Points Standings' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setReportType(tab.id as any)}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              reportType === tab.id
                ? 'bg-emerald-800 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
        {reportType === 'tournament' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 font-heading">
              Comprehensive Tournament Summary
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl">
                <span className="text-xs text-slate-400">Total Tournaments</span>
                <p className="text-2xl font-bold text-slate-900 font-mono mt-1">{tournaments.length}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <span className="text-xs text-slate-400">Total Teams Registered</span>
                <p className="text-2xl font-bold text-slate-900 font-mono mt-1">{teams.length}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <span className="text-xs text-slate-400">Total Matches Hosted</span>
                <p className="text-2xl font-bold text-slate-900 font-mono mt-1">{matches.length}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <span className="text-xs text-slate-400">Total Active Players</span>
                <p className="text-2xl font-bold text-slate-900 font-mono mt-1">{players.length}</p>
              </div>
            </div>
          </div>
        )}

        {reportType === 'teams' && (
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-heading mb-4">
              Team Performance & Roster Strength
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 font-bold uppercase text-slate-400 text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Team</th>
                    <th className="py-2.5 px-3">Captain</th>
                    <th className="py-2.5 px-3">Coach</th>
                    <th className="py-2.5 px-3">Squad Size</th>
                    <th className="py-2.5 px-3">Tournament</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {teams.map((tm) => {
                    const tourney = db.getTournamentById(tm.tournament_id);
                    const pCount = db.getPlayers(tm.id).length;
                    return (
                      <tr key={tm.id}>
                        <td className="py-3 px-3 font-bold text-slate-900">{tm.name}</td>
                        <td className="py-3 px-3">{tm.captain || 'N/A'}</td>
                        <td className="py-3 px-3">{tm.coach || 'N/A'}</td>
                        <td className="py-3 px-3 font-mono">{pCount}</td>
                        <td className="py-3 px-3">{tourney?.name}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {reportType === 'standings' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 font-heading">
              Current Points Standings
            </h3>
            {tournaments.map((t) => (
              <div key={t.id} className="space-y-2">
                <h4 className="font-bold text-sm text-slate-800">{t.name}</h4>
                <PointsTable tournamentId={t.id} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 8. ADMIN USERS PAGE
// ==========================================
export const AdminUsersPage: React.FC = () => {
  const { showToast } = useToast();
  const users = db.getUsers();

  const handleRoleChange = (userId: string, newRole: any) => {
    db.updateUserRole(userId, newRole);
    showToast(`User role updated to ${newRole}`, 'success');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-heading">User Accounts & Roles</h1>
        <p className="text-xs text-slate-500">Manage administrator, manager, scorer, and viewer accounts.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-3">Email</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3">Assigned Team</th>
                <th className="py-3 px-4 text-right">Change Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => {
                const team = u.team_id ? db.getTeamById(u.team_id) : undefined;
                return (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{u.name}</td>
                    <td className="py-3 px-3 font-mono text-[11px]">{u.email}</td>
                    <td className="py-3 px-3">
                      <span className="px-2.5 py-0.5 rounded-md font-bold text-[10px] bg-slate-100 text-slate-700 uppercase tracking-wider">
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500">{team?.name || '—'}</td>
                    <td className="py-3 px-4 text-right">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700"
                      >
                        <option value="admin">Admin</option>
                        <option value="team_manager">Team Manager</option>
                        <option value="scorer">Scorer</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 9. ADMIN SETTINGS PAGE
// ==========================================
export const AdminSettingsPage: React.FC = () => {
  const { showToast } = useToast();

  const handleResetData = () => {
    if (window.confirm('Reset all tournament data to factory initial state? Custom changes will be reset.')) {
      db.resetToInitialSeed();
      showToast('All data reset to initial demo seeds.', 'info');
    }
  };

  const handleExportJSON = () => {
    const data = {
      tournaments: db.getTournaments(),
      teams: db.getTeams(),
      players: db.getPlayers(),
      matches: db.getMatches(),
      points_tables: db.getPointsTables(),
      users: db.getUsers(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ctms-database-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    showToast('Database exported as JSON.', 'success');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-heading">System Settings</h1>
        <p className="text-xs text-slate-500">Configure global parameters, backup, and restore defaults.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
        <div>
          <h3 className="font-bold text-sm text-slate-900 mb-1">Database Backup & Export</h3>
          <p className="text-xs text-slate-500 mb-3">
            Download the complete active database snapshot (tournaments, teams, rosters, fixtures, and scorecards).
          </p>
          <button
            onClick={handleExportJSON}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Database (JSON)</span>
          </button>
        </div>

        <div className="pt-6 border-t border-slate-100">
          <h3 className="font-bold text-sm text-red-600 mb-1">Reset to Demo State</h3>
          <p className="text-xs text-slate-500 mb-3">
            Re-populate the database with the initial Campus Premier League dataset, full teams, players, and match fixtures.
          </p>
          <button
            onClick={handleResetData}
            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset to Initial Demo Seed</span>
          </button>
        </div>
      </div>
    </div>
  );
};
