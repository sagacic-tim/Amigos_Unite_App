// src/hooks/useAuth.tsx
import { useEffect, useState } from 'react';
import axiosInstance from '../services/api';
import { Amigo } from '../types/AmigoTypes'; // Import the Amigo type
import { fetchAmigos } from '../services/AmigoService'; // Import the function to fetch amigos

const getTokenFromCookie = (): string | null => {
  const cookieString = document.cookie;
  const tokenCookie = cookieString.split('; ').find(row => row.startsWith('jwt='));
  return tokenCookie ? tokenCookie.split('=')[1] : null;
};

const useAuth = (requireAuth = true) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [amigos, setAmigos] = useState<Amigo[]>([]); // Explicitly define the type as Amigo[]
  const [error, setError] = useState<string | null>(null); // State to handle errors

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
            if (response.headers['x-csrf-token']) {
              axiosInstance.defaults.headers['X-CSRF-Token'] = response.headers['x-csrf-token'];
            }
            // Load amigos data after successful login
            loadAmigos();
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
          if (response.headers['x-csrf-token']) {
            axiosInstance.defaults.headers['X-CSRF-Token'] = response.headers['x-csrf-token'];
          }
          setIsLoggedIn(true);
          console.log('isLoggedIn:', isLoggedIn);
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

    const loadAmigos = async () => {
      try {
        setLoading(true);
        const amigosData = await fetchAmigos();
        console.log('Amigos data:', amigosData);
        setAmigos(amigosData);
      } catch (error: any) {
        console.error('Error loading amigos:', error);
        setError('Error fetching amigos. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    checkToken(); // Call it on component mount or page refresh
  }, [requireAuth]);

  // For debugging purposes, you can add these logs here as well
  console.log('isLoggedIn:', isLoggedIn);
  console.log('Token from cookie:', getTokenFromCookie());

  return { isLoggedIn, loading, amigos, error };
};

export default useAuth;