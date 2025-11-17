// src/components/Footer/SiteFooter.tsx
import { Link } from 'react-router-dom';

export default function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <nav className="site-footer__nav" aria-label="Footer">
          <Link className="site-footer__nav__item" to="/about">About</Link>
          <Link className="site-footer__nav__item" to="/contact">Contact</Link>
          <a className="site-footer__nav__item" href="https://github.com/" target="_blank" rel="noreferrer">GitHub</a>
        </nav>
        <div className="site-footer__copy">© {year} Amigos Unite</div>
      </div>
    </footer>
  );
}
