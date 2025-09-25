# Frontend Profile Auth Snapshot


---
## src/pages/Profile/index.tsx

// src/pages/Profile/index.tsx
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '@/context/AuthContext';
import privateApi, { triggerAuthRequired } from '@/services/privateApi';
import styles from './Profile.module.scss';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
type AmigoDetailsPayload = {
  date_of_birth?: string | null;
  member_in_good_standing?: boolean;
  available_to_host?: boolean;
  willing_to_help?: boolean;
  willing_to_donate?: boolean;
  personal_bio?: string | null;
};

type AmigoLocationPayload = {
  id?: number; // optional: new/unsaved location has no id yet
  address?: string | null; // view-only (composed)
  street_number?: string | null;
  street_name?: string | null;
  floor?: string | null;
  room_no?: string | null;
  apartment_suite_number?: string | null;
  city_sublocality?: string | null;
  city?: string | null;
  state_province_subdivision?: string | null;
  state_province?: string | null;
  state_province_short?: string | null;
  country?: string | null;
  country_short?: string | null;
  postal_code?: string | null;
  postal_code_suffix?: string | null;
  post_box?: string | null;

  latitude?: number | null;
  longitude?: number | null;
  time_zone?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

// ─────────────────────────────────────────────────────────────────────────────
// Reference data (extend as needed)
// ─────────────────────────────────────────────────────────────────────────────
const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  // TODO: add more as needed
];

const US_STATES = [
  { short: 'AL', long: 'Alabama' }, { short: 'AK', long: 'Alaska' },
  { short: 'AZ', long: 'Arizona' }, { short: 'AR', long: 'Arkansas' },
  { short: 'CA', long: 'California' }, { short: 'CO', long: 'Colorado' },
  { short: 'CT', long: 'Connecticut' }, { short: 'DE', long: 'Delaware' },
  { short: 'FL', long: 'Florida' }, { short: 'GA', long: 'Georgia' },
  { short: 'HI', long: 'Hawaii' }, { short: 'ID', long: 'Idaho' },
  { short: 'IL', long: 'Illinois' }, { short: 'IN', long: 'Indiana' },
  { short: 'IA', long: 'Iowa' }, { short: 'KS', long: 'Kansas' },
  { short: 'KY', long: 'Kentucky' }, { short: 'LA', long: 'Louisiana' },
  { short: 'ME', long: 'Maine' }, { short: 'MD', long: 'Maryland' },
  { short: 'MA', long: 'Massachusetts' }, { short: 'MI', long: 'Michigan' },
  { short: 'MN', long: 'Minnesota' }, { short: 'MS', long: 'Mississippi' },
  { short: 'MO', long: 'Missouri' }, { short: 'MT', long: 'Montana' },
  { short: 'NE', long: 'Nebraska' }, { short: 'NV', long: 'Nevada' },
  { short: 'NH', long: 'New Hampshire' }, { short: 'NJ', long: 'New Jersey' },
  { short: 'NM', long: 'New Mexico' }, { short: 'NY', long: 'New York' },
  { short: 'NC', long: 'North Carolina' }, { short: 'ND', long: 'North Dakota' },
  { short: 'OH', long: 'Ohio' }, { short: 'OK', long: 'Oklahoma' },
  { short: 'OR', long: 'Oregon' }, { short: 'PA', long: 'Pennsylvania' },
  { short: 'RI', long: 'Rhode Island' }, { short: 'SC', long: 'South Carolina' },
  { short: 'SD', long: 'South Dakota' }, { short: 'TN', long: 'Tennessee' },
  { short: 'TX', long: 'Texas' }, { short: 'UT', long: 'Utah' },
  { short: 'VT', long: 'Vermont' }, { short: 'VA', long: 'Virginia' },
  { short: 'WA', long: 'Washington' }, { short: 'WV', long: 'West Virginia' },
  { short: 'WI', long: 'Wisconsin' }, { short: 'WY', long: 'Wyoming' },
];

