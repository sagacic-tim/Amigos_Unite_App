// src/context/AuthContext.tsx
import { createContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import publicApi from '@/services/publicApi';
import privateApi from '@/services/privateApi';
import type { Amigo } from '@/types/AmigoTypes';

export type AuthState = {
  isLoggedIn: boolean;
  loading: boolean;
  error: string | null;
  amigos: Amigo[];
  currentUser: Amigo | null;
  refreshAuth: () => Promise<void>;
};

export const AuthContext = createContext<AuthState | undefined>(undefined);

/* ────────────────────────────────────────────────────────────────────────────
   Normalizers so the FE tolerates different backend response shapes
──────────────────────────────────────────────────────────────────────────── */
function normalizeMePayload(data: any): Amigo | null {
  const fromNested = data?.data?.amigo;
  if (fromNested && typeof fromNested === 'object' && fromNested.id) return fromNested;

  const fromKey = data?.amigo;
  if (fromKey && typeof fromKey === 'object' && fromKey.id) return fromKey;

  if (data && typeof data === 'object' && 'id' in data) return data as Amigo;

  return null;
}

function normalizeAmigosList(data: any): Amigo[] {
  if (Array.isArray(data)) return data as Amigo[];
  if (Array.isArray(data?.amigos)) return data.amigos as Amigo[];
  if (Array.isArray(data?.data)) return data.data as Amigo[];
  return [];
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn]   = useState(false);
  const [loading, setLoading]         = useState(true);
  const [amigos, setAmigos]           = useState<Amigo[]>([]);
  const [currentUser, setCurrentUser] = useState<Amigo | null>(null);
  const [error, setError]             = useState<string | null>(null);

  const ensureCsrf = useCallback(async () => {
    try { await publicApi.get('/api/v1/csrf'); } catch {}
  }, []);

  const verifyToken = useCallback(async (): Promise<boolean> => {
    try {
      const res = await publicApi.get<{ valid: boolean }>('/api/v1/verify_token');
      return !!res.data?.valid;
    } catch { return false; }
  }, []);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const res = await publicApi.post('/api/v1/refresh_token');
      return res.status === 200;
    } catch { return false; }
  }, []);

  const loadAmigos = useCallback(async () => {
    try {
      const res = await privateApi.get('/api/v1/amigos', { withCredentials: true });
      setAmigos(normalizeAmigosList(res.data));
    } catch {
      setError('Error fetching amigos.');
      setAmigos([]);
    }
  }, []);

  const loadMe = useCallback(async () => {
    try {
      const res = await privateApi.get('/api/v1/me', { withCredentials: true });
      const me = normalizeMePayload(res.data);
      if (me?.id) {
        setCurrentUser(me);
        return true;
      }
      setCurrentUser(null);
      return false;
    } catch {
      setCurrentUser(null);
      return false;
    }
  }, []);

  const refreshAuth = useCallback(async () => {
    setLoading(true);
    setError(null);

    await ensureCsrf();

    let ok = await verifyToken();
    if (!ok) {
      ok = await refreshToken();
      if (ok) ok = await verifyToken();
    }

    setIsLoggedIn(ok);

    if (ok) {
      const meOk = await loadMe();
      await loadAmigos();
      if (!meOk) setIsLoggedIn(false);
    } else {
      setCurrentUser(null);
      setAmigos([]);
    }

    setLoading(false);
  }, [ensureCsrf, verifyToken, refreshToken, loadMe, loadAmigos]);

  useEffect(() => { void refreshAuth(); }, [refreshAuth]);

  useEffect(() => {
    const onAuthChanged = () => { void refreshAuth(); };
    document.addEventListener('auth:changed', onAuthChanged as EventListener);
    return () => document.removeEventListener('auth:changed', onAuthChanged as EventListener);
  }, [refreshAuth]);

  const value: AuthState = { isLoggedIn, loading, error, amigos, currentUser, refreshAuth };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// NOTE: no default export here; no hook defined here.
