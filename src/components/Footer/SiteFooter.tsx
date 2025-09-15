
// src/components/Footer/SiteFooter.tsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <nav className="site-footer__nav" aria-label="Footer">
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          <a href="https://github.com/" target="_blank" rel="noreferrer">GitHub</a>
        </nav>
        <div className="site-footer__copy">© {year} Amigos Unite</div>
      </div>
    </footer>
  );
}
