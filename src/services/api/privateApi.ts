// src/services/api/privateApi.ts
import axios, {
  AxiosInstance,
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosHeaders,
} from "axios";
import publicApi from "@/services/api/publicApi";
import { ensureCsrfToken, resetCsrfToken } from "@/services/csrf";

/**
 * Extended error type so callers can detect auth-related failures.
 */
export interface AuthAxiosError extends AxiosError {
  isAuthRequired?: boolean;
}

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
const RAW_BASE =
  import.meta.env.VITE_API_BASE_URL ?? "https://localhost:3001";
const API_BASE = RAW_BASE.replace(/\/+$/, "");

const privateApi: AxiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Helpers for mutating default headers safely (no `any`)
// ─────────────────────────────────────────────────────────────────────────────

type CommonAuthHeaders = {
  Authorization?: string;
  // Allow other dynamic keys
  [key: string]: unknown;
};

type PrivateAxiosHeaders = AxiosHeaders & {
  common?: CommonAuthHeaders;
};

function getMutableDefaultHeaders(): PrivateAxiosHeaders {
  // Axios' typing here is loose; we safely re-interpret as our extended type.
  return privateApi.defaults.headers as unknown as PrivateAxiosHeaders;
}

// ─────────────────────────────────────────────────────────────────────────────
// Bootstrap: hydrate Authorization from localStorage (optional)
// ─────────────────────────────────────────────────────────────────────────────

try {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("authToken");
    if (stored) {
      const headers = getMutableDefaultHeaders();
      headers.common = {
        ...(headers.common ?? {}),
        Authorization: stored,
      };
    }
  }
} catch {
  // ignore storage access errors (private mode, etc.)
  void 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// Request: attach CSRF token on mutations
// ─────────────────────────────────────────────────────────────────────────────

privateApi.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const method = (config.method ?? "get").toLowerCase();
  if (["post", "put", "patch", "delete"].includes(method)) {
    const m = document.cookie.match(/(?:^|;\s*)CSRF-TOKEN=([^;]+)/);
    if (m) {
      const token = decodeURIComponent(m[1]);
      const headers = (config.headers ??= new AxiosHeaders(config.headers));
      headers.set("X-CSRF-Token", token);
    }
  }
  return config;
});

/** Auth-related endpoints where we *must not* try to auto-refresh on 401. */
const AUTH_ENDPOINTS = [
  "/api/v1/login",
  "/api/v1/logout",
  "/api/v1/refresh_token",
  "/api/v1/verify_token",
  "/api/v1/csrf",
];

function isAuthEndpoint(url?: string) {
  if (!url) return false;
  return AUTH_ENDPOINTS.some((p) => url.includes(p));
}

// ─────────────────────────────────────────────────────────────────────────────
// Response: central 401 handling with one refresh + retry
// ─────────────────────────────────────────────────────────────────────────────

let isRefreshing = false;
let lastAuthModalAt = 0;

type RefreshResponseBody = {
  token?: string;
};

type AuthHeaderCandidate = {
  authorization?: string;
  Authorization?: string;
  [key: string]: unknown;
};

function extractAuthToken(
  res: AxiosResponse<RefreshResponseBody>
): string | undefined {
  const headers = res.headers as AuthHeaderCandidate;

  const headerValue =
    typeof headers.authorization === "string"
      ? headers.authorization
      : typeof headers.Authorization === "string"
      ? headers.Authorization
      : undefined;

  if (headerValue) return headerValue;

  const token = res.data?.token;
  if (typeof token === "string") return token;

  return undefined;
}

privateApi.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (error: AxiosError) => {
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

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
        if (csrf) headers.set("X-CSRF-Token", csrf);

        const defaultsHeaders = getMutableDefaultHeaders();
        const currentAuth = defaultsHeaders.common?.Authorization;

        if (currentAuth) {
          headers.set("Authorization", currentAuth);
        }

        const res = await publicApi.post<RefreshResponseBody>(
          "/api/v1/refresh_token",
          undefined,
          {
            headers,
            withCredentials: true,
            validateStatus: (s) => s === 200 || s === 401,
          }
        );

        isRefreshing = false;

        if (res.status === 200) {
          const rawToken = extractAuthToken(res);

          if (rawToken) {
            const value = rawToken.startsWith("Bearer")
              ? rawToken
              : `Bearer ${rawToken}`;

            const mutable = getMutableDefaultHeaders();
            mutable.common = {
              ...(mutable.common ?? {}),
              Authorization: value,
            };

            try {
              if (typeof window !== "undefined") {
                localStorage.setItem("authToken", value);
              }
            } catch {
              // ignore storage write errors
              void 0;
            }
          }

          // retry original request with refreshed credentials
          return privateApi.request(original);
        }
      } else {
        // if another request is already refreshing, wait briefly and retry
        await new Promise((resolve) => setTimeout(resolve, 200));
        return privateApi.request(original);
      }
    } catch {
      // refresh flow failed; fall through to forcing re-login
      isRefreshing = false;
    }

    // Refresh failed → clear local auth hints and force re-login
    try {
      const mutable = getMutableDefaultHeaders();
      if (mutable.common && "Authorization" in mutable.common) {
        delete mutable.common.Authorization;
      }
    } catch {
      // ignore header cleanup errors
      void 0;
    }

    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("authToken");
      }
    } catch {
      // ignore storage cleanup errors
      void 0;
    }

    resetCsrfToken();

    const authError = error as AuthAxiosError;
    authError.isAuthRequired = true;

    const now = Date.now();
    if (now - lastAuthModalAt > 1000) {
      lastAuthModalAt = now;
      triggerAuthRequired("Your session expired. Please log in to continue.");
    }

    return Promise.reject(authError);
  }
);

export default privateApi;
