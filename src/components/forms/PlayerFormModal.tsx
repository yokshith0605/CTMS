import React, { useState, useEffect } from 'react';
import { Player, PlayerRole, Team } from '../../types';
import { db } from '../../services/db';
import { useToast } from '../common/Toast';
import { Modal } from '../common/Modal';

interface PlayerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  player?: Player | null;
  defaultTeamId?: string;
  onSuccess?: (p: Player) => void;
}

export const PlayerFormModal: React.FC<PlayerFormModalProps> = ({
  isOpen,
  onClose,
  player,
  defaultTeamId,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const teams = db.getTeams();

  const [name, setName] = useState('');
  const [teamId, setTeamId] = useState('');
  const [dob, setDob] = useState('');
  const [age, setAge] = useState<number>(22);
  const [jerseyNumber, setJerseyNumber] = useState<number | string>('');
  const [role, setRole] = useState<PlayerRole>('Batsman');
  const [battingStyle, setBattingStyle] = useState('Right-hand bat');
  const [bowlingStyle, setBowlingStyle] = useState('Right-arm medium');
  const [contact, setContact] = useState('');
  const [photo, setPhoto] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (player) {
      setName(player.name);
      setTeamId(player.team_id);
      setDob(player.date_of_birth);
      setAge(player.age);
      setJerseyNumber(player.jersey_number);
      setRole(player.role);
      setBattingStyle(player.batting_style);
      setBowlingStyle(player.bowling_style);
      setContact(player.contact);
      setPhoto(player.photo);
    } else {
      setName('');
      setTeamId(defaultTeamId || (teams[0]?.id || ''));
      setDob('2003-05-15');
      setAge(23);
      setJerseyNumber(Math.floor(Math.random() * 80) + 1);
      setRole('Batsman');
      setBattingStyle('Right-hand bat');
      setBowlingStyle('Right-arm medium');
      setContact('');
      setPhoto('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80');
    }
    setError(null);
  }, [player, isOpen, defaultTeamId]);

  const calculateAge = (dateStr: string) => {
    if (!dateStr) return 22;
    const diff = Date.now() - new Date(dateStr).getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (!name.trim()) throw new Error('Player name is required.');
      if (!teamId) throw new Error('Player must belong to a valid team.');
      if (jerseyNumber === '' || isNaN(Number(jerseyNumber))) {
        throw new Error('Please enter a valid jersey number.');
      }

      const numJersey = Number(jerseyNumber);

      if (player) {
        const updated = db.updatePlayer(player.id, {
          name: name.trim(),
          team_id: teamId,
          date_of_birth: dob,
          age: Number(age),
          jersey_number: numJersey,
          role,
          batting_style: battingStyle,
          bowling_style: bowlingStyle,
          contact: contact.trim(),
          photo: photo.trim() || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
        });
        showToast('Player profile updated successfully.');
        if (onSuccess) onSuccess(updated);
      } else {
        const created = db.createPlayer({
          name: name.trim(),
          team_id: teamId,
          date_of_birth: dob,
          age: Number(age),
          jersey_number: numJersey,
          role,
          batting_style: battingStyle,
          bowling_style: bowlingStyle,
          contact: contact.trim(),
          photo: photo.trim() || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
        });
        showToast('Player added successfully.');
        if (onSuccess) onSuccess(created);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save player.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={player ? 'Edit Player Profile' : 'Add Player to Squad'}
      subtitle="Configure player attributes, jersey allocation, and playing styles."
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
              Player Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Arjun Verma"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Jersey # *
            </label>
            <input
              type="number"
              required
              min={1}
              max={99}
              value={jerseyNumber}
              onChange={(e) => setJerseyNumber(e.target.value)}
              placeholder="18"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Team *
            </label>
            <select
              required
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              <option value="">Select Team</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.short_name})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Playing Role *
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as PlayerRole)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              <option value="Batsman">Batsman</option>
              <option value="Bowler">Bowler</option>
              <option value="All-Rounder">All-Rounder</option>
              <option value="Wicketkeeper">Wicketkeeper</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Batting Style
            </label>
            <select
              value={battingStyle}
              onChange={(e) => setBattingStyle(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              <option value="Right-hand bat">Right-hand bat</option>
              <option value="Left-hand bat">Left-hand bat</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Bowling Style
            </label>
            <select
              value={bowlingStyle}
              onChange={(e) => setBowlingStyle(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              <option value="Right-arm fast">Right-arm fast</option>
              <option value="Right-arm medium">Right-arm medium</option>
              <option value="Right-arm off-spin">Right-arm off-spin</option>
              <option value="Right-arm leg spin">Right-arm leg spin</option>
              <option value="Left-arm fast">Left-arm fast</option>
              <option value="Left-arm orthodox">Left-arm orthodox</option>
              <option value="None">None (Pure batter)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Date of Birth
            </label>
            <input
              type="date"
              value={dob}
              onChange={(e) => {
                setDob(e.target.value);
                setAge(calculateAge(e.target.value));
              }}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Age
            </label>
            <input
              type="number"
              min={15}
              max={50}
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Photo URL
          </label>
          <input
            type="url"
            value={photo}
            onChange={(e) => setPhoto(e.target.value)}
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
            {player ? 'Save Changes' : 'Add Player'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
