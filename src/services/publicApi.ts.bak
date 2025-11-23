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
