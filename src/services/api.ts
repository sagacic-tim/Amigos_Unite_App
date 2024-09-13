import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig, AxiosHeaders } from 'axios';

const baseUrl = import.meta.env.VITE_API_BASE_URL || '';

const axiosInstance = axios.create({
  baseURL: baseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Ensure credentials (cookies) are sent with requests
});

// Function to extract the JWT token from the cookie
const getTokenFromCookie = (): string | null => {
  const tokenCookie = document.cookie.split('; ').find(row => row.startsWith('jwt='));
  return tokenCookie ? tokenCookie.split('=')[1] : null;
};

// Function to verify the JWT token by making a request to the server
export const verifyJwtToken = async (): Promise<boolean> => {
  try {
    const jwtToken = getTokenFromCookie(); // Extract the token from the cookie
    if (jwtToken) {
      const response = await axiosInstance.get('/api/v1/verify_token');
      return response.status === 200; // Return true if token is valid
    }
    return false; // No JWT token present
  } catch (error) {
    console.error("Token verification failed:", error);
    return false; // Token is invalid or verification failed
  }
};

let csrfToken: string | null = null;  // Variable to store the CSRF token

// Interceptor to store CSRF token from the response and handle errors
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Capture CSRF token from response headers and store it
    if (response.headers['x-csrf-token']) {
      csrfToken = response.headers['x-csrf-token'];
    }
    return response;
  },
  async (error: AxiosError) => {
    // Handle 401 Unauthorized errors (token expiry, unauthorized access)
    if (error.response?.status === 401) {
      console.error('Token expired or unauthorized:', error);
      window.location.href = '/login';  // Optionally redirect to login or refresh token
    }
    return Promise.reject(error);
  }
);

// Interceptor to add CSRF and JWT tokens to the request headers
axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // Initialize headers if they are undefined
  if (!config.headers) {
    config.headers = new AxiosHeaders(); // Use AxiosHeaders instead of an empty object
  }

  // Add CSRF token to request headers if available
  if (csrfToken) {
    config.headers['X-CSRF-Token'] = csrfToken;
  }

  // Add JWT token to the request headers if available
  const jwtToken = getTokenFromCookie();
  if (jwtToken) {
    config.headers.Authorization = `Bearer ${jwtToken}`; // Add JWT token to headers
  }

  return config;
});

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