// src/components/Header/EventsMenu.tsx
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

type Props = {
  isLoggedIn: boolean;
  hasManagedEvents: boolean;      // true if user is admin/lead/assistant on any event
  onOpenCreateEvent?: () => void; // opens your create-event modal
};

const EventsMenu: React.FC<Props> = ({ isLoggedIn, hasManagedEvents, onOpenCreateEvent }) => {
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

  const items: Array<{ label: string; to?: string; onClick?: () => void; first?: boolean }> = [
    { label: "View Events", to: "/events", first: true },
  ];
  if (isLoggedIn && hasManagedEvents) items.push({ label: "Manage My Events", to: "/events/manage" });
  if (isLoggedIn) items.push({ label: "Create New Event", onClick: onOpenCreateEvent });

  return (
    <div className="events-menu">
      <button
        ref={btnRef}
        className="events-menu__toggle"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls="events-menu-panel"
        onClick={() => setOpen(v => !v)}
        type="button"
        title="Events"
      >
        <i className="fa-solid fa-calendar-days" aria-hidden="true" />
        <span className="visually-hidden">Events</span>
      </button>

      {open && (
        <div className="events-menu__panel" id="events-menu-panel" role="menu" ref={panelRef}>
          <div className="events-menu__section" aria-label="Events">
            <div className="events-menu__label">Events</div>
            <ul className="events-menu__list">
              {items.map((it) => (
                <li key={it.label}>
                  {it.to ? (
                    <Link
                      to={it.to}
                      role="menuitem"
                      className="events-menu__item"
                      onClick={() => setOpen(false)}
                      ref={it.first ? firstItemRef : undefined}
                    >
                      {it.label}
                    </Link>
                  ) : (
                    <a
                      href="#create-event"
                      role="menuitem"
                      className="events-menu__item"
                      onClick={(e) => { e.preventDefault(); it.onClick?.(); setOpen(false); }}
                      ref={it.first ? firstItemRef : undefined}
                    >
                      {it.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsMenu;
