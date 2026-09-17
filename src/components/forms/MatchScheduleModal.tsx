import React, { useState, useEffect } from 'react';
import { Match, MatchType, MatchStatus, Tournament, Team } from '../../types';
import { db } from '../../services/db';
import { useToast } from '../common/Toast';
import { Modal } from '../common/Modal';

interface MatchScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  match?: Match | null;
  defaultTournamentId?: string;
  onSuccess?: (m: Match) => void;
}

export const MatchScheduleModal: React.FC<MatchScheduleModalProps> = ({
  isOpen,
  onClose,
  match,
  defaultTournamentId,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const tournaments = db.getTournaments();

  const [tournamentId, setTournamentId] = useState('');
  const [team1Id, setTeam1Id] = useState('');
  const [team2Id, setTeam2Id] = useState('');
  const [matchDate, setMatchDate] = useState('');
  const [matchTime, setMatchTime] = useState('14:30');
  const [venue, setVenue] = useState('');
  const [matchType, setMatchType] = useState<MatchType>('League');
  const [status, setStatus] = useState<MatchStatus>('Scheduled');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (match) {
      setTournamentId(match.tournament_id);
      setTeam1Id(match.team1_id);
      setTeam2Id(match.team2_id);
      setMatchDate(match.match_date);
      setMatchTime(match.match_time);
      setVenue(match.venue);
      setMatchType(match.match_type);
      setStatus(match.status);
    } else {
      const defaultTourn = defaultTournamentId || tournaments[0]?.id || '';
      setTournamentId(defaultTourn);
      const tournTeams = db.getTeams(defaultTourn);
      setTeam1Id(tournTeams[0]?.id || '');
      setTeam2Id(tournTeams[1]?.id || '');
      setMatchDate('2026-09-21');
      setMatchTime('15:00');
      setVenue('University Stadium Pitch A');
      setMatchType('League');
      setStatus('Scheduled');
    }
    setError(null);
  }, [match, isOpen, defaultTournamentId]);

  // Update teams list when tournament changes
  const availableTeams = db.getTeams(tournamentId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (!tournamentId) throw new Error('Please select a tournament.');
      if (!team1Id || !team2Id) throw new Error('Both Team 1 and Team 2 must be selected.');
      if (team1Id === team2Id) throw new Error('Team 1 and Team 2 cannot be the same team.');
      if (!matchDate) throw new Error('Please select a valid match date.');
      if (!venue.trim()) throw new Error('Match venue is required.');

      if (match) {
        const updated = db.updateMatch(match.id, {
          tournament_id: tournamentId,
          team1_id: team1Id,
          team2_id: team2Id,
          match_date: matchDate,
          match_time: matchTime,
          venue: venue.trim(),
          match_type: matchType,
          status,
        });
        showToast('Match updated successfully.');
        if (onSuccess) onSuccess(updated);
      } else {
        const created = db.createMatch({
          tournament_id: tournamentId,
          team1_id: team1Id,
          team2_id: team2Id,
          match_date: matchDate,
          match_time: matchTime,
          venue: venue.trim(),
          match_type: matchType,
          status,
        });
        showToast('Match scheduled successfully.');
        if (onSuccess) onSuccess(created);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to schedule match.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={match ? 'Edit Match Fixture' : 'Schedule Match'}
      subtitle="Configure fixture pairings, venue allocation, and match classification."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Tournament *
          </label>
          <select
            required
            value={tournamentId}
            onChange={(e) => {
              setTournamentId(e.target.value);
              const teams = db.getTeams(e.target.value);
              setTeam1Id(teams[0]?.id || '');
              setTeam2Id(teams[1]?.id || '');
            }}
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          >
            <option value="">Select Tournament</option>
            {tournaments.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.format})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Team 1 *
            </label>
            <select
              required
              value={team1Id}
              onChange={(e) => setTeam1Id(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              <option value="">Select Team 1</option>
              {availableTeams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.short_name})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Team 2 *
            </label>
            <select
              required
              value={team2Id}
              onChange={(e) => setTeam2Id(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              <option value="">Select Team 2</option>
              {availableTeams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.short_name})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Match Date *
            </label>
            <input
              type="date"
              required
              value={matchDate}
              onChange={(e) => setMatchDate(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Match Time *
            </label>
            <input
              type="time"
              required
              value={matchTime}
              onChange={(e) => setMatchTime(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Ground / Venue *
          </label>
          <input
            type="text"
            required
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            placeholder="e.g. University Stadium Pitch A"
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Match Type
            </label>
            <select
              value={matchType}
              onChange={(e) => setMatchType(e.target.value as MatchType)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              <option value="League">League Stage</option>
              <option value="Qualifier">Qualifier</option>
              <option value="Eliminator">Eliminator</option>
              <option value="Semi-Final">Semi-Final</option>
              <option value="Final">Grand Final</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as MatchStatus)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              <option value="Scheduled">Scheduled</option>
              <option value="Live">Live</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-sm font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl transition-all shadow-xs"
          >
            {match ? 'Save Fixture' : 'Schedule Match'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
