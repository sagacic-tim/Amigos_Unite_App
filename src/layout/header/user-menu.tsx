// src/components/Header/UserMenu.tsx
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";// or "@/components/UserProfile/ThemeSwitcher"
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

type Props = {
  /** <- add this */
  isLoggedIn: boolean;
  onLogin?: () => void;
  onSignup?: () => void;
  onLogout?: () => void;
  themeArea?: "public" | "admin";
  profilePath?: string;
};

const UserMenu: React.FC<Props> = ({
  isLoggedIn,
  onLogin,
  onSignup,
  onLogout,
  themeArea = "public",
  profilePath = "/user-profile",
}) => {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const firstItemRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!panelRef.current || !btnRef.current) return;
      if (!panelRef.current.contains(t) && !btnRef.current.contains(t)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    const keyHandler = (e: KeyboardEvent) => {
      if (open && e.key === "Escape") {
        setOpen(false);
        btnRef.current?.focus();
      }
    };
    document.addEventListener("keydown", keyHandler);
    if (open) firstItemRef.current?.focus();
    return () => document.removeEventListener("keydown", keyHandler);
  }, [open]);

  return (
    <div className="user-menu">
      <button
        ref={btnRef}
        className="user-menu__toggle"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls="user-menu-panel"
        onClick={() => setOpen(v => !v)}
        type="button"
        title="Account & theme"
      >
        <i className="fa-solid fa-user" aria-hidden="true" />
        <span className="visually-hidden">Account &amp; theme</span>
      </button>

      {open && (
        <div className="user-menu__panel" id="user-menu-panel" role="menu" ref={panelRef}>
          <div className="user-menu__section" aria-label="Account">
            <div className="user-menu__label">Account</div>
            <ul className="user-menu__list">
              {isLoggedIn ? (
                <>
                  <li>
                    <Link
                      to={profilePath}
                      role="menuitem"
                      className="user-menu__item"
                      onClick={() => setOpen(false)}
                      ref={firstItemRef}
                    >
                      Profile
                    </Link>
                  </li>
                  <li>
                    <a
                      href="#logout"
                      role="menuitem"
                      className="user-menu__item"
                      onClick={(e) => {
                        e.preventDefault();
                        onLogout?.();
                        setOpen(false);
                      }}
                    >
                      Logout
                    </a>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <a
                      href="#login"
                      role="menuitem"
                      className="user-menu__item"
                      onClick={(e) => { e.preventDefault(); onLogin?.(); setOpen(false); }}
                      ref={firstItemRef}
                    >
                      Login
                    </a>
                  </li>
                  <li>
                    <a
                      href="#signup"
                      role="menuitem"
                      className="user-menu__item"
                      onClick={(e) => { e.preventDefault(); onSignup?.(); setOpen(false); }}
                    >
                      Signup
                    </a>
                  </li>
                </>
              )}
            </ul>
          </div>

          <hr className="user-menu__divider" />

          <div className="user-menu__section" aria-label="Theme">
            <div className="user-menu__label">Theme</div>
            <div className="user-menu__palette">
              <ThemeSwitcher area={themeArea} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
