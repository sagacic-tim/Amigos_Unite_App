// src/layout/navigation/events-menu-overlay.tsx
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

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
  const panelRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(
    null
  );

  // Compute fixed position directly under the "Events" anchor
  useLayoutEffect(() => {
    if (!open || !anchorRef.current) return;

    const rect = anchorRef.current.getBoundingClientRect();
    setPosition({
      top: rect.bottom + 14, // 4px gap under the link
      left: rect.left,
    });
  }, [open, anchorRef]);

  // Click outside -> close
  useEffect(() => {
    if (!open) return;

    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        panelRef.current &&
        !panelRef.current.contains(target) &&
        !anchorRef.current?.contains(target)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose, anchorRef]);

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
      <div className="nav-menu__section ">
        <div className="nav-menu__label">Events</div>
        <ul className="nav-menu__list ">
          <li>
            <Link to="/events" onClick={onClose} className="nav-menu__item">
              View Events
            </Link>
          </li>

          {isLoggedIn && hasManagedEvents && (
            <li>
              <Link
                to="/events/manage"
                onClick={onClose}
                className="nav-menu__item"
              >
                Manage My Events
              </Link>
            </li>
          )}

          {isLoggedIn && (
            <li>
              <Link to="/manage-events" onClick={onClose} className="nav-menu__item">
                Create New Event
              </Link>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default EventsMenuOverlay;
