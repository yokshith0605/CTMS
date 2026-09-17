import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from '../../services/router';
import {
  LayoutDashboard,
  Trophy,
  Shield,
  Users,
  Calendar,
  FileText,
  Table,
  BarChart3,
  UserCheck,
  Settings,
  LogOut,
  Home,
  CheckCircle2,
  Activity,
  Flame,
  Clock,
  Briefcase
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const { role, logout, user } = useAuth();
  const { navigate, path } = useRouter();

  const handleNav = (targetPath: string) => {
    navigate(targetPath);
    onCloseMobile();
  };

  const isActive = (itemPath: string) => {
    if (itemPath === '/' && path === '/') return true;
    if (itemPath !== '/' && path.startsWith(itemPath)) return true;
    return false;
  };

  // Menu items by Role
  const adminItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { label: 'Tournaments', icon: Trophy, path: '/admin/tournaments' },
    { label: 'Teams', icon: Shield, path: '/admin/teams' },
    { label: 'Players', icon: Users, path: '/admin/players' },
    { label: 'Matches', icon: Calendar, path: '/admin/matches' },
    { label: 'Scorecards', icon: FileText, path: '/admin/scorecards' },
    { label: 'Points Table', icon: Table, path: '/admin/points-table' },
    { label: 'Reports', icon: BarChart3, path: '/admin/reports' },
    { label: 'Users', icon: UserCheck, path: '/admin/users' },
    { label: 'Settings', icon: Settings, path: '/admin/settings' },
  ];

  const managerItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/manager/dashboard' },
    { label: 'My Team', icon: Shield, path: '/manager/team' },
    { label: 'Players', icon: Users, path: '/manager/players' },
    { label: 'Fixtures', icon: Calendar, path: '/manager/fixtures' },
    { label: 'Results', icon: CheckCircle2, path: '/manager/results' },
    { label: 'Points Table', icon: Table, path: '/manager/points-table' },
  ];

  const scorerItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/scorer/dashboard' },
    { label: 'Assigned Matches', icon: Calendar, path: '/scorer/matches' },
    { label: 'Live Scoring', icon: Activity, path: '/scorer/matches' },
    { label: 'Scorecards', icon: FileText, path: '/scorer/scorecards' },
    { label: 'Match History', icon: Clock, path: '/scorer/history' },
  ];

  const viewerItems = [
    { label: 'Home', icon: Home, path: '/' },
    { label: 'Tournaments', icon: Trophy, path: '/tournaments' },
    { label: 'Teams', icon: Shield, path: '/teams' },
    { label: 'Fixtures', icon: Calendar, path: '/fixtures' },
    { label: 'Results', icon: CheckCircle2, path: '/results' },
    { label: 'Points Table', icon: Table, path: '/points-table' },
    { label: 'Players', icon: Users, path: '/players' },
  ];

  let items = viewerItems;
  let roleTitle = 'Public Viewer';

  if (role === 'admin') {
    items = adminItems;
    roleTitle = 'Admin Portal';
  } else if (role === 'team_manager') {
    items = managerItems;
    roleTitle = 'Team Manager Portal';
  } else if (role === 'scorer') {
    items = scorerItems;
    roleTitle = 'Scorer Console';
  }

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      {/* Role Title Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Workspace</span>
          <h3 className="text-sm font-bold text-slate-800 font-heading">{roleTitle}</h3>
        </div>
        {user?.team_id && role === 'team_manager' && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
            Assigned
          </span>
        )}
      </div>

      {/* Navigation links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {items.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={() => handleNav(item.path)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                active
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-amber-300' : 'text-slate-400'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Logout / Switch section */}
      <div className="p-3 border-t border-slate-100">
        {user ? (
          <button
            onClick={() => {
              logout();
              handleNav('/');
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-700 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4 text-rose-500 shrink-0" />
            <span>Sign Out</span>
          </button>
        ) : (
          <button
            onClick={() => handleNav('/login')}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-emerald-900 transition-colors"
          >
            <span>Sign In</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 min-h-[calc(100vh-4rem)]">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={onCloseMobile} />
          <div className="relative w-64 max-w-[80vw] h-full bg-white shadow-xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
