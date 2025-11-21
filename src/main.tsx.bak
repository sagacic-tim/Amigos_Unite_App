// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';

import AppRouter from '@/routes/routes';
import ErrorBoundary from '@/components/ErrorBoundary';
import { AuthProvider } from '@/context/AuthContext';

import Login from '@/components/Authentication/Login';
import { setAuthRequiredHandler } from '@/services/privateApi';
import { refreshAuthSession } from '@/services/auth';
import '@/App.scss';

// Correct path: file is actually here
import EventCreateModal from '@/components/modals/EventCreateModal';

function Root() {
  const [loginOpen, setLoginOpen] = React.useState(false);
  const [loginNotice, setLoginNotice] = React.useState<string | undefined>();
  const [expiresAt, setExpiresAt] = React.useState<string | undefined>();
  const refreshTimerRef = React.useRef<number | null>(null);

  const openLoginWith = React.useCallback((msg?: string) => {
    setLoginNotice(msg ?? 'You need to be logged in to view this page.');
    setLoginOpen(true);
  }, []);

  React.useEffect(() => {
    setAuthRequiredHandler((notice?: string) => {
      openLoginWith(notice ?? 'You need to be logged in to view this page.');
    });
  }, [openLoginWith]);

  React.useEffect(() => {
    function onExpires(e: Event) {
      const iso = (e as CustomEvent<string>).detail;
      setExpiresAt(iso);
    }
    window.addEventListener('auth:expires', onExpires as EventListener);
    return () => window.removeEventListener('auth:expires', onExpires as EventListener);
  }, []);

  React.useEffect(() => {
    const onAuthLogin = () => openLoginWith();
    document.addEventListener('auth:login', onAuthLogin as EventListener);
    return () => document.removeEventListener('auth:login', onAuthLogin as EventListener);
  }, [openLoginWith]);

  const schedule = React.useCallback(
    (iso?: string) => {
      if (refreshTimerRef.current) {
        window.clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
      if (!iso) return;

      const skewMs = 5 * 60 * 1000;
      const dueIn = Math.max(0, new Date(iso).getTime() - Date.now() - skewMs);

      refreshTimerRef.current = window.setTimeout(async () => {
        const ok = await refreshAuthSession();
        if (!ok) {
          if (window.location.pathname !== '/') {
            window.history.replaceState(null, '', '/');
          }
          openLoginWith('Your session expired. Please log in again.');
        }
        // On success, refreshAuthSession() will emit a new auth:expires event
      }, dueIn);
    },
    [openLoginWith]
  );

  React.useEffect(() => {
    schedule(expiresAt);
    return () => {
      if (refreshTimerRef.current) {
        window.clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, [expiresAt, schedule]);

  React.useEffect(() => {
    if (!expiresAt) return;

    const handler = () => {
      const expMs = new Date(expiresAt).getTime();
      const tenMin = 10 * 60 * 1000;
      if (expMs - Date.now() < tenMin) {
        schedule(expiresAt);
      }
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'visibilitychange'];
    events.forEach((ev) => window.addEventListener(ev, handler, { passive: true }));
    return () => events.forEach((ev) => window.removeEventListener(ev, handler));
  }, [expiresAt, schedule]);

  return (
    <AuthProvider>
      <ErrorBoundary>
        <AppRouter />

        <Login
          isOpen={loginOpen}
          onClose={() => setLoginOpen(false)}
          onLoginSuccess={() => setLoginOpen(false)}
          notice={loginNotice}
        />

        {/* Modal still mounted at root level */}
        <EventCreateModal />
      </ErrorBoundary>
    </AuthProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