const CA_PROVINCES = [
  { short: 'AB', long: 'Alberta' }, { short: 'BC', long: 'British Columbia' },
  { short: 'MB', long: 'Manitoba' }, { short: 'NB', long: 'New Brunswick' },
  { short: 'NL', long: 'Newfoundland and Labrador' }, { short: 'NS', long: 'Nova Scotia' },
  { short: 'NT', long: 'Northwest Territories' }, { short: 'NU', long: 'Nunavut' },
  { short: 'ON', long: 'Ontario' }, { short: 'PE', long: 'Prince Edward Island' },
  { short: 'QC', long: 'Quebec' }, { short: 'SK', long: 'Saskatchewan' },
  { short: 'YT', long: 'Yukon' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function composeAddress(loc: Partial<AmigoLocationPayload>): string {
  const parts = [
    [loc.street_number, loc.street_name].filter(Boolean).join(' '),
    loc.apartment_suite_number,
    loc.floor ? `Floor ${loc.floor}` : '',
    loc.room_no ? `Room ${loc.room_no}` : '',
    loc.city_sublocality,
    loc.city,
    [loc.state_province_short || loc.state_province, loc.postal_code].filter(Boolean).join(' '),
    loc.country,
  ].filter(Boolean);
  return parts.join(', ');
}

// ─────────────────────────────────────────────────────────────────────────────
export default function Profile() {
  const { isLoggedIn, currentUser } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<AmigoDetailsPayload>({});
  const [location, setLocation] = useState<AmigoLocationPayload | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const amigoId = currentUser?.id;

  const regionOptions = useMemo(() => {
    return {
      US: US_STATES,
      CA: CA_PROVINCES,
    } as Record<string, { short: string; long: string }[]>;
  }, []);

  const loadAll = useCallback(async () => {
    if (!amigoId) return;
    setLoading(true);
    setError(null);
    setSaved(false);

    try {
      // Details
      const d = await privateApi.get(`/api/v1/amigos/${amigoId}/amigo_detail`, { withCredentials: true });
      setDetails(d?.data ?? {});
    } catch {
      setDetails({});
    }

    try {
      // Locations (only keep the first one)
      const l = await privateApi.get(`/api/v1/amigos/${amigoId}/amigo_locations`, { withCredentials: true });
      const list = Array.isArray(l?.data) ? l.data : (l?.data?.data ?? []);
      setLocation(list?.[0] ?? null);
    } catch {
      setLocation(null);
    }

    setLoading(false);
  }, [amigoId]);

  // Auth guard
  useEffect(() => {
    if (!isLoggedIn) {
      triggerAuthRequired('Please log in to view this page.');
      navigate('/', { replace: true });
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    if (isLoggedIn && amigoId) {
      loadAll();
    } else if (isLoggedIn && !amigoId) {
      setLoading(false);
    }
  }, [isLoggedIn, amigoId, loadAll]);

  if (!isLoggedIn) return null;

  if (isLoggedIn && !amigoId) {
    return (
      <section className="section-content">
        <h1 className="page-title">Profile</h1>
        <p>Loading your profile…</p>
      </section>
    );
  }

  // ── Handlers: Details & Location ───────────────────────────────────────────
  const handleDetailsChange = (field: keyof AmigoDetailsPayload, value: any) => {
    setDetails((prev) => ({ ...(prev ?? {}), [field]: value }));
  };

  const handleLocationChange = (field: keyof AmigoLocationPayload, value: any) => {
    setLocation((prev) => ({ ...(prev ?? {}), [field]: value } as AmigoLocationPayload));
  };

  // Single save for both Details and Location
  const saveAll = async () => {
    if (!amigoId) return;
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      // Save Details (PATCH; if 404 then POST)
      await privateApi
        .patch(`/api/v1/amigos/${amigoId}/amigo_detail`, { amigo_detail: details }, { withCredentials: true })
        .catch(async (err) => {
          if (err?.response?.status === 404) {
            await privateApi.post(`/api/v1/amigos/${amigoId}/amigo_detail`, { amigo_detail: details }, { withCredentials: true });
          } else {
            throw err;
          }
        });

      // Save Location (only one allowed)
      if (location) {
        if (location.id) {
          await privateApi.patch(
            `/api/v1/amigos/${amigoId}/amigo_locations/${location.id}`,
            { amigo_location: location },
            { withCredentials: true }
          );
        } else {
          // Create new location
          await privateApi.post(
            `/api/v1/amigos/${amigoId}/amigo_locations`,
            { amigo_location: location },
            { withCredentials: true }
          );
        }
      } else {
        // If absolutely nothing is provided, no-op. (Optional: create an empty shell)
      }

      // Refresh to display server-populated fields (lat/lng/time_zone/timestamps)
      await loadAll();
      setSaved(true);
    } catch (e: any) {
      setError(e?.response?.data?.errors?.[0] ?? 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const countryCode = (location?.country_short || '').toUpperCase();
  const regions = regionOptions[countryCode] ?? [];
  const address = location ? (location.address || composeAddress(location)) : '';

  return (
    <section className={`section-content ${styles.page}`}>
      <h1 className={`page-title ${styles.header}`}>Amigo Profile</h1>

      {error && <p className="form-error">{error}</p>}
      {saved && <p className="form-success">Saved!</p>}

      {loading ? (
        <p>Loading…</p>
      ) : (
        <>
          {/* ───────────────── Amigo Details ───────────────── */}
          <div className="card card--details">
            <h2>Amigo Details</h2>

            <div className="form-grid">
              <fieldset>
                <label>
                  <span>Date of Birth</span>
                  <input
                    type="date"
                    value={details?.date_of_birth ?? ''}
                    onChange={(e) => handleDetailsChange('date_of_birth', e.target.value || null)}
                  />
                </label>

                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={!!details?.member_in_good_standing}
                    onChange={(e) => handleDetailsChange('member_in_good_standing', e.target.checked)}
                  />
                  <span>Member in good standing</span>
                </label>

                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={!!details?.available_to_host}
                    onChange={(e) => handleDetailsChange('available_to_host', e.target.checked)}
                  />
                  <span>Available to host</span>
                </label>

                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={!!details?.willing_to_help}
                    onChange={(e) => handleDetailsChange('willing_to_help', e.target.checked)}
                  />
                  <span>Willing to help</span>
                </label>

                <label className="checkbox">
                  <input

---
## src/routes/routes.tsx

// src/routes/routes.tsx
import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import AppLayout from '@/layouts/AppLayout';
import RequireAuth from './RequireAuth';

const Home   = lazy(() => import('@pages/Home'));
const Amigos = lazy(() => import('@pages/Amigos'));
const Events = lazy(() => import('@pages/Events'));
const About  = lazy(() => import('@pages/About'));
const Contact= lazy(() => import('@pages/Contact'));
const Profile= lazy(() => import('@pages/Profile'));
const NotFound = lazy(() => import('@pages/NotFound'));
const EventAmigoConnectors = lazy(() => import('@pages/EventAmigoConnectors'));

const withSuspense = (el: JSX.Element) => (
  <Suspense fallback={<div>Loading…</div>}>{el}</Suspense>
);

const RouteError: React.FC = () => (
  <div className="container content-section">Something went wrong.</div>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: withSuspense(<Home />) },
      { path: 'about', element: withSuspense(<About />) },
      { path: 'contact', element: withSuspense(<Contact />) },
      { path: 'events', element: withSuspense(<Events />) },
      { path: 'event-amigo-connectors', element: withSuspense(<EventAmigoConnectors />) },

      // Protected routes
      {
        element: <RequireAuth />, // Outlet-based guard
        children: [
          { path: 'amigos',  element: withSuspense(<Amigos />) },
          { path: 'user-profile', element: withSuspense(<Profile />) },
        ],
      },

      { path: '*', element: withSuspense(<NotFound />) },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}

---
## src/routes/RequireAuth.tsx

// src/routes/RequireAuth.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';

function inferPageLabel(pathname: string) {
  // Use the first segment: /amigos, /events/123 -> "Amigos", "Events"
  const seg = pathname.split('/').filter(Boolean)[0];
  if (!seg) return 'requested';
  const pretty = decodeURIComponent(seg)
    .replace(/[-_]+/g, ' ')                       // kebab/slug -> words
    .replace(/\b\w/g, c => c.toUpperCase());      // Title Case
  return pretty;
}

export default function RequireAuth({
  redirectTo = '/',
}: { redirectTo?: string }) {
  const { isLoggedIn, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!isLoggedIn) {
    const next = `${location.pathname}${location.search}`;
    const page = inferPageLabel(location.pathname);
    const flash = `You need to be logged in to view the ${page} page.`;

    const params = new URLSearchParams();
    params.set('auth', 'login');                 // open login modal
    params.set('next', next);                    // go here after login
    params.set('flash', flash);                  // modal notice text

    return <Navigate to={{ pathname: redirectTo, search: params.toString() }} replace />;
  }

  return <Outlet />;
}

---
## src/routes/ProtectRoute.tsx

// src/routes/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '@/context/AuthContext';
import { triggerAuthRequired } from '@/services/privateApi';

export default function ProtectedRoute() {
  const { isLoggedIn } = useAuth();
  const loc = useLocation();

  if (!isLoggedIn) {
    triggerAuthRequired('Please log in to continue.');
    return <Navigate to="/" state={{ from: loc }} replace />;
  }
  return <Outlet />;
}

---
## src/context/AuthContext.tsx

// src/context/AuthContext.tsx
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import publicApi from '@/services/publicApi';
import privateApi from '@/services/privateApi';
import type { Amigo } from '@/types/AmigoTypes';

type AuthState = {
  isLoggedIn: boolean;
  loading: boolean;
  error: string | null;
  amigos: Amigo[];
  currentUser: Amigo | null;
  refreshAuth: () => Promise<void>;
};

export const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading]       = useState(true);
  const [amigos, setAmigos]         = useState<Amigo[]>([]);
  const [currentUser, setCurrentUser] = useState<Amigo | null>(null);
  const [error, setError]           = useState<string | null>(null);

  const verifyToken = useCallback(async (): Promise<boolean> => {
    try {
      const res = await publicApi.get<{ valid: boolean }>('/api/v1/verify_token');
      return res.data.valid;
    } catch { return false; }
  }, []);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      await publicApi.post('/api/v1/refresh_token');
      return true;
    } catch { return false; }
  }, []);

  const loadAmigos = useCallback(async () => {
    try {
      const res = await privateApi.get<{ amigos: Amigo[] }>('/api/v1/amigos');
      setAmigos(res.data.amigos);
    } catch { setError('Error fetching amigos.'); }
  }, []);

  const loadMe = useCallback(async () => {
    try {
      const res = await privateApi.get<{ amigo: Amigo }>('/api/v1/me');
      setCurrentUser(res.data.amigo);
    } catch { setCurrentUser(null); }
  }, []);

  const refreshAuth = useCallback(async () => {
    setLoading(true);
    await publicApi.get('/api/v1/csrf').catch(() => {});
    let ok = await verifyToken();
    if (!ok) ok = await refreshToken();
    setIsLoggedIn(ok);
    if (ok) await Promise.all([loadMe(), loadAmigos()]);
    setLoading(false);
  }, [verifyToken, refreshToken, loadMe, loadAmigos]);

  useEffect(() => { refreshAuth(); }, [refreshAuth]);

  useEffect(() => {
    const onAuthChanged = () => { refreshAuth(); };
    document.addEventListener('auth:changed', onAuthChanged as EventListener);
    return () => document.removeEventListener('auth:changed', onAuthChanged as EventListener);
  }, [refreshAuth]);

  const value: AuthState = { isLoggedIn, loading, error, amigos, currentUser, refreshAuth };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Default-exported hook so you can `import useAuth from '@/context/AuthContext'`. */
function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

export default useAuth;


---
## src/hooks/useAuth.tsx

// src/hooks/useAuth.ts
import { useContext } from 'react'
import { AuthContext } from '@/context/AuthContext'

export default function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}

---
## src/hooks/useAuthStatus.tsx

// src/hooks/useAuthStatus.ts
import { useEffect, useState } from 'react';
import publicApi from '@/services/publicApi';
import { verifyCurrentAmigo, refreshAuthSession } from '@/services/auth';
import type { Amigo } from '@/types/AmigoTypes';

type AuthStatus = {
  isLoggedIn: boolean;
  amigo: Amigo | null;
  checking: boolean;
};

export default function useAuthStatus(): AuthStatus {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [amigo, setAmigo]           = useState<Amigo | null>(null);
  const [checking, setChecking]     = useState(true);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setChecking(true);

      // Prime CSRF cookie (harmless if already present)
      await publicApi.get('/api/v1/csrf').catch(() => {});

      let me = await verifyCurrentAmigo(); // null on 401
      if (!me) {
        // Try to refresh and verify again
        const refreshed = await refreshAuthSession();
        if (refreshed) me = await verifyCurrentAmigo();
      }

      if (cancelled) return;
      setAmigo(me);
      setIsLoggedIn(!!me);
      setChecking(false);
    };

    run();

    // React to auth events from Login/Signup/Logout flows
    const onChanged = () => run();
    document.addEventListener('auth:changed', onChanged as EventListener);

    return () => {
      cancelled = true;
      document.removeEventListener('auth:changed', onChanged as EventListener);
    };
  }, []);

  return { isLoggedIn, amigo, checking };
}

