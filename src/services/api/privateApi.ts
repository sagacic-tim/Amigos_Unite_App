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

/**
 * Resolve API base per environment.
 *
 * - Dev: default to https://localhost:3001 (unless VITE_API_BASE_URL provided)
 * - Prod: default to same-origin (""), so requests go to https://amigosunite.org/api/...
 *
 * This prevents the classic "localhost in production" failure mode.
 */
function resolveApiBase(): string {
  const envBase = (import.meta.env.VITE_API_BASE_URL ?? "").trim();

  if (envBase) return envBase.replace(/\/+$/, "");

  // IMPORTANT: in production, use same-origin to avoid CORS entirely (Option A).
  if (import.meta.env.PROD) return "";

  // Dev fallback
  return "https://localhost:3001";
}

const API_BASE = resolveApiBase();

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
  [key: string]: unknown;
};

type PrivateAxiosHeaders = AxiosHeaders & {
  common?: CommonAuthHeaders;
};

function getMutableDefaultHeaders(): PrivateAxiosHeaders {
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
              void 0;
            }
          }

          return privateApi.request(original);
        }
      } else {
        await new Promise((resolve) => setTimeout(resolve, 200));
        return privateApi.request(original);
      }
    } catch {
      isRefreshing = false;
    }

    try {
      const mutable = getMutableDefaultHeaders();
      if (mutable.common && "Authorization" in mutable.common) {
        delete mutable.common.Authorization;
      }
    } catch {
      void 0;
    }

    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("authToken");
      }
    } catch {
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
