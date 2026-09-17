import React from 'react';
import { TournamentStatus, MatchStatus } from '../../types';

interface StatusBadgeProps {
  status: TournamentStatus | MatchStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  let colorClass = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotClass = 'bg-slate-400';

  const normalized = status?.toLowerCase() || '';

  if (normalized === 'live') {
    colorClass = 'bg-red-50 text-red-700 border-red-200 animate-pulse';
    dotClass = 'bg-red-500';
  } else if (normalized === 'ongoing' || normalized === 'active') {
    colorClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    dotClass = 'bg-emerald-500';
  } else if (normalized === 'upcoming' || normalized === 'scheduled') {
    colorClass = 'bg-amber-50 text-amber-800 border-amber-200';
    dotClass = 'bg-amber-500';
  } else if (normalized === 'completed') {
    colorClass = 'bg-blue-50 text-blue-800 border-blue-200';
    dotClass = 'bg-blue-500';
  } else if (normalized === 'cancelled') {
    colorClass = 'bg-rose-50 text-rose-700 border-rose-200';
    dotClass = 'bg-rose-500';
  }

  const paddingClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${paddingClass} ${colorClass} whitespace-nowrap`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
      {status}
    </span>
  );
};
