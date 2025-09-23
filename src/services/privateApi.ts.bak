// src/services/privateApi.ts
import axios, {
  AxiosInstance,
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosHeaders,
} from 'axios';
import publicApi from '@/services/publicApi';
import { ensureCsrfToken, resetCsrfToken } from '@/services/csrf';

let authRequiredHandler: ((notice?: string) => void) | null = null;

/** Called from main.tsx to open the login modal (and optionally show a message). */
export function setAuthRequiredHandler(fn: (notice?: string) => void) {
  authRequiredHandler = fn;
}

/** Utility so any caller (e.g., ProtectedRoute) can open the same modal. */
export function triggerAuthRequired(notice?: string) {
  authRequiredHandler?.(notice);
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'https://localhost:3001';

const privateApi: AxiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

/* ──────────────────────────────────────────────────────────────────────────
   Request: attach CSRF token for mutating methods (POST/PUT/PATCH/DELETE)
   ────────────────────────────────────────────────────────────────────────── */
privateApi.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const method = (config.method ?? 'get').toLowerCase();
  if (['post', 'put', 'patch', 'delete'].includes(method)) {
    const m = document.cookie.match(/(?:^|;\s*)CSRF-TOKEN=([^;]+)/);
    if (m) {
      const token = decodeURIComponent(m[1]);
      const headers = (config.headers ??= new AxiosHeaders(config.headers));
      headers.set('X-CSRF-Token', token);
    }
  }
  return config;
});

/* ──────────────────────────────────────────────────────────────────────────
   Response: on 401 → try ONE silent refresh, then retry; on failure → logout,
   notify UI (modal), and redirect Home.
   ────────────────────────────────────────────────────────────────────────── */
let isRefreshing = false;

privateApi.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const status = error.response?.status;

    // Only handle 401s; don’t loop forever
    if (!original || status !== 401 || original._retry) {
      return Promise.reject(error);
    }
    original._retry = true;

    // One centralized refresh attempt
    try {
      if (!isRefreshing) {
        isRefreshing = true;

        const csrf = await ensureCsrfToken().catch(() => undefined);
        const res = await publicApi.post('/api/v1/refresh_token', undefined, {
          headers: csrf ? { 'X-CSRF-Token': csrf } : undefined,
          withCredentials: true,
          validateStatus: (s) => s === 200 || s === 401,
        });

        isRefreshing = false;

        if (res.status === 200) {
          // Successful refresh → retry original request
          return privateApi.request(original);
        }
      } else {
        // If another tab/request is refreshing, wait briefly and retry
        await new Promise((r) => setTimeout(r, 200));
        return privateApi.request(original);
      }
    } catch {
      isRefreshing = false;
      // fall through to logout path below
    }

    // Refresh failed — clear server cookie (best-effort) and reset CSRF cache
    try {
      const csrf = await ensureCsrfToken().catch(() => undefined);
      await privateApi.delete('/api/v1/logout', {
        headers: csrf ? { 'X-CSRF-Token': csrf } : undefined,
        withCredentials: true,
      });
    } catch {
      // swallow — goal is best-effort cleanup
    } finally {
      resetCsrfToken();
    }

    // Notify UI and redirect Home
    authRequiredHandler?.('Your session expired. Please log in again.');
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      window.history.replaceState(null, '', '/');
    }

    return Promise.reject(error);
  }
);

export default privateApi;
