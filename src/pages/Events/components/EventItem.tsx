// src/components/Events/EventItem.tsx
import React from 'react';
import { Event } from '@/types/events';
import styles from "../Events.module.scss";

interface EventItemProps {
  event: Event;
}

const EventItem: React.FC<EventItemProps> = ({ event }) => {
  const speakers = event.event_speakers_performers ?? []; // normalize to []
  const lead = event.lead_coordinator ?? null;           // normalize to null

  return (
    <article className="event-item">
      <h3 className="event-item__title">{event.event_name}</h3>

      {/* Speakers – only render if there are any */}
      {speakers.length > 0 && (
        <p className="event-item__speakers">
          <span className="event-item__label">Speakers:</span>{" "}
          {speakers.join(", ")}
        </p>
      )}

      {/* Lead coordinator – only render if present */}
      {lead && (
        <p className="event-item__lead">
          <span className="event-item__label">Lead coordinator:</span>{" "}
          {lead.first_name || lead.last_name
            ? [lead.first_name, lead.last_name].filter(Boolean).join(" ")
            : lead.user_name}
        </p>
      )}
    </article>
  );
};

export default EventItem;
