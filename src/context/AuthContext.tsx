// src/context/AuthContext.tsx
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import publicApi from '@/services/publicApi';
import privateApi from '@/services/privateApi';
import type { Amigo } from '@/types/AmigoTypes';

type AuthState = {
  isLoggedIn: boolean;
  loading: boolean;
  error: string | null;
  amigos: Amigo[];
  currentUser: Amigo | null;
  refreshAuth: () => Promise<void>;
};

export const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading]       = useState(true);
  const [amigos, setAmigos]         = useState<Amigo[]>([]);
  const [currentUser, setCurrentUser] = useState<Amigo | null>(null);
  const [error, setError]           = useState<string | null>(null);

  const verifyToken = useCallback(async (): Promise<boolean> => {
    try {
      const res = await publicApi.get<{ valid: boolean }>('/api/v1/verify_token');
      return res.data.valid;
    } catch { return false; }
  }, []);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      await publicApi.post('/api/v1/refresh_token');
      return true;
    } catch { return false; }
  }, []);

  const loadAmigos = useCallback(async () => {
    try {
      const res = await privateApi.get<{ amigos: Amigo[] }>('/api/v1/amigos');
      setAmigos(res.data.amigos);
    } catch { setError('Error fetching amigos.'); }
  }, []);

  const loadMe = useCallback(async () => {
    try {
      const res = await privateApi.get<{ amigo: Amigo }>('/api/v1/me');
      setCurrentUser(res.data.amigo);
    } catch { setCurrentUser(null); }
  }, []);

  const refreshAuth = useCallback(async () => {
    setLoading(true);
    await publicApi.get('/api/v1/csrf').catch(() => {});
    let ok = await verifyToken();
    if (!ok) ok = await refreshToken();
    setIsLoggedIn(ok);
    if (ok) await Promise.all([loadMe(), loadAmigos()]);
    setLoading(false);
  }, [verifyToken, refreshToken, loadMe, loadAmigos]);

  useEffect(() => { refreshAuth(); }, [refreshAuth]);

  useEffect(() => {
    const onAuthChanged = () => { refreshAuth(); };
    document.addEventListener('auth:changed', onAuthChanged as EventListener);
    return () => document.removeEventListener('auth:changed', onAuthChanged as EventListener);
  }, [refreshAuth]);

  const value: AuthState = { isLoggedIn, loading, error, amigos, currentUser, refreshAuth };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Default-exported hook so you can `import useAuth from '@/context/AuthContext'`. */
function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

export default useAuth;

