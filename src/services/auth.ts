// src/services/auth.ts
import publicApi  from '@/services/publicApi';
import privateApi from '@/services/privateApi';
import type { Amigo } from '@/types/AmigoTypes';

let csrfToken: string | null = null;

async function ensureCsrf(): Promise<string> {
  if (csrfToken) return csrfToken;

  // Prime CSRF cookie and capture token header
  const resp  = await publicApi.get('/api/v1/csrf');
  const token = resp.headers['x-csrf-token'];
  if (!token) throw new Error('Failed to obtain CSRF token from server');

  csrfToken = token;
  publicApi.defaults.headers.common['X-CSRF-Token'] = token;
  return token;
}

export interface LoginParams {
  login_attribute: string;
  password: string;
}

// ─────────────────────────── Auth actions ───────────────────────────

export async function loginAmigo(params: LoginParams): Promise<Amigo> {
  await ensureCsrf();
  const resp = await publicApi.post<{ data: { amigo: Amigo; jwt_expires_at: string } }>(
    '/api/v1/login',
    { amigo: params }
  );
  return resp.data.data.amigo;
}

export async function signupAmigo(payload: unknown) {
  await ensureCsrf();
  const resp = await publicApi.post('/api/v1/signup', payload);
  return resp.data;
}

export async function logoutAmigo(): Promise<void> {
  // CSRF for unsafe method
  const token = await ensureCsrf();
  await privateApi.delete('/api/v1/logout', {
    headers: { 'X-CSRF-Token': token },
    withCredentials: true,
  });
}

// Returns the current amigo (if logged in) or null. Never throws on 401.
export async function verifyCurrentAmigo(): Promise<Amigo | null> {
  const res = await privateApi.get('/api/v1/verify_token', {
    validateStatus: s => s === 200 || s === 401,
    withCredentials: true,
  });
  if (res.status === 200) {
    // Adjust if your controller wraps differently
    return (res.data as Amigo) ?? null;
  }
  return null; // 401 → no active session
}

export async function refreshAuthSession(): Promise<boolean> {
  const token = await ensureCsrf();
  const res = await publicApi.post('/api/v1/refresh_token', undefined, {
    headers: { 'X-CSRF-Token': token },
    withCredentials: true,
    validateStatus: s => s === 200 || s === 401,
  });
  return res.status === 200;
}
