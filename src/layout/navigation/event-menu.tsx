// src/layout/navigation/event-menu.tsx
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

type EventMenuProps = {
  isLoggedIn: boolean;
  hasManagedEvents: boolean;
  onOpenCreateEvent?: () => void;
};

/**
 * Events dropdown used inside MainNavBar.
 *
 * - Renders an "Events" badge as a main-nav item.
 * - Shows a dropdown panel positioned just below that badge.
 * - No full-screen backdrop: this is a true nav dropdown, not a modal.
 */
const EventMenu: React.FC<EventMenuProps> = ({
  isLoggedIn,
  hasManagedEvents,
  onOpenCreateEvent,
}) => {
  const [open, setOpen] = useState(false);

  // Wrapper ref is used for click-outside detection
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // Default to your global CustomEvent if no handler passed
  const openCreateEvent = onOpenCreateEvent ?? (() => {
    document.dispatchEvent(new CustomEvent("events:create"));
  });

  // Close when clicking outside the wrapper
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const items: Array<{ label: string; to?: string; onClick?: () => void }> = [
    { label: "View Events", to: "/events" },
  ];

  if (isLoggedIn && hasManagedEvents) {
    items.push({ label: "Manage My Events", to: "/events/manage" });
  }

  if (isLoggedIn) {
    items.push({ label: "Create New Event", onClick: openCreateEvent });
  }

  return (
    <div className="events-menu" ref={wrapperRef}>
      {/* Badge-like trigger in the main nav */}
      <button
        type="button"
        className="main-nav__item main-nav__item--events"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls="events-menu-panel"
        onClick={() => setOpen((prev) => !prev)}
      >
        Events
      </button>

      {open && (
        <div
          id="events-menu-panel"
          role="menu"
          className="events-menu__panel"
        >
          <div className="events-menu__header">Events</div>
          <ul className="events-menu__list">
            {items.map((item) => (
              <li key={item.label} className="events-menu__list-item">
                {item.to ? (
                  <Link
                    to={item.to}
                    className="events-menu__item"
                    role="menuitem"
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <button
                    type="button"
                    className="events-menu__item"
                    role="menuitem"
                    onClick={() => {
                      item.onClick?.();
                      setOpen(false);
                    }}
                  >
                    {item.label}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default EventMenu;
