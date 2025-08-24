
import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";

type NavItem = { to: string; label: string };

interface SiteHeaderProps {
  title?: string;
  logoSrc?: string;
  nav?: NavItem[];
  // Optional callbacks (use your own useAuth or modals here)
  onLogin?: () => void;
  onSignup?: () => void;
  onLogout?: () => void;
  onSetThemeMode?: (mode: "light" | "dark") => void;
  onSetPalette?: (palette: "blue" | "earth-tones") => void;
}

export const SiteHeader: React.FC<SiteHeaderProps> = ({
  title = "Amigos Unite",
  logoSrc = "/src/assets/images/home_page/amigos-unite-logo-128.png",
  nav = [
    { to: "/", label: "Home" },
    { to: "/amigos", label: "Amigos" },
  ],
  onLogin,
  onSignup,
  onLogout,
  onSetThemeMode,
  onSetPalette,
}) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  // Close on outside click / Esc
  useEffect(() => {
    function handleDocClick(e: MouseEvent) {
      if (!open) return;
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === "Escape") {
        setOpen(false);
        btnRef.current?.focus();
      }
    }
    document.addEventListener("click", handleDocClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("click", handleDocClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  // Default event dispatchers if no callbacks are provided (keeps header decoupled)
  const emit = (name: string, detail?: any) =>
    document.dispatchEvent(new CustomEvent(name, { detail }));

  const handleThemeMode = (mode: "light" | "dark") => {
    onSetThemeMode ? onSetThemeMode(mode) : emit("theme:mode", { mode });
    setOpen(false);
  };

  const handlePalette = (palette: "blue" | "earth-tones") => {
    onSetPalette ? onSetPalette(palette) : emit("theme:palette", { palette });
  };

  const handleLogin = () => {
    onLogin ? onLogin() : emit("auth:login");
    setOpen(false);
  };
  const handleSignup = () => {
    onSignup ? onSignup() : emit("auth:signup");
    setOpen(false);
  };
  const handleLogout = () => {
    onLogout ? onLogout() : emit("auth:logout");
    setOpen(false);
  };

  return (
    <header className="site-header site-header--sticky" id="top">
      <div className="site-header__inner">
        <Link className="site-header__logo" aria-label={`${title} – Home`} to="/">
          {/* self-closing img in JSX and alt is required */}
          <img className="site-header__logo-img" src={logoSrc} alt="" />
        </Link>

        <div className="site-title">{title}</div>

        <nav className="main-nav" aria-label="Main">
          {nav.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => (isActive ? "is-active" : undefined)}
              end
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="user-menu" ref={menuRef}>
          <button
            ref={btnRef}
            className="user-menu__toggle"
            aria-expanded={open}
            aria-haspopup="menu"
            aria-controls="user-menu-panel"
            onClick={() => setOpen((v) => !v)}
            type="button"
          >
            {/* Font Awesome via <i> requires the FA CSS present in index.html */}
            <i className="fa-solid fa-user" aria-hidden="true" />
            <span className="visually-hidden">Account &amp; theme</span>
          </button>

          {open && (
            <div className="user-menu__panel" id="user-menu-panel" role="menu">
              {/* Account FIRST */}
              <div className="user-menu__section" aria-label="Account">
                <div className="user-menu__label">Account</div>
                <ul className="user-menu__list">
                  <li>
                    <a
                      href="#login"
                      role="menuitem"
                      className="user-menu__item"
                      onClick={(e) => {
                        e.preventDefault();
                        handleLogin();
                      }}
                    >
                      Login
                    </a>
                  </li>
                  <li>
                    <a
                      href="#signup"
                      role="menuitem"
                      className="user-menu__item"
                      onClick={(e) => {
                        e.preventDefault();
                        handleSignup();
                      }}
                    >
                      Signup
                    </a>
                  </li>
                  <li>
                    <a
                      href="#logout"
                      role="menuitem"
                      className="user-menu__item"
                      onClick={(e) => {
                        e.preventDefault();
                        handleLogout();
                      }}
                    >
                      Logout
                    </a>
                  </li>
                </ul>
              </div>

              <hr className="user-menu__divider" />

              {/* Theme SECOND */}
              <div className="user-menu__section" aria-label="Theme">
                <div className="user-menu__label">Theme</div>
                <ul className="user-menu__list">
                  <li>
                    <a
                      href="#light"
                      role="menuitem"
                      className="user-menu__item"
                      onClick={(e) => {
                        e.preventDefault();
                        handleThemeMode("light");
                      }}
                    >
                      Light
                    </a>
                  </li>
                  <li>
                    <a
                      href="#dark"
                      role="menuitem"
                      className="user-menu__item"
                      onClick={(e) => {
                        e.preventDefault();
                        handleThemeMode("dark");
                      }}
                    >
                      Dark
                    </a>
                  </li>

                  {/* Palette as select for compact a11y (swap to links if preferred) */}
                  <li className="user-menu__palette">
                    <label className="visually-hidden" htmlFor="user-menu-palette">
                      Palette
                    </label>
                    <select
                      id="user-menu-palette"
                      className="user-menu__select"
                      aria-label="Palette"
                      onChange={(e) =>
                        handlePalette(e.currentTarget.value as "blue" | "earth-tones")
                      }
                      defaultValue="blue"
                    >
                      <option value="blue">Blue</option>
                      <option value="earth-tones">Earth Tones</option>
                    </select>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default SiteHeader;
