// src/components/Header/SiteHeader.tsx
import React from "react";
import { Link, NavLink } from "react-router-dom";
import useAuthStatus from "@/hooks/useAuthStatus";
import UserMenu from "@/components/Header/UserMenu";
import logoPng from '@/assets/images/home_page/amigos-unite-logo-128.png';

type NavItem = { to: string; label: string };

export interface SiteHeaderProps {
  title?: string;
  logoSrc?: string;
  nav?: NavItem[];
  onLogin?: () => void;
  onSignup?: () => void;
  onLogout?: () => void;
  /** Keep public-only today; you can pass "admin" later on admin routes */
  themeArea?: "public" | "admin";
  profilePath?: string;
}

const SiteHeader: React.FC<SiteHeaderProps> = ({
  title = "Amigos Unite",
  logoSrc = logoPng,
  nav = [
    { to: "/", label: "Home" },
    { to: "/amigos", label: "Amigos" },
  ],
  onLogin,
  onSignup,
  onLogout,
  themeArea = "public",
  profilePath = "/user-profile",
}) => {
  const { isLoggedIn } = useAuthStatus();

  return (
    <header className="site-header site-header--sticky" id="top">
      <div className="site-header__inner">
        <Link className="site-header__logo" aria-label={`${title} – Home`} to="/">
          <img className="site-header__logo-img" src={logoSrc} alt="" />
        </Link>

        <div className="site-title">{title}</div>

        <nav className="main-nav" aria-label="Main">
          {nav.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) => (isActive ? "is-active" : undefined)}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <UserMenu
          isLoggedIn={isLoggedIn}
          onLogin={onLogin ?? (() => document.dispatchEvent(new CustomEvent("auth:login")))}
          onSignup={onSignup ?? (() => document.dispatchEvent(new CustomEvent("auth:signup")))}
          onLogout={onLogout ?? (() => document.dispatchEvent(new CustomEvent("auth:logout")))}
          themeArea={themeArea}
          profilePath={profilePath}
        />
      </div>
    </header>
  );
};

export default SiteHeader;
