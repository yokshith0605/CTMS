import React, { useState, useEffect } from 'react';
import { Team, Tournament } from '../../types';
import { db } from '../../services/db';
import { useToast } from '../common/Toast';
import { Modal } from '../common/Modal';

interface TeamFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  team?: Team | null;
  defaultTournamentId?: string;
  onSuccess?: (t: Team) => void;
}

export const TeamFormModal: React.FC<TeamFormModalProps> = ({
  isOpen,
  onClose,
  team,
  defaultTournamentId,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const tournaments = db.getTournaments();

  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [tournamentId, setTournamentId] = useState('');
  const [captain, setCaptain] = useState('');
  const [coach, setCoach] = useState('');
  const [manager, setManager] = useState('');
  const [contact, setContact] = useState('');
  const [logo, setLogo] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (team) {
      setName(team.name);
      setShortName(team.short_name);
      setTournamentId(team.tournament_id);
      setCaptain(team.captain);
      setCoach(team.coach);
      setManager(team.manager);
      setContact(team.contact);
      setLogo(team.logo);
    } else {
      setName('');
      setShortName('');
      setTournamentId(defaultTournamentId || (tournaments[0]?.id || ''));
      setCaptain('');
      setCoach('');
      setManager('');
      setContact('');
      setLogo('https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=160&auto=format&fit=crop&q=80');
    }
    setError(null);
  }, [team, isOpen, defaultTournamentId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (!name.trim()) throw new Error('Please enter the team name.');
      if (!shortName.trim()) throw new Error('Please enter a team short code (e.g. VZW).');
      if (!tournamentId) throw new Error('Please select a valid tournament.');

      if (team) {
        const updated = db.updateTeam(team.id, {
          name: name.trim(),
          short_name: shortName.trim().toUpperCase(),
          tournament_id: tournamentId,
          captain: captain.trim(),
          coach: coach.trim(),
          manager: manager.trim(),
          contact: contact.trim(),
          logo: logo.trim() || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=160&auto=format&fit=crop&q=80',
        });
        showToast('Team information updated successfully.');
        if (onSuccess) onSuccess(updated);
      } else {
        const created = db.createTeam({
          name: name.trim(),
          short_name: shortName.trim().toUpperCase(),
          tournament_id: tournamentId,
          captain: captain.trim(),
          coach: coach.trim(),
          manager: manager.trim(),
          contact: contact.trim(),
          logo: logo.trim() || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=160&auto=format&fit=crop&q=80',
        });
        showToast('Team registered successfully.');
        if (onSuccess) onSuccess(created);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save team.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={team ? 'Edit Team Details' : 'Register New Team'}
      subtitle="Register team franchise, assign leadership, and configure identifiers."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Team Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!shortName && e.target.value.length >= 3) {
                  setShortName(e.target.value.slice(0, 3).toUpperCase());
                }
              }}
              placeholder="e.g. Coastal Kings"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Short Code *
            </label>
            <input
              type="text"
              required
              maxLength={4}
              value={shortName}
              onChange={(e) => setShortName(e.target.value.toUpperCase())}
              placeholder="e.g. CSK"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Tournament *
          </label>
          <select
            required
            value={tournamentId}
            onChange={(e) => setTournamentId(e.target.value)}
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
              Captain
            </label>
            <input
              type="text"
              value={captain}
              onChange={(e) => setCaptain(e.target.value)}
              placeholder="e.g. Rohit Reddy"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Coach
            </label>
            <input
              type="text"
              value={coach}
              onChange={(e) => setCoach(e.target.value)}
              placeholder="e.g. Vikram Shekar"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Team Manager / Email
            </label>
            <input
              type="text"
              value={manager}
              onChange={(e) => setManager(e.target.value)}
              placeholder="manager@coastalkings.com"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Official Contact Info
            </label>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="e.g. phone or email"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Logo URL
          </label>
          <input
            type="url"
            value={logo}
            onChange={(e) => setLogo(e.target.value)}
            placeholder="https://..."
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />
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
            {team ? 'Update Team' : 'Register Team'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
