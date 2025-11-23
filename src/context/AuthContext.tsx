// src/context/AuthContext.tsx
import { createContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode, Dispatch, SetStateAction } from 'react';
import privateApi from '@/services/api/privateApi';
import type { Amigo } from '@/types/AmigoTypes';

export type AuthState = {
  isLoggedIn: boolean;
  loading: boolean;
  error: string | null;
  amigos: Amigo[];
  currentAmigo: Amigo | null;
  refreshAuth: () => Promise<void>;
  refreshCurrentAmigo: () => Promise<void>;
  setCurrentAmigo: Dispatch<SetStateAction<Amigo | null>>;
};


export const AuthContext = createContext<AuthState | undefined>(undefined);

/* ────────────────────────────────────────────────────────────────────────────
   Normalizers so the FE tolerates different backend response shapes
──────────────────────────────────────────────────────────────────────────── */


// src/context/AuthContext.tsx
function normalizeMePayload(data: any): Amigo | null {
  // Current /me shape: { status: {...}, data: { amigo: {...} } }
  const fromNested = data?.data?.amigo;
  if (fromNested && typeof fromNested === 'object') {
    return fromNested as Amigo;
  }

  // Just in case you ever change /me to return { amigo: {...} }
  const fromKey = data?.amigo;
  if (fromKey && typeof fromKey === 'object') {
    return fromKey as Amigo;
  }

  // Fallback: already an amigo-shaped object
  if (data && typeof data === 'object' && 'id' in data) {
    return data as Amigo;
  }

  return null;
}

function normalizeAmigosList(data: any): Amigo[] {
  // If controller ever returns a bare array
  if (Array.isArray(data)) return data as Amigo[];

  // Current /api/v1/amigos shape with AMS + :attributes adapter:
  // { amigos: [ {...}, {...} ] }
  if (Array.isArray(data?.amigos)) return data.amigos as Amigo[];

  // Fallback: if some controller still sends { data: [...] }
  if (Array.isArray(data?.data)) return data.data as Amigo[];

  return [];
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn]   = useState(false);
  const [loading, setLoading]         = useState(true);
  const [amigos, setAmigos]             = useState<Amigo[]>([]);
  const [currentAmigo, setCurrentAmigo] = useState<Amigo | null>(null);
  const [error, setError]             = useState<string | null>(null);

  const loadAmigos = useCallback(async () => {
    try {
      const res = await privateApi.get('/api/v1/amigos', { withCredentials: true });
      setAmigos(normalizeAmigosList(res.data));
    } catch {
      setError('Error fetching amigos.');
      setAmigos([]);
    }
  }, []);


  const loadMe = useCallback(async (): Promise<boolean> => {
    try {
      const res = await privateApi.get('/api/v1/me', {
        withCredentials: true,
        validateStatus: (s) => s === 200 || s === 401,
      });

      if (res.status === 200) {
        const me = normalizeMePayload(res.data);
        if (me?.id) {
          setCurrentAmigo(me);
          return true;
        }
      }

      setCurrentAmigo(null);
      return false;
    } catch {
      setCurrentAmigo(null);
      return false;
    }
  }, []);

  const refreshCurrentAmigo = useCallback(async () => {
    await loadMe();
  }, [loadMe]);

  const refreshAuth = useCallback(async () => {
    setLoading(true);
    setError(null);

    const ok = await loadMe();

    if (ok) {
      setIsLoggedIn(true);
      await loadAmigos();
    } else {
      setIsLoggedIn(false);
      setCurrentAmigo(null);
      setAmigos([]);
    }

    setLoading(false);
  }, [loadMe, loadAmigos]);

  // Initial auth check on app boot
  useEffect(() => {
    void refreshAuth();
  }, [refreshAuth]);

  // Re-check on auth changes (login/logout)
  useEffect(() => {
    const onAuthChanged = () => { void refreshAuth(); };
    document.addEventListener('auth:changed', onAuthChanged as EventListener);
    return () => document.removeEventListener('auth:changed', onAuthChanged as EventListener);
  }, [refreshAuth]);

  const value: AuthState = {
    isLoggedIn,
    loading,
    error,
    amigos,
    currentAmigo,
    refreshAuth,
    refreshCurrentAmigo,
    setCurrentAmigo,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
