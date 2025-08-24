// src/services/publicApi.ts
import axios, { AxiosInstance, AxiosHeaders } from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'https://localhost:3001';

const publicApi: AxiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Attach CSRF from cookie on unsafe methods (cross-origin safe)
publicApi.interceptors.request.use((config) => {
  const method = (config.method ?? 'get').toLowerCase();
  if (['post', 'put', 'patch', 'delete'].includes(method)) {
    const m = document.cookie.match(/(?:^|;\s*)CSRF-TOKEN=([^;]+)/);
    if (m) {
      const token = decodeURIComponent(m[1]);
      // Ensure headers is an AxiosHeaders instance
      const headers = (config.headers ??= new AxiosHeaders(config.headers));
      headers.set('X-CSRF-Token', token);
    }
  }
  return config;
});

export default publicApi;
