// src/hooks/useAuthStatus.ts
import useAuth from '@/hooks/useAuth';
import type { Amigo } from '@/types/AmigoTypes';

type AuthStatus = {
  isLoggedIn: boolean;
  amigo: Amigo | null;
  checking: boolean;
};

export default function useAuthStatus(): AuthStatus {
  const { isLoggedIn, currentUser, loading } = useAuth();
  return {
    isLoggedIn,
    amigo: currentUser,
    checking: loading,
  };
}
