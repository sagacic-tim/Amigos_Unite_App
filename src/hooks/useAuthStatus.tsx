// src/hooks/useAuthStatus.ts
import { useEffect, useState } from 'react';
import publicApi from '@/services/publicApi';
import { verifyCurrentAmigo, refreshAuthSession } from '@/services/auth';
import type { Amigo } from '@/types/AmigoTypes';

type AuthStatus = {
  isLoggedIn: boolean;
  amigo: Amigo | null;
  checking: boolean;
};

export default function useAuthStatus(): AuthStatus {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [amigo, setAmigo]           = useState<Amigo | null>(null);
  const [checking, setChecking]     = useState(true);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setChecking(true);

      // Prime CSRF cookie (harmless if already present)
      await publicApi.get('/api/v1/csrf').catch(() => {});

      let me = await verifyCurrentAmigo(); // null on 401
      if (!me) {
        // Try to refresh and verify again
        const refreshed = await refreshAuthSession();
        if (refreshed) me = await verifyCurrentAmigo();
      }

      if (cancelled) return;
      setAmigo(me);
      setIsLoggedIn(!!me);
      setChecking(false);
    };

    run();

    // React to auth events from Login/Signup/Logout flows
    const onChanged = () => run();
    document.addEventListener('auth:changed', onChanged as EventListener);

    return () => {
      cancelled = true;
      document.removeEventListener('auth:changed', onChanged as EventListener);
    };
  }, []);

  return { isLoggedIn, amigo, checking };
}
