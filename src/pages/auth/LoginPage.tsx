import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from '../../services/router';
import { Trophy, Shield, UserCheck, Activity, Users, LogIn, Lock, Mail, ArrowRight } from 'lucide-react';
import { useToast } from '../../components/common/Toast';

export const LoginPage: React.FC = () => {
  const { login, switchRoleQuick } = useAuth();
  const { navigate } = useRouter();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const redirectByRole = (role: string) => {
    switch (role) {
      case 'admin':
        navigate('/admin/dashboard');
        break;
      case 'team_manager':
        navigate('/manager/dashboard');
        break;
      case 'scorer':
        navigate('/scorer/dashboard');
        break;
      default:
        navigate('/tournaments');
        break;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const res = login(email, password);
    if (res.success && res.user) {
      showToast(`Welcome back, ${res.user.name}!`, 'success');
      redirectByRole(res.user.role);
    } else {
      setError(res.error || 'Login failed. Check credentials.');
    }
  };

  const handleQuickDemo = (role: 'admin' | 'team_manager' | 'scorer' | 'viewer') => {
    switchRoleQuick(role);
    showToast(`Signed in as Demo ${role.replace('_', ' ').toUpperCase()}`, 'info');
    redirectByRole(role);
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 rounded-2xl bg-emerald-800 text-amber-400 flex items-center justify-center mx-auto mb-3 shadow-md">
          <Trophy className="w-6 h-6" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
          Sign In to CTMS
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Cricket Tournament Management System Portal
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-slate-200 shadow-md">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email / Username
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@ctms.org"
                  className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-xs text-emerald-800 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          </form>

          {/* Quick Demo Credentials Section */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 text-center mb-3">
              Fast Demo Accounts (One-Click Testing)
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100 text-left transition-colors"
              >
                <span className="font-bold text-emerald-900 block">👑 Admin</span>
                <span className="text-[10px] text-emerald-700">Full System Access</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('team_manager')}
                className="p-2.5 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100 text-left transition-colors"
              >
                <span className="font-bold text-blue-900 block">🛡️ Manager</span>
                <span className="text-[10px] text-blue-700">Coastal Kings Team</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('scorer')}
                className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100 text-left transition-colors"
              >
                <span className="font-bold text-amber-900 block">🎯 Scorer</span>
                <span className="text-[10px] text-amber-700">Live Match Console</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('viewer')}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition-colors"
              >
                <span className="font-bold text-slate-800 block">👁️ Viewer</span>
                <span className="text-[10px] text-slate-500">Public Standings</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            <span>Are you a new Team Manager? </span>
            <button
              onClick={() => navigate('/register')}
              className="text-emerald-800 font-bold hover:underline"
            >
              Register Team Manager Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
