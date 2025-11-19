// src/layout/navigation/events-menu-overlay.tsx
import React from "react";
import { Link } from "react-router-dom";
import { useNavDropdownPosition } from "@/hooks/use-nav-dropdown-position";

interface EventsMenuOverlayProps {
  open: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
  hasManagedEvents: boolean;
  onOpenCreateEvent: () => void;
  anchorRef: React.RefObject<HTMLAnchorElement>;
}

const EventsMenuOverlay: React.FC<EventsMenuOverlayProps> = ({
  open,
  onClose,
  isLoggedIn,
  hasManagedEvents,
  onOpenCreateEvent,
  anchorRef,
}) => {
  const { panelRef, firstItemRef, position } = useNavDropdownPosition(
    anchorRef,
    open,
    onClose,
    {
      offset: 14,     // 14px below the anchor
      panelWidth: 280 // matches your SCSS max-width
    }
  );

  if (!open || !position) return null;

  return (
    <div
      ref={panelRef}
      className="nav-menu__panel"
      style={{
        position: "fixed",
        top: position.top,
        left: position.left,
      }}
      role="menu"
      aria-label="Events"
    >
      <div className="nav-menu__section">
        <div className="nav-menu__label">Events</div>
        <ul className="nav-menu__list">
          <li>
            <Link
              to="/events"
              onClick={onClose}
              className="nav-menu__item"
              role="menuitem"
              ref={firstItemRef as React.RefObject<HTMLAnchorElement>}
            >
              View Events
            </Link>
          </li>

          {isLoggedIn && hasManagedEvents && (
            <li>
              <Link
                to="/events/manage"
                onClick={onClose}
                className="nav-menu__item"
                role="menuitem"
              >
                Manage My Events
              </Link>
            </li>
          )}

          {isLoggedIn && (
            <li>
              <button
                type="button"
                className="nav-menu__item nav-menu__item--button"
                role="menuitem"
                onClick={() => {
                  onOpenCreateEvent();
                  onClose();
                }}
              >
                Create New Event
              </button>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default EventsMenuOverlay;
