import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { db } from '../services/db';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (emailOrUsername: string, password?: string) => { success: boolean; user?: User; error?: string };
  logout: () => void;
  switchRoleQuick: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => db.getCurrentUser());

  useEffect(() => {
    return db.subscribe(() => {
      setUser(db.getCurrentUser());
    });
  }, []);

  const login = (emailOrUsername: string, password?: string) => {
    const res = db.login(emailOrUsername, password);
    if (res.success && res.user) {
      setUser(res.user);
    }
    return res;
  };

  const logout = () => {
    db.logout();
    setUser(null);
  };

  const switchRoleQuick = (targetRole: UserRole) => {
    const users = db.getUsers();
    const found = users.find((u) => u.role === targetRole);
    if (found) {
      db.setCurrentUser(found);
    } else {
      // Fallback guest viewer
      const fallbackViewer: User = {
        id: 'user-guest-viewer',
        name: 'Public Viewer',
        email: 'guest@ctms.org',
        role: 'viewer',
        created_at: new Date().toISOString(),
      };
      db.setCurrentUser(fallbackViewer);
    }
  };

  const role: UserRole = user ? user.role : 'viewer';

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated: !!user,
        login,
        logout,
        switchRoleQuick,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
