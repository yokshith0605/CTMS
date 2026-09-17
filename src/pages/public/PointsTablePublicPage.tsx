import React, { useState } from 'react';
import { db } from '../../services/db';
import { PointsTable } from '../../components/cricket/PointsTable';
import { Trophy, Filter } from 'lucide-react';

export const PointsTablePublicPage: React.FC = () => {
  const tournaments = db.getTournaments();
  const [selectedTournId, setSelectedTournId] = useState(tournaments[0]?.id || '');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-heading">
            Tournament Standings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time points table, Net Run Rate (NRR), matches won, lost, and tied.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedTournId}
            onChange={(e) => setSelectedTournId(e.target.value)}
            className="text-xs sm:text-sm bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium"
          >
            {tournaments.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs max-w-5xl mx-auto">
        <PointsTable tournamentId={selectedTournId} />
      </div>
    </div>
  );
};
