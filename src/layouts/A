import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import SiteHeader from "@/components/Header/SiteHeader";
import Login from "@/components/Authentication/Login";
import Signup from "@/components/Authentication/Signup";
import { publicGet } from "@/services/apiHelper";
import "@/App.scss";

const Layout: React.FC = () => {
  // 1) CSRF prefetch (moved from App.tsx)
  useEffect(() => {
    (async () => {
      try { await publicGet("/api/v1/csrf"); }
      catch (e) { console.error("Failed to load CSRF token", e); }
    })();
  }, []);

  // 2) Modal state/handlers (moved from App.tsx)
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setSignupModalOpen] = useState(false);
  const handleLoginSuccess  = () => setLoginModalOpen(false);
  const handleSignupSuccess = () => setSignupModalOpen(false);

  // 3) Path-aware bits (breadcrumbs + theme “area” flag)
  const location = useLocation();
  const inAdmin  = location.pathname.startsWith("/admin");

  return (
    <>
      {/* Header (replaces the header markup from App.tsx) */}


      <SiteHeader
        title="Amigos Unite"
        logoSrc="/src/assets/images/home_page/amigos-unite-logo-128.png"
        nav={[
          { to: "/", label: "Home" },
          { to: "/amigos", label: "Amigos" },
        ]}
        // Auth modal openers
        onLogin={() => setLoginModalOpen(true)}
        onSignup={() => setSignupModalOpen(true)}
        // Ensure this returns void (wrap in a block)
        onLogout={() => {
          document.dispatchEvent(new CustomEvent("auth:logout"));
        }}
        // Optional: lock the embedded ThemeSwitcher to the current area
        themeArea={inAdmin ? "admin" : "public"}
      />



      {/* Main content (keeps your structure) */}
      <main id="main-content" className="site-main">
        {/* Breadcrumbs (moved from App.tsx) */}
        <nav className="container content-section" aria-label="Breadcrumbs">
          <ol className="breadcrumbs">
            <li className="breadcrumbs__item"><Link to="/">Home</Link></li>
            {location.pathname.startsWith("/amigos") && (
              <li className="breadcrumbs__item"><span>Amigos</span></li>
            )}
          </ol>
        </nav>

        {/* Page content */}
        <div className="container content-section">
          <Outlet />
        </div>
      </main>

      {/* Footer (moved from App.tsx, unchanged) */}
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

      {/* Modals (moved from App.tsx) */}
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

      {/* Toasts (moved from App.tsx) */}
      <div className="toast-container toast-container--top-right" role="region" aria-label="Notifications" />
    </>
  );
};

export default Layout;
