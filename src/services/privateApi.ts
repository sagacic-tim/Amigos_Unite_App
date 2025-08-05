// src/services/privateApi.ts
import axios, {
  AxiosInstance,
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import publicApi from './publicApi';

const privateApi: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'https://localhost:3001',
  withCredentials: true,            // ← cookies (JWT, CSRF) go here too
  headers: {
    'Content-Type': 'application/json',
  },
  xsrfCookieName: 'CSRF-TOKEN',
  xsrfHeaderName: 'X-CSRF-Token',
});

/**
 * On a 401 we hit Rails’s /refresh_token, which will
 * renew both the JWT cookie and the CSRF cookie, then
 * retry the original request (with credentials).
 */
privateApi.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (err: AxiosError) => {
    const orig = err.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (err.response?.status === 401 && !orig._retry) {
      orig._retry = true;
      try {
        // this sets new cookies; no JSON token payload expected
        await publicApi.post('/api/v1/refresh_token');
        // retry the original request (cookies now include fresh JWT + CSRF)
        return privateApi(orig);
      } catch (refreshErr) {
        return Promise.reject(refreshErr);
      }
    }
    return Promise.reject(err);
  }
);

export default privateApi;