---
## src/services/privateApi.ts

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
  // Your UI should call resetAuthModalOpen() when the modal closes.
}

export function resetAuthModalOpen() {
  authModalOpen = false;
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

/* Bootstrap: hydrate Authorization from localStorage */
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

/* Response: central 401 handling with one refresh + retry */
let isRefreshing = false;
let lastAuthModalAt = 0;

privateApi.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const status = error.response?.status;

    if (!original || status !== 401 || original._retry) {
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
            } catch {/* ignore */}
          }

          return privateApi.request(original);
        }
      } else {
        await new Promise((r) => setTimeout(r, 200));
        return privateApi.request(original);
      }
    } catch {
      isRefreshing = false;
    }

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
// NOTE: no re-export of the named functions here—those are already exported above

---
## src/services/auth.ts

// src/services/auth.ts
import publicApi  from '@/services/publicApi';
import privateApi from '@/services/privateApi';
import type { Amigo } from '@/types/AmigoTypes';
import { ensureCsrfToken, resetCsrfToken } from '@/services/csrf';

export interface LoginParams {
  login_attribute: string;
  password: string;
}

/** If the backend also returns a token in the Authorization header, keep it around. */
function maybeCaptureAuthHeader(resp: any) {
  const hdr =
    (resp?.headers?.authorization as string | undefined) ??
    (resp?.data?.token as string | undefined);
  if (!hdr) return;

  const value = hdr.startsWith('Bearer') ? hdr : `Bearer ${hdr}`;
  privateApi.defaults.headers.common['Authorization'] = value;
  localStorage.setItem('authToken', value);
}

