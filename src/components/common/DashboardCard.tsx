import React from 'react';
import { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  variant?: 'emerald' | 'amber' | 'blue' | 'slate';
  onClick?: () => void;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'emerald',
  onClick,
}) => {
  const variantStyles = {
    emerald: {
      bg: 'bg-white',
      border: 'border-slate-200 hover:border-emerald-500/50',
      iconBg: 'bg-emerald-50 text-emerald-800',
      valueColor: 'text-slate-900',
    },
    amber: {
      bg: 'bg-white',
      border: 'border-slate-200 hover:border-amber-500/50',
      iconBg: 'bg-amber-50 text-amber-800',
      valueColor: 'text-slate-900',
    },
    blue: {
      bg: 'bg-white',
      border: 'border-slate-200 hover:border-blue-500/50',
      iconBg: 'bg-blue-50 text-blue-800',
      valueColor: 'text-slate-900',
    },
    slate: {
      bg: 'bg-white',
      border: 'border-slate-200 hover:border-slate-400',
      iconBg: 'bg-slate-100 text-slate-700',
      valueColor: 'text-slate-900',
    },
  }[variant];

  return (
    <div
      onClick={onClick}
      className={`${variantStyles.bg} rounded-xl border ${variantStyles.border} p-5 shadow-xs transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <p className={`mt-1.5 text-2xl font-bold font-heading ${variantStyles.valueColor}`}>{value}</p>
          {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
          {trend && (
            <p className="mt-1 text-xs font-medium text-emerald-700 flex items-center gap-1">
              <span>↑</span> {trend}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl shrink-0 ${variantStyles.iconBg}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};
