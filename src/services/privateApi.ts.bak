// src/services/privateApi.ts
import axios, { AxiosInstance, AxiosError, AxiosResponse, InternalAxiosRequestConfig, AxiosHeaders } from 'axios';
import publicApi from './publicApi';
import { ensureCsrfToken } from './csrf';

const privateApi: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'https://localhost:3001',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

let onAuthRequired: ((notice?: string) => void) | null = null;
export function setAuthRequiredHandler(fn: (notice?: string) => void) { onAuthRequired = fn; }

// attach CSRF on unsafe methods
privateApi.interceptors.request.use((config) => {
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

privateApi.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (err: AxiosError) => {
    const orig = err.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const status = err.response?.status;

    if (status === 401 && orig && !orig._retry) {
      orig._retry = true;
      try {
        const token = await ensureCsrfToken();
        await publicApi.post('/api/v1/refresh_token', undefined, {
          headers: { 'X-CSRF-Token': token }, withCredentials: true,
        });
        return privateApi(orig); // retry once
      } catch {
        onAuthRequired?.('You need to be logged in to view this page.');
      }
    }
    return Promise.reject(err);
  }
);

export default privateApi;
