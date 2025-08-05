// src/services/publicApi.ts
import axios, { AxiosInstance } from 'axios';

const publicApi: AxiosInstance = axios.create({
  baseURL: 'https://localhost:3001',
  withCredentials: true,             // ← send & receive Rails cookies
  xsrfCookieName: 'CSRF-TOKEN',      // ← the name of the Rails CSRF cookie
  xsrfHeaderName: 'X-CSRF-Token',    // ← header in which Axios will send it
  headers: {
    'Content-Type': 'application/json',
  },
});

export default publicApi;
