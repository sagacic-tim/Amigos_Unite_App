// src/context/AuthContext.tsx
import { useEffect, useState, useCallback } from "react";
import type { ReactNode } from "react";
import privateApi from "@/services/api/privateApi";
import type { Amigo } from "@/types/amigos/AmigoTypes";
import { AuthContext, type AuthState } from "./auth-context";

// ─────────────────────────────────────────────────────────────────────────────
// Normalizers: tolerate different backend response shapes without `any`
// ─────────────────────────────────────────────────────────────────────────────

type MeResponseShape =
  | { data?: { amigo?: Amigo } }
  | { amigo?: Amigo }
  | Amigo
  | null
  | undefined;

type AmigosListResponseShape =
  | Amigo[]
  | { amigos?: Amigo[] }
  | { data?: Amigo[] }
  | null
  | undefined;

function normalizeMePayload(data: MeResponseShape): Amigo | null {
  const nested = (data as { data?: { amigo?: Amigo } })?.data?.amigo;
  if (nested && typeof nested === "object") {
    return nested;
  }

  const fromKey = (data as { amigo?: Amigo })?.amigo;
  if (fromKey && typeof fromKey === "object") {
    return fromKey;
  }

  if (data && typeof data === "object" && "id" in data) {
    return data as Amigo;
  }

  return null;
}

function normalizeAmigosList(data: AmigosListResponseShape): Amigo[] {
  if (Array.isArray(data)) return data;

  if (data && typeof data === "object") {
    const withAmigos = data as { amigos?: Amigo[] };
    if (Array.isArray(withAmigos.amigos)) return withAmigos.amigos;

    const withData = data as { data?: Amigo[] };
    if (Array.isArray(withData.data)) return withData.data;
  }

  return [];
}

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [amigos, setAmigos] = useState<Amigo[]>([]);
  const [currentAmigo, setCurrentAmigo] = useState<Amigo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadAmigos = useCallback(async () => {
    try {
      const res = await privateApi.get("/api/v1/amigos", {
        withCredentials: true,
      });
      setAmigos(normalizeAmigosList(res.data));
    } catch {
      setError("Error fetching amigos.");
      setAmigos([]);
    }
  }, []);

  const loadMe = useCallback(async (): Promise<boolean> => {
    try {
      const res = await privateApi.get("/api/v1/me", {
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
    const onAuthChanged = () => {
      void refreshAuth();
    };

    document.addEventListener(
      "auth:changed",
      onAuthChanged as EventListener
    );
    return () =>
      document.removeEventListener(
        "auth:changed",
        onAuthChanged as EventListener
      );
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
