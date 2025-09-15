// src/layouts/AppLayout.tsx
import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import SiteHeader from '@/components/Header/SiteHeader';
import SiteFooter from '@/components/Footer/SiteFooter';

import Modal from '@/components/Common/Modal';
import Login from '@/components/Authentication/Login';
import Signup from '@/components/Authentication/Signup';
import Logout from '@/components/Authentication/Logout';

// Load global styles once here
import '@/App.scss';
import '@/assets/sass/layout/_grid.scss';
import '@/assets/sass/components/_forms.scss';

// src/layouts/AppLayout.tsx  (replace only AuthModalsHost)
function AuthModalsHost() {
  const [loginOpen, setLoginOpen]   = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  // Open modals on events dispatched by UserMenu defaults
  useEffect(() => {
    const onLogin  = () => setLoginOpen(true);
    const onSignup = () => setSignupOpen(true);
    const onLogout = () => setLogoutOpen(true);

    document.addEventListener('auth:login',  onLogin as EventListener);
    document.addEventListener('auth:signup', onSignup as EventListener);
    document.addEventListener('auth:logout', onLogout as EventListener);

    return () => {
      document.removeEventListener('auth:login',  onLogin as EventListener);
      document.removeEventListener('auth:signup', onSignup as EventListener);
      document.removeEventListener('auth:logout', onLogout as EventListener);
    };
  }, []);

  // Optional: close any auth modal on route change
  useEffect(() => {
    const handler = () => {
      setLoginOpen(false);
      setSignupOpen(false);
      setLogoutOpen(false);
    };
    document.addEventListener('ui:route-changed', handler as EventListener);
    return () => document.removeEventListener('ui:route-changed', handler as EventListener);
  }, []);

  return (
    <>
      {/* Login and Signup own their Modal internally and require isOpen/onClose */}
      <Login
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onLoginSuccess={(amigo) => {
          setLoginOpen(false);
          // let the app know auth state changed (and pass the amigo if you like)
          document.dispatchEvent(new CustomEvent('auth:changed', { detail: { type: 'login', amigo } }));
        }}
      />

      <Signup
        isOpen={signupOpen}
        onClose={() => setSignupOpen(false)}
        onSignupSuccess={() => {
          setSignupOpen(false);
          document.dispatchEvent(new CustomEvent('auth:changed', { detail: { type: 'signup' } }));
        }}
      />

      {/* Logout does NOT take isOpen/onClose; wrap it in your shared Modal */}
      <Modal isOpen={logoutOpen} onClose={() => setLogoutOpen(false)}>
        <div className="auth-dialog">
          <h2>Logout</h2>
          <p>Are you sure you want to log out?</p>
          <div className="auth-dialog__actions">
            <Logout
              onLogoutSuccess={() => {
                setLogoutOpen(false);
                document.dispatchEvent(new CustomEvent('auth:changed', { detail: { type: 'logout' } }));
              }}
            />
            <button
              type="button"
              className="button button--secondary"
              onClick={() => setLogoutOpen(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default function AppLayout() {
  // Close any open menus/modals on route change (optional nicety)
  const { pathname } = useLocation();
  useEffect(() => {
    document.dispatchEvent(new CustomEvent('ui:route-changed'));
  }, [pathname]);

  return (
    <div className="app-shell">
      <SiteHeader />
      <main className="app-main">
        <Outlet />
      </main>
      <SiteFooter />
      <AuthModalsHost />
    </div>
  );
}
