// src/hooks/useAuthStatus.ts
import useAuth from '@/hooks/useAuth';
import type { Amigo } from '@/types/AmigoTypes';

type AuthStatus = {
  isLoggedIn: boolean;
  amigo: Amigo | null;
  checking: boolean;
};

export default function useAuthStatus(): AuthStatus {
  const { isLoggedIn, currentAmigo, loading } = useAuth();
  return {
    isLoggedIn,
    amigo: currentAmigo,
    checking: loading,
  };
}
