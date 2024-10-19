// src/hooks/useAuth.tsx
import { useEffect, useState } from 'react';
import axiosInstance from '../services/api';

const getTokenFromCookie = (): string | null => {
  const cookieString = document.cookie;
  const tokenCookie = cookieString.split('; ').find(row => row.startsWith('jwt='));
  return tokenCookie ? tokenCookie.split('=')[1] : null;
};

const useAuth = (requireAuth = true) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!requireAuth) {
      setLoading(false); // No need to check authentication
      return;
    }

    console.log('Checking authentication status...');
    const checkToken = async () => {
      const token = getTokenFromCookie();
      console.log('Token from cookie:', token);

      if (token) {
        try {
          const response = await axiosInstance.get('/api/v1/verify_token');
          console.log('Token verification response:', response.data);

          if (response.data.valid) {
            setIsLoggedIn(true);
            // Capture the CSRF token from response headers and set it as a default for Axios
            const csrfToken = response.headers['x-csrf-token'];
            if (csrfToken) {
              axiosInstance.defaults.headers['X-CSRF-Token'] = csrfToken;
            }
          } else {
            console.log('Invalid token, attempting to refresh...');
            await refreshToken();
          }
        } catch (error) {
          console.error('Error during token verification:', error);
          setIsLoggedIn(false);
          clearAuthTokens(); // Clear tokens if there's an error during verification
        }
      } else {
        console.warn('No JWT token found, skipping token verification.');
        setIsLoggedIn(false);
        clearAuthTokens(); // Clear tokens if no JWT token is found
      }

      setLoading(false); // Ensure loading is set to false at the end
    };

    const refreshToken = async () => {
      try {
        const response = await axiosInstance.post('/api/v1/refresh');
        console.log('Token refreshed successfully:', response.data);

        if (response.status === 200 && response.data.jwt) {
          // Update JWT in cookies
          document.cookie = `jwt=${response.data.jwt}; Path=/`;

          // Capture and set the CSRF token from the response headers
          const csrfToken = response.headers['x-csrf-token'];
          if (csrfToken) {
            axiosInstance.defaults.headers['X-CSRF-Token'] = csrfToken;
          }

          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
          clearAuthTokens();
        }
      } catch (error) {
        console.error('Error during token refresh:', error);
        setIsLoggedIn(false);
        clearAuthTokens();
      }
    };

    const clearAuthTokens = () => {
      document.cookie = 'jwt=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    };

    checkToken(); // Call it on component mount or page refresh
  }, [requireAuth]);

  return { isLoggedIn, loading };
};

export default useAuth;