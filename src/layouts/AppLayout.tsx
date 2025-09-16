// src/layouts/AppLayout.tsx
import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import SiteHeader from '@/components/Header/SiteHeader';
import SiteFooter from '@/components/Footer/SiteFooter';

import Modal from '@/components/Common/Modal';
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
  const [loginNotice, setLoginNotice] = useState<string | null>(null); // NEW
  const [loginNext, setLoginNext] = useState<string | null>(null);     // NEW

  const [signupOpen, setSignupOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  useEffect(() => {
    const onLogin = (ev: Event) => {
      const e = ev as CustomEvent<{ notice?: string; next?: string }>;
      setLoginNotice(e.detail?.notice ?? null);
      setLoginNext(e.detail?.next ?? null);
      setLoginOpen(true);
    };
    const onSignup = () => setSignupOpen(true);
    const onLogout = () => setLogoutOpen(true);

    document.addEventListener('auth:login', onLogin as EventListener);
    document.addEventListener('auth:signup', onSignup as EventListener);
    document.addEventListener('auth:logout', onLogout as EventListener);

    return () => {
      document.removeEventListener('auth:login', onLogin as EventListener);
      document.removeEventListener('auth:signup', onSignup as EventListener);
      document.removeEventListener('auth:logout', onLogout as EventListener);
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
    document.addEventListener('ui:route-changed', handler as EventListener);
    return () => document.removeEventListener('ui:route-changed', handler as EventListener);
  }, []);

  return (
    <>
      <Login
        isOpen={loginOpen}
        notice={loginNotice ?? undefined}               // pass notice to modal
        onClose={() => { setLoginOpen(false); setLoginNotice(null); setLoginNext(null); }}
        onLoginSuccess={(amigo) => {
          setLoginOpen(false);
          const target = loginNext || '/';
          setLoginNotice(null);
          setLoginNext(null);
          // navigate to the originally requested page
          navigate(target, { replace: true });

          // let the app know auth state changed
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
            <button type="button" className="button__cancel" onClick={() => setLogoutOpen(false)}>Cancel</button>
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

  useEffect(() => {
    document.dispatchEvent(new CustomEvent('ui:route-changed'));
  }, [location.pathname]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const auth   = params.get('auth');     // 'login' triggers modal
    const flash  = params.get('flash');    // message to show in modal
    const next   = params.get('next');     // where to go after login

    if (auth === 'login') {
      // Open the login modal and pass along flash + next
      document.dispatchEvent(new CustomEvent('auth:login', {
        detail: { notice: flash || undefined, next: next || undefined }
      }));

      // Clean the URL so it doesn’t fire again
      params.delete('auth');
      params.delete('flash');
      params.delete('next');
      navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
      // Don’t show the top banner; the notice is inside the modal
      setBanner(null);
      return;
    }

    // Optional: if you still want to support a generic top banner when not opening login
    if (flash) {
      setBanner(flash);
      params.delete('flash');
      navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
    }
  }, [location.key, location.pathname, location.search, navigate]);

  return (
    <div className="app-shell">
      {banner && (
        <div className="banner banner-warning">
          <span>{banner}</span>
          <button type="button" className="banner__close" onClick={() => setBanner(null)} aria-label="Close">×</button>
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
