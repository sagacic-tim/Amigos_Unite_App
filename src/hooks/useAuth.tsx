// src/hooks/useAuth.tsx
import { useEffect, useState } from 'react';
import axiosInstance from '../services/api'; // Adjust the path to your `api.ts`

const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const response = await axiosInstance.get('/api/v1/verify_token');
        if (response.data.valid) {
          setIsLoggedIn(true);
        } else {
          // If the token is not valid, try to refresh it
          await refreshToken();
        }
      } catch (error) {
        console.error("Error during token verification:", error);
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };

    const refreshToken = async () => {
      try {
        const response = await axiosInstance.post('/api/v1/refresh');
        if (response.status === 200) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("Error during token refresh:", error);
        setIsLoggedIn(false);
      }
    };

    checkToken(); // Call it on mount or page refresh
  }, []);

  return { isLoggedIn, loading };
};

export default useAuth;