/** Call this once on app boot if you do use Authorization headers. */
export function hydrateAuthFromStorage() {
  const stored = localStorage.getItem('authToken');
  if (stored) privateApi.defaults.headers.common['Authorization'] = stored;
}

/** Let the app know when a new expiry is issued (login or refresh). */
function announceExpiry(iso?: string) {
  if (!iso || typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<string>('auth:expires', { detail: iso }));
}

// ─────────────────────────── Auth actions ───────────────────────────

export async function loginAmigo(params: LoginParams): Promise<Amigo> {
  await ensureCsrfToken();

  // If your SessionsController expects top-level keys, change to `{ ...params }`
  const resp = await publicApi.post(
    '/api/v1/login',
    { amigo: params },
    { withCredentials: true }
  );

  maybeCaptureAuthHeader(resp);

  // Announce new expiry for proactive refresh scheduling
  const expiresIso: string | undefined = resp.data?.data?.jwt_expires_at;
  announceExpiry(expiresIso);

  // Unwrap common shapes
  const amigo = resp.data?.data?.amigo ?? resp.data?.amigo ?? resp.data;
  return amigo as Amigo;
}

export async function signupAmigo(payload: unknown) {
  await ensureCsrfToken();

  const resp = await publicApi.post('/api/v1/signup', payload, {
    withCredentials: true,
  });

  // Some setups also issue a token on signup
  maybeCaptureAuthHeader(resp);

  return resp.data;
}

