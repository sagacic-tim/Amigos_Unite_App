// src/services/privateApi.ts
import axios, { AxiosInstance, AxiosError, AxiosResponse, InternalAxiosRequestConfig, AxiosHeaders } from 'axios';
import { ensureCsrfToken, resetCsrfToken } from '@/services/csrf';
import { refreshAuthSession } from '@/services/auth';

let authRequiredHandler: ((notice?: string) => void) | null = null;
/** Called from main.tsx to open the login modal (and optionally show a message). */
export function setAuthRequiredHandler(fn: (notice?: string) => void) {
  authRequiredHandler = fn;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'https://localhost:3001';

const privateApi: AxiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    // No need to force Content-Type for GET; Axios sets JSON for bodies automatically.
  },
});

/* ──────────────────────────────────────────────────────────────────────────
   Request: attach CSRF token for mutating methods (your existing behavior)
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
   Response: one-time refresh on 401, then retry; on failure: server-logout,
   open modal, and redirect Home.
   ────────────────────────────────────────────────────────────────────────── */
let isRefreshing = false;

privateApi.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const status = error.response?.status;

    // Handle only 401s, and only once per request
    if (!original || status !== 401 || original._retry) {
      return Promise.reject(error);
    }
    original._retry = true;

    // Try a single, centralized refresh
    try {
      if (!isRefreshing) {
        isRefreshing = true;
        await ensureCsrfToken();             // make sure CSRF header is available
        const ok = await refreshAuthSession();
        isRefreshing = false;
        if (ok) {
          // Retry original request after successful refresh
          return privateApi.request(original);
        }
      } else {
        // If a refresh is already in flight, wait briefly and retry original
        await new Promise((res) => setTimeout(res, 200));
        return privateApi.request(original);
      }
    } catch {
      isRefreshing = false;
      // fall through to logout path
    }

    // Refresh failed — clear server cookies (httpOnly JWT) and local CSRF cache
    try {
      const token = await ensureCsrfToken().catch(() => undefined);
      await privateApi.delete('/api/v1/logout', {
        headers: token ? { 'X-CSRF-Token': token } : undefined,
        withCredentials: true,
      });
    } catch {
      // swallow; goal is best-effort cookie cleanup
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
