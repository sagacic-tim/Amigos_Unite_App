// src/services/csrf.ts
import publicApi from './publicApi';

let cached: string | null = null;

export function resetCsrfToken() {
  cached = null;
}

export async function ensureCsrfToken(): Promise<string> {
  if (cached) return cached;

  const resp = await publicApi.get('/api/v1/csrf', { withCredentials: true });

  // Axios v1 headers can be an object or AxiosHeaders; support both:
  const headerToken =
    (resp.headers as any)['x-csrf-token'] ??
    (resp.headers as any).get?.('x-csrf-token');

  // Fallback to cookie in case a proxy drops the exposed header:
  const cookieMatch = document.cookie.match(/(?:^|;\s*)CSRF-TOKEN=([^;]+)/);
  const cookieToken = cookieMatch ? decodeURIComponent(cookieMatch[1]) : undefined;

  const token = headerToken || cookieToken;
  if (!token) throw new Error('Failed to obtain CSRF token');

  cached = token;
  publicApi.defaults.headers.common['X-CSRF-Token'] = token; // convenience
  return token;
}