export async function logoutAmigo(): Promise<void> {
  const token = await ensureCsrfToken();
  await privateApi.delete('/api/v1/logout', {
    headers: { 'X-CSRF-Token': token },
    withCredentials: true,
  }).finally(() => {
    // Clean up any header-based auth and force CSRF re-prime next time
    delete privateApi.defaults.headers.common['Authorization'];
    localStorage.removeItem('authToken');
    resetCsrfToken();
  });
}

/** Returns the current amigo (if logged in) or null; never throws on 401. */
export async function verifyCurrentAmigo(): Promise<Amigo | null> {
  const res = await privateApi.get('/api/v1/verify_token', {
    validateStatus: s => s === 200 || s === 401,
    withCredentials: true,
  });

  if (res.status === 200) {
    const amigo = res.data?.data?.amigo ?? res.data?.amigo ?? res.data;
    return amigo as Amigo;
  }
  return null;
}

/** Attempts to refresh the session (e.g., using your refresh cookie). */
export async function refreshAuthSession(): Promise<boolean> {
  const token = await ensureCsrfToken();
  const res = await publicApi.post('/api/v1/refresh_token', undefined, {
    headers: { 'X-CSRF-Token': token },
    withCredentials: true,
    validateStatus: s => s === 200 || s === 401,
  });

  if (res.status === 200) {
    maybeCaptureAuthHeader(res);

    // Announce updated expiry so the scheduler can re-arm
    const expiresIso: string | undefined = res.data?.data?.jwt_expires_at;
    announceExpiry(expiresIso);

    return true;
  } else {
    // Refresh failed; clear state so the next action re-primes CSRF and prompts login
    delete privateApi.defaults.headers.common['Authorization'];
    localStorage.removeItem('authToken');
    resetCsrfToken();
    return false;
  }
}

