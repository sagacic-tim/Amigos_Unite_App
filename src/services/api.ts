// src/services/api.ts
import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig, AxiosHeaders } from 'axios';

axios.defaults.withCredentials = true;

const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://localhost:3001';

// Global variables for managing CSRF tokens and token refresh states
let csrfToken: string | null = null;
let isRefreshing = false;
let failedQueue: { resolve: (value: any) => void; reject: (reason?: any) => void }[] = [];

// Axios instance setup
const axiosInstance = axios.create({
  baseURL: baseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,  // Ensure cookies are sent with requests
});

// Function to extract the JWT token from the cookie
export const getTokenFromCookie = (): string | null => {
  const cookieString = document.cookie;
  console.log('Cookie String:', cookieString); // Debugging log
  const tokenCookie = cookieString.split('; ').find(row => row.startsWith('jwt='));
  return tokenCookie ? tokenCookie.split('=')[1] : null;
};

// Function to refresh JWT token
const refreshToken = async () => {
  return axiosInstance.post('/api/v1/refresh');
};

// Function to verify the JWT token by making a request to the server
export const verifyJwtToken = async (): Promise<boolean> => {
  try {
    const jwtToken = getTokenFromCookie(); // Extract the token from the cookie
    if (!jwtToken) {
      console.warn('No JWT token present in cookies.');
      return false;
    }

    const response = await axiosInstance.get('/api/v1/verify_token');
    if (response.status === 200 && response.data.valid) {
      return true; // Return true if the token is valid
    } else {
      console.warn('Token invalid, attempting to refresh...');
      await refreshToken(); // Attempt to refresh the token if it is invalid
      return true;
    }
  } catch (error) {
    console.error("Token verification failed:", error);
    return false; // Token is invalid or verification failed
  }
};

// Function to handle failed request queue
const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Axios response interceptor to handle CSRF and retry logic
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Retrieve the CSRF token from the response headers and set it in defaults
    const csrfToken = response.headers['x-csrf-token'];
    if (csrfToken) {
      axiosInstance.defaults.headers['X-CSRF-Token'] = csrfToken;
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await refreshToken();
        const newToken = response.data.token;

        axiosInstance.defaults.headers['Authorization'] = `Bearer ${newToken}`;
        processQueue(null, newToken);
        return axiosInstance(originalRequest);
      } catch (err) {
        processQueue(err as AxiosError, null);
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Centralized request method
const request = async (method: InternalAxiosRequestConfig['method'], url: string, data?: any) => {
  try {
    const response = await axiosInstance.request({ method, url, data });
    return response.data;
  } catch (error) {
    // This will be handled by the response interceptor
    throw error;
  }
};

// Specific API methods
export const get = async (url: string) => request('get', url);

export const post = async (url: string, body: any) => request('post', url, body);

export const put = async (url: string, body: any) => request('put', url, body);

export const del = async (url: string) => request('delete', url);

export const logout = async () => request('delete', '/api/v1/logout');

export default axiosInstance;