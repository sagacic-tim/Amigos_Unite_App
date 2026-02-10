// src/components/Footer/SiteFooter.tsx
import { Link } from "react-router-dom";

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <nav className="site-footer__nav" aria-label="Footer">
          <div className="site-footer__column-1">
            <Link className="site-footer__nav__item" to="/about">
              About
            </Link>

            <Link className="site-footer__nav__item" to="/contact">
              Contact
            </Link>
          </div>

          <div className="site-footer__column-2">
            <a
              className="site-footer__nav__item"
              href="https://github.com/sagacic-tim/Amigos_Unite_App"
              target="_blank"
              rel="noopener noreferrer"
            >
              AmigosUniteApp (Frontend)
            </a>

            <a
              className="site-footer__nav__item"
              href="https://github.com/sagacic-tim/Amigos_Unite_Api"
              target="_blank"
              rel="noopener noreferrer"
            >
              AmigosUniteApi (Backend)
            </a>
          </div>

          <div className="site-footer__column-3">
            <p className="site-footer__copy">© {year} Amigos Unite</p>
          </div>
        </nav>
      </div>
    </footer>
  );
}
