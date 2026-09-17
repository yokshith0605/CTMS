import React, { useState, useEffect } from 'react';
import { Tournament, TournamentFormat, TournamentStatus } from '../../types';
import { db } from '../../services/db';
import { useToast } from '../common/Toast';
import { Modal } from '../common/Modal';

interface TournamentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournament?: Tournament | null;
  onSuccess?: (t: Tournament) => void;
}

export const TournamentFormModal: React.FC<TournamentFormModalProps> = ({
  isOpen,
  onClose,
  tournament,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [format, setFormat] = useState<TournamentFormat>('T20');
  const [status, setStatus] = useState<TournamentStatus>('Upcoming');
  const [maxTeams, setMaxTeams] = useState(6);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tournament) {
      setName(tournament.name);
      setDescription(tournament.description);
      setLocation(tournament.location);
      setStartDate(tournament.start_date);
      setEndDate(tournament.end_date);
      setFormat(tournament.format);
      setStatus(tournament.status);
      setMaxTeams(tournament.max_teams || 6);
    } else {
      setName('');
      setDescription('');
      setLocation('Campus Main Grounds, Vizag');
      setStartDate('2026-10-01');
      setEndDate('2026-10-15');
      setFormat('T20');
      setStatus('Upcoming');
      setMaxTeams(6);
    }
    setError(null);
  }, [tournament, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (!name.trim()) throw new Error('Please enter the tournament name.');
      if (!location.trim()) throw new Error('Please enter the tournament location/venue.');
      if (!startDate) throw new Error('Please enter the start date.');
      if (endDate && new Date(endDate) < new Date(startDate)) {
        throw new Error('End date cannot be earlier than start date.');
      }

      if (tournament) {
        const updated = db.updateTournament(tournament.id, {
          name: name.trim(),
          description: description.trim(),
          location: location.trim(),
          start_date: startDate,
          end_date: endDate,
          format,
          status,
          max_teams: Number(maxTeams),
        });
        showToast('Tournament updated successfully.');
        if (onSuccess) onSuccess(updated);
      } else {
        const created = db.createTournament({
          name: name.trim(),
          description: description.trim(),
          location: location.trim(),
          start_date: startDate,
          end_date: endDate,
          format,
          status,
          max_teams: Number(maxTeams),
        });
        showToast('Tournament created successfully.');
        if (onSuccess) onSuccess(created);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={tournament ? 'Edit Tournament' : 'Create Tournament'}
      subtitle="Fill in the tournament specifications and format details."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Tournament Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Campus Premier League 2026"
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Description
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief overview of the championship..."
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Location / Ground *
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. University Cricket Grounds"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Max Teams Allowed
            </label>
            <input
              type="number"
              min={2}
              max={32}
              value={maxTeams}
              onChange={(e) => setMaxTeams(Number(e.target.value))}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Start Date *
            </label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Cricket Format
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as TournamentFormat)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              <option value="T20">T20 (20 Overs)</option>
              <option value="ODI">ODI (50 Overs)</option>
              <option value="Test">Test Match</option>
              <option value="Custom">Custom Format</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TournamentStatus)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              <option value="Upcoming">Upcoming</option>
              <option value="Ongoing">Ongoing</option>
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
            {tournament ? 'Save Changes' : 'Create Tournament'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
