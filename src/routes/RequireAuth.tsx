// src/routes/RequireAuth.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';

function inferPageLabel(pathname: string) {
  // Use the first segment: /amigos, /events/123 -> "Amigos", "Events"
  const seg = pathname.split('/').filter(Boolean)[0];
  if (!seg) return 'requested';
  const pretty = decodeURIComponent(seg)
    .replace(/[-_]+/g, ' ')                       // kebab/slug -> words
    .replace(/\b\w/g, c => c.toUpperCase());      // Title Case
  return pretty;
}

export default function RequireAuth({
  redirectTo = '/',
}: { redirectTo?: string }) {
  const { isLoggedIn, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!isLoggedIn) {
    const next = `${location.pathname}${location.search}`;
    const page = inferPageLabel(location.pathname);
    const flash = `You need to be logged in to view the ${page} page.`;

    const params = new URLSearchParams();
    params.set('auth', 'login');                 // open login modal
    params.set('next', next);                    // go here after login
    params.set('flash', flash);                  // modal notice text

    return <Navigate to={{ pathname: redirectTo, search: params.toString() }} replace />;
  }

  return <Outlet />;
}
