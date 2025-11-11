// src/context/AuthContext.tsx
import { createContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode, Dispatch, SetStateAction } from 'react';
import privateApi from '@/services/privateApi';
import type { Amigo } from '@/types/AmigoTypes';

export type AuthState = {
  isLoggedIn: boolean;
  loading: boolean;
  error: string | null;
  amigos: Amigo[];
  currentUser: Amigo | null;
  refreshAuth: () => Promise<void>;
  refreshCurrentUser: () => Promise<void>;
  setCurrentUser: Dispatch<SetStateAction<Amigo | null>>;
};

export const AuthContext = createContext<AuthState | undefined>(undefined);

/* ────────────────────────────────────────────────────────────────────────────
   Normalizers so the FE tolerates different backend response shapes
──────────────────────────────────────────────────────────────────────────── */

function normalizeMePayload(data: any): Amigo | null {
  // 1) { data: { amigo: {...} } }
  const fromNested = data?.data?.amigo;
  if (fromNested && typeof fromNested === 'object' && fromNested.id) {
    return fromNested as Amigo;
  }

  // 2) { amigo: {...} }
  const fromKey = data?.amigo;
  if (fromKey && typeof fromKey === 'object' && fromKey.id) {
    return fromKey as Amigo;
  }

  // 3) JSON:API: { data: { id, type, attributes: {...} } }
  const jsonApiData = data?.data;
  if (jsonApiData && typeof jsonApiData === 'object' && 'attributes' in jsonApiData) {
    const item = jsonApiData as any;
    const attrs = item.attributes || {};

    const {
      'avatar-url': avatarDash,
      'phone-1': phone1Dash,
      'phone-2': phone2Dash,
      'created-at': createdAtDash,
      'updated-at': updatedAtDash,
      ...rest
    } = attrs;

    return {
      id: typeof item.id === 'string' ? parseInt(item.id, 10) : item.id,
      ...rest,
      avatar_url: avatarDash ?? attrs.avatar_url ?? null,
      phone_1:    phone1Dash ?? attrs.phone_1    ?? null,
      phone_2:    phone2Dash ?? attrs.phone_2    ?? null,
      created_at: createdAtDash ?? attrs.created_at ?? null,
      updated_at: updatedAtDash ?? attrs.updated_at ?? null,
    } as Amigo;
  }

  // 4) Already an Amigo-shaped object
  if (data && typeof data === 'object' && 'id' in data) {
    return data as Amigo;
  }

  return null;
}

function normalizeAmigosList(data: any): Amigo[] {
  // 1) Already-flat array of amigos
  if (Array.isArray(data)) return data as Amigo[];

  // 2) { amigos: [...] }
  if (Array.isArray(data?.amigos)) return data.amigos as Amigo[];

  // 3) JSON:API style: { data: [ { id, type, attributes: {...} } ] }
  if (!Array.isArray(data?.data)) return [];

  const arr = data.data;

  if (arr.length && typeof arr[0] === 'object' && 'attributes' in arr[0]) {
    return arr.map((item: any) => {
      const attrs = item.attributes || {};

      // Pull off any dashed keys we care about, and keep the rest
      const {
        'avatar-url': avatarDash,
        'phone-1':    phone1Dash,
        'phone-2':    phone2Dash,
        'created-at': createdAtDash,
        'updated-at': updatedAtDash,
        'first-name': firstNameDash,
        'last-name':  lastNameDash,
        'user-name':  userNameDash,
        ...rest
      } = attrs;

      return {
        id: typeof item.id === 'string' ? parseInt(item.id, 10) : item.id,
        ...rest,
        first_name: firstNameDash ?? attrs.first_name ?? null,
        last_name:  lastNameDash  ?? attrs.last_name  ?? null,
        user_name:  userNameDash  ?? attrs.user_name  ?? null,
        avatar_url: avatarDash    ?? attrs.avatar_url ?? null,
        phone_1:    phone1Dash    ?? attrs.phone_1    ?? null,
        phone_2:    phone2Dash    ?? attrs.phone_2    ?? null,
        created_at: createdAtDash ?? attrs.created_at ?? null,
        updated_at: updatedAtDash ?? attrs.updated_at ?? null,
      } as Amigo;
    });
  }

  // Fallback: treat data.data as already normalized
  return arr as Amigo[];
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn]   = useState(false);
  const [loading, setLoading]         = useState(true);
  const [amigos, setAmigos]           = useState<Amigo[]>([]);
  const [currentUser, setCurrentUser] = useState<Amigo | null>(null);
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
          setCurrentUser(me);
          return true;
        }
      }

      setCurrentUser(null);
      return false;
    } catch {
      setCurrentUser(null);
      return false;
    }
  }, []);

  const refreshCurrentUser = useCallback(async () => {
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
      setCurrentUser(null);
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
    currentUser,
    refreshAuth,
    refreshCurrentUser,
    setCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
