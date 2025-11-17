// src/layout/navigation/main-nav-bar.tsx
import React, { useCallback } from "react";
import { NavLink } from "react-router-dom";

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
      // All other items behave as normal NavLinks
    },
    [onEventsToggle]
  );

  return (
    <nav className="main-nav" aria-label="Main">
      {nav.map(({ to, label }) => (
        <NavLink
          key={label}
          to={to}
          end={to === "/"} // can tweak; or remove `end` if not desired
          className={({ isActive }) =>
            isActive ? "main-nav__item is-active" : "main-nav__item"
          }
          ref={label === "Events" ? eventsAnchorRef : undefined}
          onClick={(e) => handleClick(e, label, to)}
        >
          {label}
        </NavLink>
      ))}
    </nav>
  );
};

export default MainNavBar;
