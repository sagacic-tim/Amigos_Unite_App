// src/ui/Feedback/Toast/ToastContext.tsx

/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ToastItem, ToastPosition, ToastVariant } from "./ToastTypes";

type ToastContextValue = {
  addToast: (
    msg: React.ReactNode,
    opts?: { variant?: ToastVariant; duration?: number }
  ) => string;
  removeToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

type ProviderProps = {
  children: React.ReactNode;
  position?: ToastPosition;
  defaultDuration?: number; // ms
  className?: string;
};

export function ToastProvider({
  children,
  position = "top-right",
  defaultDuration = 4000,
  className,
}: ProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Map<string, number>>(new Map());

  // Remove a toast and clear any outstanding timer
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const t = timers.current.get(id);
    if (t) {
      window.clearTimeout(t);
      timers.current.delete(id);
    }
  }, []);

  // Memoized scheduler so it can be safely used in other hooks
  const scheduleRemove = useCallback(
    (id: string, ms: number) => {
      const t = window.setTimeout(() => removeToast(id), ms);
      timers.current.set(id, t);
    },
    [removeToast]
  );

  const addToast = useCallback(
    (
      message: React.ReactNode,
      opts?: { variant?: ToastVariant; duration?: number }
    ) => {
      const id = crypto.randomUUID();
      const item: ToastItem = {
        id,
        message,
        variant: opts?.variant,
        duration: opts?.duration,
      };

      setToasts((prev) => [item, ...prev]); // newest first (top stack)
      scheduleRemove(id, opts?.duration ?? defaultDuration);
      return id;
    },
    [defaultDuration, scheduleRemove]
  );

  const pause = (id: string) => {
    const t = timers.current.get(id);
    if (t) {
      window.clearTimeout(t);
      timers.current.delete(id);
    }
  };

  const resume = (id: string, ms: number) => {
    scheduleRemove(id, ms);
  };

  const value = useMemo(
    () => ({ addToast, removeToast }),
    [addToast, removeToast]
  );

  const containerClass =
    `toast-container ${className ?? ""} ` +
    (position === "top-right"
      ? "is-top-right"
      : position === "top-left"
      ? "is-top-left"
      : position === "bottom-right"
      ? "is-bottom-right"
      : "is-bottom-left");

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className={containerClass.trim()}
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((t) => {
          const variantClass =
            t.variant === "success"
              ? "-success"
              : t.variant === "error"
              ? "-error"
              : t.variant === "warning"
              ? "-warning"
              : "-info";

          const remaining = t.duration ?? defaultDuration;

          return (
            <div
              key={t.id}
              className={`toast ${variantClass}`}
              onMouseEnter={() => pause(t.id)}
              onMouseLeave={() => resume(t.id, remaining)}
              role="status"
            >
              <p className="toast__content">{t.message}</p>
              <button
                className="toast__close"
                aria-label="Dismiss"
                onClick={() => removeToast(t.id)}
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
