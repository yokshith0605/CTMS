import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from '../../services/router';
import { UserRole } from '../../types';
import {
  Shield,
  User,
  LogOut,
  LogIn,
  Menu,
  X,
  Trophy,
  Activity,
  Users,
  Calendar,
  Flame,
  ChevronDown
} from 'lucide-react';

interface NavbarProps {
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
  onToggleMobileSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleMobileMenu,
  isMobileMenuOpen = false,
  onToggleMobileSidebar,
}) => {
  const { user, role, logout, switchRoleQuick } = useAuth();
  const { navigate, path } = useRouter();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const handleToggleMenu = onToggleMobileSidebar || onToggleMobileMenu;

  const getRoleBadge = (r: UserRole) => {
    switch (r) {
      case 'admin':
        return { label: 'Admin', color: 'bg-emerald-800 text-white' };
      case 'team_manager':
        return { label: 'Team Manager', color: 'bg-blue-800 text-white' };
      case 'scorer':
        return { label: 'Official Scorer', color: 'bg-amber-600 text-white' };
      default:
        return { label: 'Public Viewer', color: 'bg-slate-700 text-slate-100' };
    }
  };

  const currentBadge = getRoleBadge(role);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleMenu}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
              aria-label="Toggle Navigation"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div
              onClick={() => navigate('/')}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              {/* Cricket Logo Icon */}
              <div className="w-10 h-10 rounded-xl bg-emerald-800 flex items-center justify-center text-amber-400 shadow-xs group-hover:scale-105 transition-transform">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-slate-900 text-lg tracking-tight font-heading">
                    CTMS
                  </span>
                  <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                    2026
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-500 hidden md:block">
                  Cricket Tournament Management System
                </p>
              </div>
            </div>
          </div>

          {/* Center: Quick Role Switcher Pill for College Demo Testing */}
          <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <span className="px-2.5 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
              Role:
            </span>
            <button
              onClick={() => {
                switchRoleQuick('admin');
                navigate('/admin/dashboard');
              }}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                role === 'admin'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              Admin
            </button>
            <button
              onClick={() => {
                switchRoleQuick('team_manager');
                navigate('/manager/dashboard');
              }}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                role === 'team_manager'
                  ? 'bg-blue-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              Manager
            </button>
            <button
              onClick={() => {
                switchRoleQuick('scorer');
                navigate('/scorer/dashboard');
              }}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                role === 'scorer'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              Scorer
            </button>
            <button
              onClick={() => {
                switchRoleQuick('viewer');
                navigate('/tournaments');
              }}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                role === 'viewer'
                  ? 'bg-slate-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              Viewer
            </button>
          </div>

          {/* Right Action: User Status & Logout/Login */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-slate-900 truncate max-w-[150px]">
                    {user.name}
                  </p>
                  <span
                    className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md ${currentBadge.color}`}
                  >
                    {currentBadge.label}
                  </span>
                </div>

                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  title="Log out of session"
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-slate-200"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl transition-all shadow-xs"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Login</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
