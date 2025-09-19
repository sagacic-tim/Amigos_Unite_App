// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';

import AppRouter from '@/routes/routes';
import ErrorBoundary from '@/components/ErrorBoundary';
import { AuthProvider } from '@/context/AuthContext';

import Login from '@/components/Authentication/Login';
import { setAuthRequiredHandler } from '@/services/privateApi';
import { refreshAuthSession } from '@/services/auth'; // ← use the existing service
import '@/App.scss';

function Root() {
  const [loginOpen, setLoginOpen] = React.useState(false);
  const [loginNotice, setLoginNotice] = React.useState<string | undefined>();
  const [expiresAt, setExpiresAt] = React.useState<string | undefined>();
  const refreshTimerRef = React.useRef<number | null>(null);

  // Centralized way to open the modal with a message
  const openLoginWith = React.useCallback((msg?: string) => {
    setLoginNotice(msg ?? 'You need to be logged in to view this page.');
    setLoginOpen(true);
  }, []);

  React.useEffect(() => {
    // Used by the 401 interceptor
    setAuthRequiredHandler((notice?: string) => {
      openLoginWith(notice ?? 'You need to be logged in to view this page.');
    });
  }, [openLoginWith]);

  // Listen for jwt expiry announcements from auth service
  React.useEffect(() => {
    function onExpires(e: Event) {
      const iso = (e as CustomEvent<string>).detail;
      setExpiresAt(iso);
    }
    window.addEventListener('auth:expires', onExpires as EventListener);
    return () => window.removeEventListener('auth:expires', onExpires as EventListener);
  }, []);

  // Helper: schedule a proactive refresh ~5 minutes before expiry
  const schedule = React.useCallback((iso?: string) => {
    // clear prior timer
    if (refreshTimerRef.current) {
      window.clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
    if (!iso) return;

    const skewMs = 5 * 60 * 1000; // 5 minutes early
    const dueIn = Math.max(0, new Date(iso).getTime() - Date.now() - skewMs);

    refreshTimerRef.current = window.setTimeout(async () => {
      const ok = await refreshAuthSession();
      if (!ok) {
        // Align behavior with your 401 flow: send user Home and open Login
        if (window.location.pathname !== '/') {
          window.history.replaceState(null, '', '/');
        }
        openLoginWith('Your session expired. Please log in again.');
      }
      // On success, refreshAuthSession() will emit a new auth:expires and reschedule itself
    }, dueIn);
  }, [openLoginWith]);

  // When expiresAt changes, (re)schedule proactive refresh
  React.useEffect(() => {
    schedule(expiresAt);
    return () => {
      if (refreshTimerRef.current) {
        window.clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, [expiresAt, schedule]);

  // Reset schedule on user activity when we are close to expiry
  React.useEffect(() => {
    if (!expiresAt) return;

    const handler = () => {
      const expMs = new Date(expiresAt).getTime();
      const tenMin = 10 * 60 * 1000;
      if (expMs - Date.now() < tenMin) {
        // Pull refresh forward if we’re within 10m of expiry
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
      </ErrorBoundary>
    </AuthProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
