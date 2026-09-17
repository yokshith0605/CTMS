import React from 'react';
import { useRouter } from '../../services/router';
import { db } from '../../services/db';
import { MatchCard } from '../../components/cricket/MatchCard';
import {
  Trophy,
  Shield,
  Users,
  Calendar,
  Activity,
  Table,
  BarChart3,
  ArrowRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { navigate } = useRouter();
  const tournaments = db.getTournaments();
  const matches = db.getMatches();
  const liveMatches = matches.filter((m) => m.status === 'Live');
  const recentCompleted = matches.filter((m) => m.status === 'Completed').slice(0, 2);

  const features = [
    {
      title: 'Tournament Management',
      desc: 'Create, schedule, and configure T20, ODI, and custom cricket leagues with full lifecycle tracking.',
      icon: Trophy,
      color: 'bg-amber-50 text-amber-700',
    },
    {
      title: 'Team & Franchise Roster',
      desc: 'Register university and club teams with captains, coaches, branding, and contact credentials.',
      icon: Shield,
      color: 'bg-emerald-50 text-emerald-700',
    },
    {
      title: 'Player Profiles & Squads',
      desc: 'Track individual player profiles, jersey numbers, roles, batting/bowling styles, and career averages.',
      icon: Users,
      color: 'bg-blue-50 text-blue-700',
    },
    {
      title: 'Match Scheduling',
      desc: 'Schedule league, qualifier, and playoff fixtures with date validation, pitch allocation, and referee notes.',
      icon: Calendar,
      color: 'bg-purple-50 text-purple-700',
    },
    {
      title: 'Live Ball-by-Ball Scoring',
      desc: 'Official scorer interface with instant runs, extras, strike rotation, bowler spells, and wicket management.',
      icon: Activity,
      color: 'bg-red-50 text-red-700',
    },
    {
      title: 'Automated Points Table',
      desc: 'Dynamic real-time standings recalculating wins, ties, points, and Net Run Rate (NRR) mathematically.',
      icon: Table,
      color: 'bg-teal-50 text-teal-700',
    },
    {
      title: 'Detailed Match Reports',
      desc: 'Printable team and player reports with breakdown of boundaries, strike rates, economy rates, and milestones.',
      icon: BarChart3,
      color: 'bg-indigo-50 text-indigo-700',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-radial from-emerald-900 to-slate-950 text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-800/60 border border-emerald-600/40 text-xs font-semibold text-emerald-200 mb-6 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Cricket Tournament Management System (CTMS)</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight font-heading leading-tight">
            Cricket Tournament <br className="hidden sm:block" />
            <span className="text-emerald-400">Management System</span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Manage tournaments, teams, matches, scores and standings in one place.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => navigate('/tournaments')}
              className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm transition-all shadow-md flex items-center gap-2"
            >
              <span>View Tournaments</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-bold text-sm transition-all"
            >
              Portal Login
            </button>
          </div>
        </div>
      </section>

      {/* Live & Recent Highlights Section */}
      {(liveMatches.length > 0 || recentCompleted.length > 0) && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 w-full mb-12">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 font-heading flex items-center gap-2">
                <Activity className="w-4 h-4 text-red-500" />
                <span>Tournament Highlights</span>
              </h3>
              <button
                onClick={() => navigate('/fixtures')}
                className="text-xs font-semibold text-emerald-800 hover:underline"
              >
                All Fixtures →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {liveMatches.map((m) => (
                <MatchCard key={m.id} match={m} canScore={false} />
              ))}
              {recentCompleted.map((m) => (
                <MatchCard key={m.id} match={m} canScore={false} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* About the System */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900">
            About the System
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base">
            Designed to support institutional and professional cricket competitions, CTMS automates the entire lifecycle from tournament registration to match completion and live standings generation.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs hover:shadow-md transition-all"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 font-heading mb-2">{f.title}</h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-slate-100 py-16 px-4 sm:px-6 lg:px-8 border-y border-slate-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900">
              How It Works
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Four streamlined roles orchestrating seamless tournament operations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center mb-3">
                1
              </span>
              <h4 className="font-bold text-sm text-slate-900 mb-1">Admin Setup</h4>
              <p className="text-xs text-slate-500">
                Admin launches tournaments, registers teams, assigns players, and schedules fixtures.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center mb-3">
                2
              </span>
              <h4 className="font-bold text-sm text-slate-900 mb-1">Manager Squads</h4>
              <p className="text-xs text-slate-500">
                Team Managers manage player rosters, verify lineups, and inspect fixtures.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center mb-3">
                3
              </span>
              <h4 className="font-bold text-sm text-slate-900 mb-1">Live Scoring</h4>
              <p className="text-xs text-slate-500">
                Official Scorers track balls, runs, boundaries, extras, and wickets in real-time.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center mb-3">
                4
              </span>
              <h4 className="font-bold text-sm text-slate-900 mb-1">Automated Standings</h4>
              <p className="text-xs text-slate-500">
                System recalculates Points Table & Net Run Rate immediately upon match finish.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-emerald-800 flex items-center justify-center text-amber-400">
              <Trophy className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-900">CTMS</span>
            <span>• Cricket Tournament Management System</span>
          </div>
          <p>© 2026 CTMS. Designed for College Software Engineering Mini Projects.</p>
        </div>
      </footer>
    </div>
  );
};
