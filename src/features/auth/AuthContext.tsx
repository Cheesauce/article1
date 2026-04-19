
import React, { createContext, useContext, useEffect, useState } from 'react';
import { persistence } from '../../utils/persistence';

const OWNER_EMAIL = 'dbsuelan@revlv.com';
const OWNER_PASSWORD = 'Enterpassword!@#';
const AUTH_KEY = 'tracktt.auth.v1';

type AuthContextValue = {
  isOwner: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await persistence.getItem(AUTH_KEY);
        if (raw === 'owner') setIsOwner(true);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login: AuthContextValue['login'] = async (email, password) => {
    await new Promise((r) => setTimeout(r, 450));
    if (email.trim().toLowerCase() !== OWNER_EMAIL.toLowerCase()) {
      return { ok: false, error: 'No account found with that email.' };
    }
    if (password !== OWNER_PASSWORD) {
      return { ok: false, error: 'Incorrect password. Please try again.' };
    }
    setIsOwner(true);
    await persistence.setItem(AUTH_KEY, 'owner');
    return { ok: true };
  };

  const logout = async () => {
    setIsOwner(false);
    await persistence.removeItem(AUTH_KEY);
  };

  return (
    <AuthContext.Provider value={{ isOwner, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
