// src/routes/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import { triggerAuthRequired } from '@/services/api/privateApi';

export default function ProtectedRoute() {
  const { isLoggedIn } = useAuth();
  const loc = useLocation();

  if (!isLoggedIn) {
    triggerAuthRequired('Please log in to continue.');
    return <Navigate to="/" state={{ from: loc }} replace />;
  }
  return <Outlet />;
}
