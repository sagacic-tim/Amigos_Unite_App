// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';

import AppRouter from '@/routes/routes';
import ErrorBoundary from '@/components/ErrorBoundary';
import { AuthProvider } from '@/context/AuthContext';

import { setAuthRequiredHandler } from '@/services/api/privateApi';
import { refreshAuthSession } from '@/services/auth';
import '@/App.scss';

// Correct path: file is actually here
import EventCreateModal from '@/components/modals/EventCreateModal';

function Root() {
  const [expiresAt, setExpiresAt] = React.useState<string | undefined>();
  const refreshTimerRef = React.useRef<number | null>(null);

  // When the API interceptor gets a 401 that requires login,
  // just emit an auth:login event. AuthModalsHost in AppLayout
  // is responsible for showing the Login modal.
  React.useEffect(() => {
    setAuthRequiredHandler((notice?: string) => {
      document.dispatchEvent(
        new CustomEvent('auth:login', {
          detail: {
            notice:
              notice ?? 'You need to be logged in to view this page.',
          },
        }),
      );
    });
  }, []);

  // Listen for new JWT expiry announcements from auth service
  React.useEffect(() => {
    function onExpires(e: Event) {
      const iso = (e as CustomEvent<string>).detail;
      setExpiresAt(iso);
    }
    window.addEventListener(
      'auth:expires',
      onExpires as EventListener,
    );
    return () =>
      window.removeEventListener(
        'auth:expires',
        onExpires as EventListener,
      );
  }, []);

  // Helper: schedule a proactive refresh ~5 minutes before expiry
  const schedule = React.useCallback(
    (iso?: string) => {
      if (refreshTimerRef.current) {
        window.clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
      if (!iso) return;

      const skewMs = 5 * 60 * 1000; // 5 minutes early
      const dueIn = Math.max(
        0,
        new Date(iso).getTime() - Date.now() - skewMs,
      );

      refreshTimerRef.current = window.setTimeout(async () => {
        const ok = await refreshAuthSession();

        if (!ok) {
          // Align with previous behaviour: send user Home
          if (window.location.pathname !== '/') {
            window.history.replaceState(null, '', '/');
          }
          // And ask for login via the central auth:login flow
          document.dispatchEvent(
            new CustomEvent('auth:login', {
              detail: {
                notice: 'Your session expired. Please log in again.',
              },
            }),
          );
        }
        // On success, refreshAuthSession() will emit a new auth:expires event
      }, dueIn);
    },
    [],
  );

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

  // Reset schedule on user activity when we’re close to expiry
  React.useEffect(() => {
    if (!expiresAt) return;

    const handler = () => {
      const expMs = new Date(expiresAt).getTime();
      const tenMin = 10 * 60 * 1000;
      if (expMs - Date.now() < tenMin) {
        schedule(expiresAt);
      }
    };

    const events = [
      'mousemove',
      'keydown',
      'click',
      'scroll',
      'visibilitychange',
    ];
    events.forEach((ev) =>
      window.addEventListener(ev, handler, { passive: true }),
    );
    return () =>
      events.forEach((ev) => window.removeEventListener(ev, handler));
  }, [expiresAt, schedule]);

  return (
    <AuthProvider>
      <ErrorBoundary>
        <AppRouter />
        {/* Only global event-creation modal lives here now */}
        <EventCreateModal />
      </ErrorBoundary>
    </AuthProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