---
## src/services/AmigoService.ts

// src/services/AmigoService.ts
import {
  privateGet,
  privatePost,
  privatePut,
  // privatePatch,
  privateDel
} from './apiHelper';
import { Amigo } from '../types/AmigoTypes';

// ─── fetch all amigos ───────────────────────
export const fetchAmigos = (): Promise<Amigo[]> =>
  privateGet<Amigo[]>('/api/v1/amigos');

// ─── fetch single amigo ─────────────────────
export const fetchAmigoById = (id: number): Promise<Amigo> =>
  privateGet<Amigo>(`/api/v1/amigos/${id}`);

// ─── fetch amigo details ────────────────────
export const fetchAmigoDetails = (amigoId: number) =>
  privateGet<any>(`/api/v1/amigos/${amigoId}/amigo_detail`);

// ─── fetch amigo locations ──────────────────
export const fetchAmigoLocations = (amigoId: number) =>
  privateGet<any>(`/api/v1/amigos/${amigoId}/amigo_locations`);

// ─── create/update/delete ──────────────────
export const createAmigo = (data: Partial<Amigo>) =>
  privatePost<Amigo>('/api/v1/amigos', data);

export const updateAmigo = (id: number, data: Partial<Amigo>) =>
  privatePut<Amigo>(`/api/v1/amigos/${id}`, data);

export const deleteAmigo = (id: number) =>
  privateDel<void>(`/api/v1/amigos/${id}`);

---
## src/publicApi.ts

// src/publicApi.ts
export type ThemeArea = 'public' | 'admin';
export type ThemeMode = 'light' | 'dark';

export interface ThemeOptions {
  area: ThemeArea;
  mode?: ThemeMode;
  palette?: string; // only used for public (e.g. "blue", "earth-tones")
}

type Stored = { mode: ThemeMode; palette?: string };
const STORAGE_KEY = (area: ThemeArea) => `theme:${area}`;

function getStored(area: ThemeArea): Stored | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY(area));
    return raw ? (JSON.parse(raw) as Stored) : null;
  } catch {
    return null;
  }
}

function store(area: ThemeArea, value: Stored): void {
  try {
    localStorage.setItem(STORAGE_KEY(area), JSON.stringify(value));
  } catch {
    /* ignore storage failures */
  }
}

function prefersDark(): boolean {
  return typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-color-scheme: dark)').matches === true;
}

function ensureLinkEl(): HTMLLinkElement | null {
  if (typeof document === 'undefined') return null;
  let link = document.getElementById('theme-loader') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.id = 'theme-loader';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
  return link;
}

