// src/layout/header/user-menu.tsx
import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { useNavDropdownPosition } from "@/hooks/use-nav-dropdown-position";

type Props = {
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
  const anchorRef = useRef<HTMLButtonElement>(null);

  const close = () => setOpen(false);
  const toggle = () => setOpen((v) => !v);

  const { panelRef, firstItemRef, position } = useNavDropdownPosition(
    anchorRef,
    open,
    close,
    {
      offset: 8,
      panelWidth: 280,
    }
  );

  return (
    <div className="nav-menu nav-menu--user">
      <button
        ref={anchorRef}
        className="nav-menu__toggle"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls="user-menu-panel"
        onClick={toggle}
        type="button"
        title="Account & theme"
      >
        <i className="fa-solid fa-user" aria-hidden="true" />
        <span className="visually-hidden">Account &amp; theme</span>
      </button>

      {open && position && (
        <div
          ref={panelRef}
          className="nav-menu__panel"
          id="user-menu-panel"
          role="menu"
          style={{
            position: "fixed",
            top: position.top,
            left: position.left,
          }}
        >
          {/* Account section */}
          <div className="nav-menu__section" aria-label="Account">
            <div className="nav-menu__label">Account</div>
            <ul className="nav-menu__list">
              {isLoggedIn ? (
                <>
                  <li>
                    <Link
                      to={profilePath}
                      role="menuitem"
                      className="nav-menu__item"
                      onClick={close}
                      ref={firstItemRef as React.RefObject<HTMLAnchorElement>}
                    >
                      Profile
                    </Link>
                  </li>
                  <li>
                    <button
                      type="button"
                      role="menuitem"
                      className="nav-menu__item nav-menu__item--button"
                      onClick={() => {
                        onLogout?.();
                        close();
                      }}
                    >
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <button
                      type="button"
                      role="menuitem"
                      className="nav-menu__item nav-menu__item--button"
                      onClick={() => {
                        onLogin?.();
                        close();
                      }}
                      ref={firstItemRef as React.RefObject<HTMLButtonElement>}
                    >
                      Login
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      role="menuitem"
                      className="nav-menu__item nav-menu__item--button"
                      onClick={() => {
                        onSignup?.();
                        close();
                      }}
                    >
                      Signup
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>

          <hr className="nav-menu__divider" />

          {/* Theme section */}
          <div className="nav-menu__section" aria-label="Theme">
            <div className="nav-menu__label">Theme</div>
            <div className="nav-menu__palette">
              <ThemeSwitcher area={themeArea} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
