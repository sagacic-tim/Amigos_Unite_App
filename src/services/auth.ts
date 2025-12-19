// src/services/auth.ts
import publicApi  from '@/services/api/publicApi';
import privateApi from '@/services/api/privateApi';
import type { Amigo } from '@/types/amigos/AmigoTypes';
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

  const resp = await publicApi.post(
    '/api/v1/login',
    { amigo: params },
    { withCredentials: true }
  );

  maybeCaptureAuthHeader(resp);

  const expiresIso: string | undefined = resp.data?.data?.jwt_expires_at;
  announceExpiry(expiresIso);

  const amigo = resp.data?.data?.amigo ?? resp.data?.amigo ?? resp.data;

  // 🔽 tell AuthProvider to re-check /me + /amigos
  document.dispatchEvent(new Event('auth:changed'));

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
  const res = await privateApi.get('/api/v1/me', {
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