function getLoaderHref(args: { area: ThemeArea; mode: ThemeMode; palette: string }): string {
  const { area, mode, palette } = args;
  if (area === 'admin') {
    // matches: /public/themes/admin/loaders/{light|dark}-theme.loader.css
    return `/themes/admin/loaders/${mode}-theme.loader.css`;
  }
  // matches: /public/themes/public/loaders/{palette}-{light|dark}.loader.css
  return `/themes/public/loaders/${palette}-${mode}.loader.css`;
}

/** Read the currently effective theme (area, mode, palette) with sane defaults. */
export function getTheme(): Required<Pick<ThemeOptions, 'area' | 'mode'>> & { palette?: string } {
  // Determine current area from <html data-theme-area>, else default 'public'
  const attrArea =
    (typeof document !== 'undefined' &&
      (document.documentElement.getAttribute('data-theme-area') as ThemeArea | null)) || null;

  const area: ThemeArea = attrArea === 'admin' ? 'admin' : 'public';
  const stored = getStored(area);

  const mode: ThemeMode =
    stored?.mode ?? (prefersDark() ? 'dark' : 'light');

  const palette =
    area === 'public'
      ? (stored?.palette ?? 'blue')
      : undefined;

  return { area, mode, palette };
}

/** Apply a theme (updates storage, sets data-* attrs, and swaps the loader <link>). */
export function setTheme(opts: ThemeOptions): void {
  if (typeof document === 'undefined') return;

  const current = getTheme();
  const area: ThemeArea = opts.area;

  // Merge with stored/current + defaults
  const mode: ThemeMode =
    opts.mode ?? current.mode ?? (prefersDark() ? 'dark' : 'light');

  const palette: string =
    area === 'public'
      ? (opts.palette ?? current.palette ?? 'blue')
      : 'admin'; // dummy for href builder; not stored for admin

  // Persist (admin does not store a palette)
  if (area === 'public') store(area, { mode, palette });
  else store(area, { mode });

  // Swap loader href
  const href = getLoaderHref({ area, mode, palette });
  const link = ensureLinkEl();
  if (link) {
    const absolute = new URL(href, location.origin).href;
    if (link.href !== absolute) link.href = href;
  }

  // Expose for CSS hooks
  const root = document.documentElement;
  root.setAttribute('data-theme-area', area);
  root.setAttribute('data-theme-mode', mode);
  if (area === 'public') root.setAttribute('data-theme-palette', palette);
  else root.removeAttribute('data-theme-palette');
}

/* Auto-apply on startup from storage or system preference */
(function init() {
  if (typeof document === 'undefined') return;
  // If the page already marked an area on <html>, respect it; otherwise default public
  const htmlArea =
    (document.documentElement.getAttribute('data-theme-area') as ThemeArea | null) || 'public';
  const stored = getStored(htmlArea);
  const initial: ThemeOptions =
    htmlArea === 'public'
      ? { area: 'public', mode: stored?.mode ?? (prefersDark() ? 'dark' : 'light'), palette: stored?.palette ?? 'blue' }
      : { area: 'admin', mode: stored?.mode ?? (prefersDark() ? 'dark' : 'light') };

  setTheme(initial);
})();

---
## src/services/publicApi.ts

// src/services/publicApi.ts
import axios, { AxiosInstance, AxiosHeaders } from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'https://localhost:3001';

function getCookie(name: string): string | undefined {
  // Escape name to avoid regex surprises
  const safe = name.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
  const m = document.cookie.match(new RegExp('(?:^|;\\s*)' + safe + '=([^;]+)'));
  return m ? decodeURIComponent(m[1]) : undefined;
}

const publicApi: AxiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// Attach CSRF token on mutating requests (POST/PUT/PATCH/DELETE)
publicApi.interceptors.request.use((config) => {
  const method = (config.method ?? 'get').toLowerCase();
  if (['post', 'put', 'patch', 'delete'].includes(method)) {
    const token = getCookie('CSRF-TOKEN');
    if (token) {
      const headers = (config.headers ??= new AxiosHeaders(config.headers));
      headers.set('X-CSRF-Token', token);
    }
  }
  return config;
});

export default publicApi;

---
## .env

VITE_API_BASE_URL=https://localhost:3001
VITE_API_IMAGE_BASE_URL=https://localhost:3001/images