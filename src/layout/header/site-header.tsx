// src/layout/header/site-header.tsx
import React from "react";
import { Link } from "react-router-dom";

import useAuthStatus from "@/hooks/useAuthStatus";
import { useManagedEventsFlag } from "@/hooks/useManagedEventsFlag";

import MainNavBar, { NavItem } from "@/layout/navigation/main-nav-bar";
import EventsMenuOverlay from "@/layout/navigation/events-nav-dropdown";
import UserMenu from "@/layout/header/user-menu-dropdown";

import logoPng from "@/assets/images/home_page/amigos-unite-logo-128.png";

export interface SiteHeaderProps {
  title?: string;
  logoSrc?: string;
  nav?: NavItem[];
  onLogin?: () => void;
  onSignup?: () => void;
  onLogout?: () => void;
  onOpenCreateEvent?: () => void;
  themeArea?: "public" | "admin";
  profilePath?: string;
}

const SiteHeader: React.FC<SiteHeaderProps> = ({
  title = "Amigos Unite",
  logoSrc = logoPng,
  nav = [
    { to: "/", label: "Home" },
    { to: "/amigos", label: "Amigos" },
    { to: "#events", label: "Events" }, // ← ensure Events is present by default
  ],
  onLogin,
  onSignup,
  onLogout,
  onOpenCreateEvent,
  themeArea = "public",
  profilePath = "/user-profile",
}) => {
  const { isLoggedIn } = useAuthStatus();
  const hasManagedEvents = useManagedEventsFlag(isLoggedIn);

  const [eventsOpen, setEventsOpen] = React.useState(false);
  const eventsAnchorRef = React.useRef<HTMLAnchorElement>(null);

  const toggleEvents = () => setEventsOpen((v) => !v);
  const closeEvents = () => setEventsOpen(false);

  // Default create-event handler: keep CustomEvent behaviour
  const openCreateEvent =
    onOpenCreateEvent ??
    (() => {
      document.dispatchEvent(new CustomEvent("events:create"));
    });

  return (
    <header className="site-header site-header--sticky" id="top">
      <div className="site-header__inner">
        <Link
          className="site-header__logo"
          aria-label={`${title} – Home`}
          to="/"
        >
          <img className="site-header__logo-img" src={logoSrc} alt="" />
        </Link>

        <div className="site-title">{title}</div>

        {/* Main nav including "Events" as a label-driven dropdown trigger */}
        <MainNavBar
          nav={nav}
          onEventsToggle={toggleEvents}
          eventsAnchorRef={eventsAnchorRef}
        />

        {/* Your existing UserMenu kept intact */}
        <UserMenu
          isLoggedIn={isLoggedIn}
          onLogin={
            onLogin ??
            (() => document.dispatchEvent(new CustomEvent("auth:login")))
          }
          onSignup={
            onSignup ??
            (() => document.dispatchEvent(new CustomEvent("auth:signup")))
          }
          onLogout={
            onLogout ??
            (() => document.dispatchEvent(new CustomEvent("auth:logout")))
          }
          themeArea={themeArea}
          profilePath={profilePath}
        />
      </div>

      {/* Floating Events overlay that appears over the nav bar, no backdrop */}
      <EventsMenuOverlay
        open={eventsOpen}
        onClose={closeEvents}
        isLoggedIn={isLoggedIn}
        hasManagedEvents={hasManagedEvents}
        onOpenCreateEvent={openCreateEvent}
        anchorRef={eventsAnchorRef}
      />
    </header>
  );
};

export default SiteHeader;
