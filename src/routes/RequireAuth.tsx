// src/routes/RequireAuth.tsx
import { useEffect } from 'react';
import useAuthStatus from '@/hooks/useAuthStatus';

type Props = { children: JSX.Element };

export default function RequireAuth({ children }: Props) {
  const { isLoggedIn, checking } = useAuthStatus();

  // On first mount (and whenever status becomes “not logged in”), open the login modal
  useEffect(() => {
    if (!checking && !isLoggedIn) {
      document.dispatchEvent(new CustomEvent('auth:login'));
    }
  }, [checking, isLoggedIn]);

  // While verifying, render nothing (or a thin progress bar/spinner if you prefer)
  if (checking) return null;

  // If not logged in, we already opened the modal; block the route content.
  if (!isLoggedIn) return null;

  // Authenticated → render the protected content
  return children;
}
