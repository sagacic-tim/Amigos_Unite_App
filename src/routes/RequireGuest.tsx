// src/routes/RequireGuest.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';

export default function RequireGuest({ redirectTo = '/' }: { redirectTo?: string }) {
  const { isLoggedIn, loading } = useAuth();
  const location = useLocation();

  // Block rendering while auth state is being checked to avoid flicker
  if (loading) return null; // or return <Spinner/> if you have one

  if (isLoggedIn) {
    const next = new URLSearchParams(location.search).get('next');
    return <Navigate to={next || redirectTo} replace />;
  }

  return <Outlet />;
}
