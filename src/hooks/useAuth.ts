// src/hooks/useAuth.ts
//
import { useContext } from 'react';
import { AuthContext } from '@/context/auth-context';
import type { AuthState } from '@/context/auth-context';

export default function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}

