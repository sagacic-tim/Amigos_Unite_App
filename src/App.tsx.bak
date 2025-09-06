// src/App.tsx
import React, { useState, useEffect } from 'react';
import { Route, Routes, Link, NavLink, useLocation } from 'react-router-dom';
import { publicGet } from './services/apiHelper';
import Login from './components/Authentication/Login';
import Signup from './components/Authentication/Signup';
import HomePage from './pages/HomePage';
import AmigosPage from './pages/AmigosPage';
import './App.scss';
import { ThemeSwitcher } from './components/ThemeSwitcher';

const App: React.FC = () => {
  useEffect(() => {
    const fetchCsrf = async () => {
      try { await publicGet('/api/v1/csrf'); }
      catch (e) { console.error('Failed to load CSRF token', e); }
    };
    fetchCsrf();
  }, []);

  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setSignupModalOpen] = useState(false);

  const handleLoginSuccess = () => setLoginModalOpen(false);
  const handleSignupSuccess = () => setSignupModalOpen(false);

  const location = useLocation();
  const inAdmin = location.pathname.startsWith('/admin');

  return (
    <>
      {/* Header + primary nav */}
      <header className="site-header site-header--sticky" id="top">
        <div className="site-header__inner">
          {/* 1) Logo */}
          <Link className="site-header__logo" to="/" aria-label="Amigos Unite – Home">
            <img className="site-header__logo-img" src="src/assets/images/home_page/amigos-unite-logo-128.png" />
          </Link>

          {/* 2) Site Title */}
          <div className="site-title">Amigos Unite</div>

          {/* 3) Primary Nav */}
          <nav className="main-nav" aria-label="Main">
            <NavLink to="/" end className={({ isActive }) => (isActive ? 'is-active' : undefined)}>
              Home
            </NavLink>
            <NavLink to="/amigos" className={({ isActive }) => (isActive ? 'is-active' : undefined)}>
              Amigos
            </NavLink>
            {/* add more links as needed */}
          </nav>

          {/* 4) Theme switcher (no reload; persists via cookie/localStorage) */}
          <div className="theme-tools">
            <ThemeSwitcher area={inAdmin ? 'admin' : 'public'} />
          </div>

          {/* 5) Auth actions */}
          <div className="cluster">
            <button className="auth-form__button" onClick={() => setLoginModalOpen(true)}>Login</button>
            <button className="auth-form__button" onClick={() => setSignupModalOpen(true)}>Signup</button>
          </div>
        </div>
      </header>

      <main id="main-content" className="site-main">
        {/* Breadcrumbs */}
        <nav className="container content-section" aria-label="Breadcrumbs">
          <ol className="breadcrumbs">
            <li className="breadcrumbs__item"><Link to="/">Home</Link></li>
            {location.pathname.startsWith('/amigos') && (
              <li className="breadcrumbs__item"><span>Amigos</span></li>
            )}
          </ol>
        </nav>

        {/* Page content */}
        <div className="container content-section">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="amigos" element={<AmigosPage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </div>
      </main>

      {/* Footer */}
      <footer className="site-footer">
        <div className="site-footer__inner">
          <section className="site-footer__section">
            <h2 className="site-footer__heading">About</h2>
            <p>Amigos Unite connects people, events, and locations.</p>
          </section>
          <section className="site-footer__section">
            <h2 className="site-footer__heading">Navigation</h2>
            <ul className="footer-list">
              <li><Link to="/amigos">Amigos</Link></li>
              <li><Link to="/events">Events</Link></li>
              <li><Link to="/locations">Locations</Link></li>
            </ul>
          </section>
          <section className="site-footer__section">
            <h2 className="site-footer__heading">Resources</h2>
            <ul className="footer-list">
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/privacy">Privacy</Link></li>
            </ul>
          </section>
          <section className="site-footer__section">
            <h2 className="site-footer__heading">Follow</h2>
            <ul className="footer-social">
              <li><a aria-label="Twitter" href="#">T</a></li>
              <li><a aria-label="GitHub" href="#">GH</a></li>
            </ul>
          </section>
        </div>

        <div className="site-footer__bottom">
          <span>© {new Date().getFullYear()} Amigos Unite</span>
          <a className="footer-back-to-top" href="#top">Back to top</a>
        </div>
      </footer>

      {/* Modals */}
      {isLoginModalOpen && (
        <Login
          isOpen={isLoginModalOpen}
          onClose={() => setLoginModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
      {isSignupModalOpen && (
        <Signup
          isOpen={isSignupModalOpen}
          onClose={() => setSignupModalOpen(false)}
          onSignupSuccess={handleSignupSuccess}
        />
      )}

      {/* Toast stack (optional) */}
      <div className="toast-container toast-container--top-right" role="region" aria-label="Notifications" />
    </>
  );
};

export default App;
