// src/layout/navigation/main-nav-bar.tsx
import React, { useCallback } from "react";
import { NavLink, useLocation } from "react-router-dom";

export type NavItem = { to: string; label: string };

export interface MainNavBarProps {
  nav: NavItem[];
  onEventsToggle?: () => void;
  /** Anchor ref used to position the Events dropdown directly under the label */
  eventsAnchorRef?: React.RefObject<HTMLAnchorElement>;
}

const MainNavBar: React.FC<MainNavBarProps> = ({
  nav,
  onEventsToggle,
  eventsAnchorRef,
}) => {
  const location = useLocation();

  // Any route under /events should light up the "Events" badge
  const isEventsSectionActive = location.pathname.startsWith("/events");

  const handleClick = useCallback(
    (
      e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
      label: string,
      to: string
    ) => {
      if (label === "Events") {
        // Treat "Events" as a dropdown trigger instead of navigation
        e.preventDefault();
        onEventsToggle?.();
      }
      // all other items behave as usual
    },
    [onEventsToggle]
  );

  return (
    <nav className="main-nav" aria-label="Main">
      {nav.map(({ to, label }) => {
        if (label === "Events") {
          // Pure trigger, styled like a nav item and manually “active” for /events*
          const className =
            "main-nav__item" + (isEventsSectionActive ? " is-active" : "");

          return (
            <a
              key="events"
              href="#events"
              ref={eventsAnchorRef}
              className={className}
              onClick={(e) => handleClick(e, label, to)}
            >
              {label}
            </a>
          );
        }

        // Normal navigation items use NavLink, so they get automatic active state
        return (
          <NavLink
            key={label}
            to={to}
            end={to === "/"} // keep Home exact, others can match prefixes
            className={({ isActive }) =>
              isActive ? "main-nav__item is-active" : "main-nav__item"
            }
          >
            {label}
          </NavLink>
        );
      })}
    </nav>
  );
};

export default MainNavBar;
