// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';

import AppRouter from '@/routes/routes';
import ErrorBoundary from '@/components/ErrorBoundary';
import { AuthProvider } from '@/context/AuthContext';

import Login from '@/components/Authentication/Login';
import { setAuthRequiredHandler } from '@/services/privateApi';
import '@/App.scss';

function Root() {
  const [loginOpen, setLoginOpen] = React.useState(false);
  const [loginNotice, setLoginNotice] = React.useState<string | undefined>();

  React.useEffect(() => {
    // When a protected request returns 401, open the login modal with a notice
    setAuthRequiredHandler((notice?: string) => {
      setLoginNotice(notice ?? 'You need to be logged in to view this page.');
      setLoginOpen(true);
    });
  }, []);

  return (
    <AuthProvider>
      <ErrorBoundary>
        <AppRouter />
        <Login
          isOpen={loginOpen}
          onClose={() => setLoginOpen(false)}
          // If your AuthContext exposes a setter or refresh, call it here;
          // otherwise closing the modal is fine (requests will succeed after login).
          onLoginSuccess={() => setLoginOpen(false)}
          notice={loginNotice}
        />
      </ErrorBoundary>
    </AuthProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
