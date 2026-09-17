import React, { useState } from 'react';
import { db } from '../../services/db';
import { MatchCard } from '../../components/cricket/MatchCard';
import { Calendar, CheckCircle2, Filter } from 'lucide-react';

interface FixturesPublicPageProps {
  initialTab?: 'fixtures' | 'results';
}

export const FixturesPublicPage: React.FC<FixturesPublicPageProps> = ({ initialTab = 'fixtures' }) => {
  const [activeTab, setActiveTab] = useState<'fixtures' | 'results'>(initialTab);
  const [tournFilter, setTournFilter] = useState('all');

  const tournaments = db.getTournaments();
  const matches = db.getMatches();

  const filtered = matches.filter((m) => tournFilter === 'all' || m.tournament_id === tournFilter);
  const fixtures = filtered.filter((m) => m.status === 'Scheduled' || m.status === 'Live');
  const results = filtered.filter((m) => m.status === 'Completed');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-heading">
            {activeTab === 'fixtures' ? 'Match Fixtures & Schedule' : 'Match Results'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Check live match progress, upcoming tournament dates, and completed results.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={tournFilter}
            onChange={(e) => setTournFilter(e.target.value)}
            className="text-xs sm:text-sm bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium"
          >
            <option value="all">All Tournaments</option>
            {tournaments.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('fixtures')}
          className={`py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'fixtures'
              ? 'border-emerald-800 text-emerald-900'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Upcoming & Live Fixtures ({fixtures.length})
        </button>
        <button
          onClick={() => setActiveTab('results')}
          className={`py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'results'
              ? 'border-emerald-800 text-emerald-900'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Completed Results ({results.length})
        </button>
      </div>

      {activeTab === 'fixtures' ? (
        fixtures.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
            No upcoming fixtures found for this tournament.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fixtures.map((m) => (
              <MatchCard key={m.id} match={m} canScore={false} />
            ))}
          </div>
        )
      ) : results.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
          No completed match results found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((m) => (
            <MatchCard key={m.id} match={m} canScore={false} />
          ))}
        </div>
      )}
    </div>
  );
};
