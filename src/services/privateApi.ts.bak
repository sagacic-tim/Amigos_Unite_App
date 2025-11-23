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
let authModalOpen = false;

/** Called from main.tsx to open the login modal (and optionally show a message). */
export function setAuthRequiredHandler(fn: (notice?: string) => void) {
  authRequiredHandler = fn;
}

/** Utility so any caller (e.g., ProtectedRoute) can open the same modal. */
export function triggerAuthRequired(notice?: string) {
  if (authModalOpen) return;
  authModalOpen = true;
  authRequiredHandler?.(notice);
}

export function resetAuthModalOpen() {
  authModalOpen = false;
}

// IMPORTANT: this should be just the origin, e.g. "https://localhost:3001"
const RAW_BASE = import.meta.env.VITE_API_BASE_URL ?? 'https://localhost:3001';
const API_BASE = RAW_BASE.replace(/\/+$/, '');

const privateApi: AxiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

/* Bootstrap: hydrate Authorization from localStorage (optional, not required for cookie auth) */
try {
  const stored = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  if (stored) {
    (privateApi.defaults.headers as any).common = {
      ...(privateApi.defaults.headers as any).common,
      Authorization: stored,
    };
  }
} catch {
  // ignore storage access errors
}

/* Request: attach CSRF token on mutations */
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

/** Auth-related endpoints where we *must not* try to auto-refresh on 401. */
const AUTH_ENDPOINTS = [
  '/api/v1/login',
  '/api/v1/logout',
  '/api/v1/refresh_token',
  '/api/v1/verify_token',
  '/api/v1/csrf',
];

function isAuthEndpoint(url?: string) {
  if (!url) return false;
  return AUTH_ENDPOINTS.some((p) => url.includes(p));
}

/* Response: central 401 handling with one refresh + retry */
let isRefreshing = false;
let lastAuthModalAt = 0;

privateApi.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const status = error.response?.status;
    const url = original?.url;

    // Don’t try to refresh on:
    // - no config
    // - not 401
    // - already retried
    // - auth endpoints themselves (login/logout/refresh/verify/csrf)
    if (!original || status !== 401 || original._retry || isAuthEndpoint(url)) {
      return Promise.reject(error);
    }
    original._retry = true;

    try {
      if (!isRefreshing) {
        isRefreshing = true;

        const csrf = await ensureCsrfToken().catch(() => undefined);
        const headers = new AxiosHeaders();
        if (csrf) headers.set('X-CSRF-Token', csrf);

        const currentAuth =
          (privateApi.defaults.headers as any)?.common?.Authorization as string | undefined;
        if (currentAuth) headers.set('Authorization', currentAuth);

        const res = await publicApi.post('/api/v1/refresh_token', undefined, {
          headers,
          withCredentials: true,
          validateStatus: (s) => s === 200 || s === 401,
        });

        isRefreshing = false;

        if (res.status === 200) {
          const hdr =
            (res.headers as any)?.authorization ||
            (res.headers as any)?.Authorization ||
            (res.data as any)?.token;

          if (hdr && typeof hdr === 'string') {
            const value = hdr.startsWith('Bearer') ? hdr : `Bearer ${hdr}`;
            (privateApi.defaults.headers as any).common = {
              ...(privateApi.defaults.headers as any).common,
              Authorization: value,
            };
            try {
              localStorage.setItem('authToken', value);
            } catch {
              /* ignore */
            }
          }

          return privateApi.request(original);
        }
      } else {
        // if another request is already refreshing, wait briefly and retry
        await new Promise((r) => setTimeout(r, 200));
        return privateApi.request(original);
      }
    } catch {
      isRefreshing = false;
    }

    // Refresh failed → clear local auth hints and force re-login
    try {
      delete (privateApi.defaults.headers as any)?.common?.Authorization;
    } catch {}
    try {
      localStorage.removeItem('authToken');
    } catch {}
    resetCsrfToken();

    (error as any).isAuthRequired = true;

    const now = Date.now();
    if (now - lastAuthModalAt > 1000) {
      lastAuthModalAt = now;
      triggerAuthRequired('Your session expired. Please log in to continue.');
    }

    return Promise.reject(error);
  }
);

export default privateApi;
