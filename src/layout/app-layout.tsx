// src/layouts/AppLayout.tsx
import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import SiteHeader from '@/layout/header/site-header';
import SiteFooter from '@/layout/footer/site-footer';

import Modal from '@/components/modals/UniversalModal';
import Login from '@/components/Authentication/Login';
import Signup from '@/components/Authentication/Signup';
import Logout from '@/components/Authentication/Logout';

import '@/App.scss';
import '@/assets/sass/layout/_grid.scss';
import '@/assets/sass/components/_forms.scss';

// ---------- Auth modals host ----------
function AuthModalsHost() {
  const navigate = useNavigate();

  const [loginOpen, setLoginOpen] = useState(false);
  const [loginNotice, setLoginNotice] = useState<string | null>(null);
  const [loginNext, setLoginNext] = useState<string | null>(null);

  const [signupOpen, setSignupOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  // Central handler for auth:* events from anywhere in the app
  useEffect(() => {
    const onLogin = (ev: Event) => {
      const e = ev as CustomEvent<{ notice?: string; next?: string }>;
      setLoginNotice(e.detail?.notice ?? null);
      setLoginNext(e.detail?.next ?? null);
      setLoginOpen(true);
    };
    const onSignup = () => setSignupOpen(true);
    const onLogout = () => setLogoutOpen(true);

    document.addEventListener(
      'auth:login',
      onLogin as EventListener,
    );
    document.addEventListener(
      'auth:signup',
      onSignup as EventListener,
    );
    document.addEventListener(
      'auth:logout',
      onLogout as EventListener,
    );

    return () => {
      document.removeEventListener(
        'auth:login',
        onLogin as EventListener,
      );
      document.removeEventListener(
        'auth:signup',
        onSignup as EventListener,
      );
      document.removeEventListener(
        'auth:logout',
        onLogout as EventListener,
      );
    };
  }, []);

  // Close modals on route changes
  useEffect(() => {
    const handler = () => {
      setLoginOpen(false);
      setSignupOpen(false);
      setLogoutOpen(false);
      setLoginNotice(null);
      setLoginNext(null);
    };
    document.addEventListener(
      'ui:route-changed',
      handler as EventListener,
    );
    return () =>
      document.removeEventListener(
        'ui:route-changed',
        handler as EventListener,
      );
  }, []);

  return (
    <>
      <Login
        isOpen={loginOpen}
        notice={loginNotice ?? undefined}
        onClose={() => {
          setLoginOpen(false);
          setLoginNotice(null);
          setLoginNext(null);
        }}
        onLoginSuccess={(amigo) => {
          setLoginOpen(false);
          const target = loginNext || '/';
          setLoginNotice(null);
          setLoginNext(null);
          // navigate to the originally requested page
          navigate(target, { replace: true });

          // let the app know auth state changed
          document.dispatchEvent(
            new CustomEvent('auth:changed', {
              detail: { type: 'login', amigo },
            }),
          );
        }}
      />

      <Signup
        isOpen={signupOpen}
        onClose={() => setSignupOpen(false)}
        onSignupSuccess={() => {
          setSignupOpen(false);
          document.dispatchEvent(
            new CustomEvent('auth:changed', {
              detail: { type: 'signup' },
            }),
          );
        }}
      />

      <Modal isOpen={logoutOpen} onClose={() => setLogoutOpen(false)}>
        <div className="auth-dialog">
          <h2>Logout</h2>
          <p>Are you sure you want to log out?</p>
          <div className="form-grid__actions">
            <Logout
              onLogoutSuccess={() => {
                setLogoutOpen(false);
                document.dispatchEvent(
                  new CustomEvent('auth:changed', {
                    detail: { type: 'logout' },
                  }),
                );
              }}
            />
            <button
              type="button"
              className="button button--cancel"
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

// ---------- App layout with query handling ----------
export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [banner, setBanner] = useState<string | null>(null);

  // Let listeners know the route changed (closes modals, etc.)
  useEffect(() => {
    document.dispatchEvent(new CustomEvent('ui:route-changed'));
  }, [location.pathname]);

  // Handle ?auth=login&flash=...&next=... pattern
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const auth = params.get('auth'); // 'login' triggers modal
    const flash = params.get('flash');
    const next = params.get('next');

    if (auth === 'login') {
      document.dispatchEvent(
        new CustomEvent('auth:login', {
          detail: {
            notice: flash || undefined,
            next: next || undefined,
          },
        }),
      );

      // Clean URL so it doesn’t fire again
      params.delete('auth');
      params.delete('flash');
      params.delete('next');
      navigate(
        { pathname: location.pathname, search: params.toString() },
        { replace: true },
      );
      setBanner(null);
      return;
    }

    if (flash) {
      setBanner(flash);
      params.delete('flash');
      navigate(
        { pathname: location.pathname, search: params.toString() },
        { replace: true },
      );
    }
  }, [location.key, location.pathname, location.search, navigate]);

  return (
    <div className="app-shell">
      {banner && (
        <div className="banner banner-warning">
          <span>{banner}</span>
          <button
            type="button"
            className="banner__close"
            onClick={() => setBanner(null)}
            aria-label="Close"
          >
            ×
          </button>
        </div>
      )}

      <SiteHeader />

      <main className="app-main">
        <Outlet />
      </main>

      <SiteFooter />

      <AuthModalsHost />
    </div>
  );
}
