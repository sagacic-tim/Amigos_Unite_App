// src/components/modals/EventDetailModal.tsx
import React, { useEffect, useState } from "react";
import { EventService } from "@/services/EventService";
import type { Event } from "@/types/events";
import Modal from "@/components/modals/modal";

type DetailEvent = CustomEvent<{ eventId: number }>;

const EventDetailModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [eventId, setEventId] = useState<number | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Open on "events:view-details"
  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as DetailEvent;
      const id = custom.detail?.eventId;
      if (!id) return;

      setIsOpen(true);
      setEventId(id);
      setEvent(null);
      setError(null);
      setLoading(true);

      EventService.fetchEvent(id)
        .then((data) => setEvent(data))
        .catch((err: any) => {
          const msg =
            err?.response?.data?.error ||
            err?.response?.data?.message ||
            err?.message ||
            "Unable to load event details.";
          setError(msg);
        })
        .finally(() => setLoading(false));
    };

    document.addEventListener("events:view-details", handler as EventListener);
    return () =>
      document.removeEventListener(
        "events:view-details",
        handler as EventListener,
      );
  }, []);

  const close = () => {
    setIsOpen(false);
    setEventId(null);
    setEvent(null);
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={close} titleId="event-detail-title">
      <header className="modal__header">
        <h2 id="event-detail-title">
          Event Details{event ? ` – ${event.event_name}` : ""}
        </h2>
      </header>

      {loading && <p>Loading event details…</p>}

      {error && !loading && (
        <div className="alert alert--error" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && event && <EventDetailItem event={event} />}

      {!loading && !error && !event && (
        <p>Event with ID {eventId ?? "?"} could not be loaded.</p>
      )}

      <footer className="modal__footer">
        <button type="button" className="btn" onClick={close}>
          Close
        </button>
      </footer>
    </Modal>
  );
};

export default EventDetailsItem;
