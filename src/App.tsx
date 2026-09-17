import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/common/Toast';
import { useRouter } from './services/router';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { TournamentPublicPage } from './pages/public/TournamentPublicPage';
import { TeamPublicPage } from './pages/public/TeamPublicPage';
import { FixturesPublicPage } from './pages/public/FixturesPublicPage';
import { PlayersPublicPage } from './pages/public/PlayersPublicPage';
import { PointsTablePublicPage } from './pages/public/PointsTablePublicPage';
import { ScorecardPublicPage } from './pages/public/ScorecardPublicPage';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage, ForgotPasswordPage } from './pages/auth/RegisterPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import {
  AdminTournamentsPage,
  AdminTeamsPage,
  AdminPlayersPage,
  AdminMatchesPage,
  AdminScorecardsPage,
  AdminPointsTablePage,
  AdminReportsPage,
  AdminUsersPage,
  AdminSettingsPage,
} from './pages/admin/AdminManagementPages';

// Manager Pages
import { ManagerDashboard } from './pages/manager/ManagerDashboard';

// Scorer Pages
import { ScorerDashboard } from './pages/scorer/ScorerDashboard';

const AppContent: React.FC = () => {
  const { path, params } = useRouter();
  const { role } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // If on landing page and path is exactly '/'
  if (path === '/') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)} />
        <LandingPage />
      </div>
    );
  }

  // Auth pages (full centered view without sidebar)
  if (path === '/login') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)} />
        <main className="flex-1">
          <LoginPage />
        </main>
      </div>
    );
  }

  if (path === '/register') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)} />
        <main className="flex-1">
          <RegisterPage />
        </main>
      </div>
    );
  }

  if (path === '/forgot-password') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)} />
        <main className="flex-1">
          <ForgotPasswordPage />
        </main>
      </div>
    );
  }

  // Route selector
  const renderRouteView = () => {
    // ----------------------------------------------------
    // Public Routes
    // ----------------------------------------------------
    if (path === '/tournaments') {
      return <TournamentPublicPage />;
    }
    if (path.startsWith('/tournaments/')) {
      const tId = path.split('/')[2];
      return <TournamentPublicPage tournamentId={tId} />;
    }

    if (path === '/teams') {
      return <TeamPublicPage />;
    }
    if (path.startsWith('/teams/')) {
      const teamId = path.split('/')[2];
      return <TeamPublicPage teamId={teamId} />;
    }

    if (path === '/fixtures') {
      return <FixturesPublicPage initialTab="fixtures" />;
    }
    if (path === '/results') {
      return <FixturesPublicPage initialTab="results" />;
    }
    if (path === '/points-table') {
      return <PointsTablePublicPage />;
    }
    if (path === '/players') {
      return <PlayersPublicPage />;
    }
    if (path.startsWith('/scorecards/')) {
      const matchId = path.split('/')[2];
      return <ScorecardPublicPage matchId={matchId} />;
    }

    // ----------------------------------------------------
    // Admin Routes
    // ----------------------------------------------------
    if (path === '/admin' || path === '/admin/dashboard') {
      return <AdminDashboard />;
    }
    if (path === '/admin/tournaments') {
      return <AdminTournamentsPage />;
    }
    if (path === '/admin/teams') {
      return <AdminTeamsPage />;
    }
    if (path === '/admin/players') {
      return <AdminPlayersPage />;
    }
    if (path === '/admin/matches') {
      return <AdminMatchesPage />;
    }
    if (path === '/admin/scorecards') {
      return <AdminScorecardsPage />;
    }
    if (path === '/admin/points-table') {
      return <AdminPointsTablePage />;
    }
    if (path === '/admin/reports') {
      return <AdminReportsPage />;
    }
    if (path === '/admin/users') {
      return <AdminUsersPage />;
    }
    if (path === '/admin/settings') {
      return <AdminSettingsPage />;
    }

    // ----------------------------------------------------
    // Team Manager Routes
    // ----------------------------------------------------
    if (path === '/manager' || path === '/manager/dashboard') {
      return <ManagerDashboard viewTab="dashboard" />;
    }
    if (path === '/manager/team') {
      return <ManagerDashboard viewTab="team" />;
    }
    if (path === '/manager/players') {
      return <ManagerDashboard viewTab="players" />;
    }
    if (path === '/manager/fixtures') {
      return <ManagerDashboard viewTab="fixtures" />;
    }
    if (path === '/manager/results') {
      return <ManagerDashboard viewTab="results" />;
    }
    if (path === '/manager/points-table') {
      return <ManagerDashboard viewTab="points-table" />;
    }

    // ----------------------------------------------------
    // Scorer Routes
    // ----------------------------------------------------
    if (path === '/scorer' || path === '/scorer/dashboard') {
      return <ScorerDashboard tab="dashboard" />;
    }
    if (path === '/scorer/matches') {
      return <ScorerDashboard tab="matches" />;
    }
    if (path.startsWith('/scorer/matches/')) {
      const matchId = path.split('/')[3];
      return <ScorerDashboard matchId={matchId} />;
    }
    if (path === '/scorer/scorecards') {
      return <AdminScorecardsPage />;
    }
    if (path === '/scorer/history') {
      return <ScorerDashboard tab="history" />;
    }

    // Fallback: default to Tournaments Page
    return <TournamentPublicPage />;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans">
      <Navbar onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)} />

      <div className="flex-1 flex">
        <Sidebar
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {renderRouteView()}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
}
