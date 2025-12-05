
// src/Root.tsx
import React from "react";
import AppRouter from "@/routes/routes";
import ErrorBoundary from "@/components/ErrorBoundary";
import { AuthProvider } from "@/context/AuthContext";
import { setAuthRequiredHandler } from "@/services/api/privateApi";
import { refreshAuthSession } from "@/services/auth";
import "@/App.scss";

const Root: React.FC = () => {
  const [expiresAt, setExpiresAt] = React.useState<string | undefined>();
  const refreshTimerRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    setAuthRequiredHandler((notice?: string) => {
      document.dispatchEvent(
        new CustomEvent("auth:login", {
          detail: {
            notice: notice ?? "You need to be logged in to view this page.",
          },
        }),
      );
    });
  }, []);

  React.useEffect(() => {
    function onExpires(e: Event) {
      const iso = (e as CustomEvent<string>).detail;
      setExpiresAt(iso);
    }
    window.addEventListener("auth:expires", onExpires as EventListener);
    return () =>
      window.removeEventListener("auth:expires", onExpires as EventListener);
  }, []);

  const schedule = React.useCallback(
    (iso?: string) => {
      if (refreshTimerRef.current) {
        window.clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
      if (!iso) return;

      const skewMs = 5 * 60 * 1000;
      const dueIn = Math.max(
        0,
        new Date(iso).getTime() - Date.now() - skewMs,
      );

      refreshTimerRef.current = window.setTimeout(async () => {
        const ok = await refreshAuthSession();
        if (!ok) {
          if (window.location.pathname !== "/") {
            window.history.replaceState(null, "", "/");
          }
          document.dispatchEvent(
            new CustomEvent("auth:login", {
              detail: {
                notice: "Your session expired. Please log in again.",
              },
            }),
          );
        }
      }, dueIn);
    },
    [],
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

    const events = [
      "mousemove",
      "keydown",
      "click",
      "scroll",
      "visibilitychange",
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
      </ErrorBoundary>
    </AuthProvider>
  );
};

export default Root;
