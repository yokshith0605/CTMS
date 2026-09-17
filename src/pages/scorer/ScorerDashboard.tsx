import React from 'react';
import { db } from '../../services/db';
import { useRouter } from '../../services/router';
import { MatchCard } from '../../components/cricket/MatchCard';
import { LiveScoringConsole } from '../../components/scorer/LiveScoringConsole';
import {
  Activity,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  Trophy,
  Flame,
  AlertCircle
} from 'lucide-react';

interface ScorerDashboardProps {
  matchId?: string;
  tab?: 'dashboard' | 'matches' | 'scorecards' | 'history';
}

export const ScorerDashboard: React.FC<ScorerDashboardProps> = ({ matchId, tab = 'dashboard' }) => {
  const { navigate } = useRouter();

  // If matchId is provided, render the Live Scoring Console directly!
  if (matchId) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/scorer/dashboard')}
            className="text-xs font-bold text-slate-500 hover:text-slate-800"
          >
            ← Back to Scorer Matches
          </button>
        </div>
        <LiveScoringConsole matchId={matchId} />
      </div>
    );
  }

  const matches = db.getMatches();
  const liveMatches = matches.filter((m) => m.status === 'Live');
  const scheduledMatches = matches.filter((m) => m.status === 'Scheduled');
  const completedMatches = matches.filter((m) => m.status === 'Completed');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Official Match Scorer
            </span>
            <h1 className="text-2xl font-bold text-slate-900 font-heading mt-1">
              Scorer Console & Match Operations
            </h1>
            <p className="text-xs text-slate-500">
              Select any live or scheduled match below to launch ball-by-ball scoring, track runs/wickets, and record results.
            </p>
          </div>
        </div>

        {/* 3 Quick Counters */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 font-medium">In-Play Live</span>
            <p className="text-2xl font-bold font-mono text-red-600 mt-0.5">{liveMatches.length}</p>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Scheduled Today</span>
            <p className="text-2xl font-bold font-mono text-amber-600 mt-0.5">{scheduledMatches.length}</p>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Scored Matches</span>
            <p className="text-2xl font-bold font-mono text-emerald-700 mt-0.5">{completedMatches.length}</p>
          </div>
        </div>
      </div>

      {/* Live Matches Section */}
      {liveMatches.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-base font-bold text-slate-900 font-heading flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
            <span>Active Live Matches (In Progress)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {liveMatches.map((m) => (
              <div key={m.id} className="relative group">
                <MatchCard match={m} canScore={true} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scheduled Matches Section */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-slate-900 font-heading flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-800" />
          <span>Scheduled Fixtures Ready for Scoring</span>
        </h3>

        {scheduledMatches.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
            No scheduled matches awaiting scoring.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scheduledMatches.map((m) => (
              <MatchCard key={m.id} match={m} canScore={true} />
            ))}
          </div>
        )}
      </div>

      {/* Completed Matches History */}
      <div className="space-y-3 pt-4">
        <h3 className="text-base font-bold text-slate-900 font-heading flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Completed Matches & Archived Scorecards</span>
        </h3>

        {completedMatches.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
            No completed matches in history.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedMatches.map((m) => (
              <MatchCard key={m.id} match={m} canScore={false} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
