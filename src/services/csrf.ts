// src/services/csrf.ts
import publicApi from '@/services/publicApi';

let cachedToken: string | null = null;
let inflight: Promise<string> | null = null;

function readCookieToken(): string | null {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(/(?:^|;\s*)CSRF-TOKEN=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

export async function ensureCsrfToken(): Promise<string> {
  // 1. If we already have a cached token, use it.
  if (cachedToken) return cachedToken;

  // 2. Try to read from cookies first.
  const fromCookie = readCookieToken();
  if (fromCookie) {
    cachedToken = fromCookie;
    return cachedToken;
  }

  // 3. Only one network call at a time.
  if (!inflight) {
    inflight = publicApi
      .get('/api/v1/csrf', { withCredentials: true })
      .then(() => {
        inflight = null;
        const after = readCookieToken();
        if (!after) throw new Error('CSRF cookie missing after /csrf');
        cachedToken = after;
        return cachedToken;
      })
      .catch((err) => {
        inflight = null;
        throw err;
      });
  }

  return inflight;
}

export function resetCsrfToken() {
  cachedToken = null;
}
