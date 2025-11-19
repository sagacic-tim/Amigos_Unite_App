// src/pages/Events/components/EventItem.tsx
import React from "react";
import type { Event } from "@/types/events/EventTypes";

interface EventItemProps {
  event: Event;
}

const EventItem: React.FC<EventItemProps> = ({ event }) => {
  const {
    event_name,
    event_type,
    formatted_event_date,
    formatted_event_time,
    event_date,
    event_time,
    description,
    status_label,
  } = event;

  const displayDate = formatted_event_date ?? event_date ?? "";
  const displayTime = formatted_event_time ?? event_time ?? "";
  const displayDescription = description || "No description provided.";

  return (
    <article className="card card--profile">
      <div className="card__body">
        <h3 className="card__title">{event_name}</h3>

        <p className="card__subtitle">
          {displayDate && displayTime
            ? `Scheduled for ${displayDate} at ${displayTime}`
            : displayDate
            ? `Scheduled for ${displayDate}`
            : displayTime
            ? `Scheduled at ${displayTime}`
            : "Schedule not yet set"}
        </p>

        {event_type && (
          <p className="card__field">
            <span className="card__field-label">Type:</span>
            {event_type}
          </p>
        )}

        <p className="card__field">
          <span className="card__field-label">Status:</span>
          {status_label}
        </p>

        <p className="card__message">{displayDescription}</p>

        <div className="card__actions">
          {/* These buttons hook into your future flows */}
          <button
            type="button"
            className="button button--secondary"
            // onClick={... open Event details modal later ...}
          >
            View Details
          </button>

          <button
            type="button"
            className="button button--secondary"
            disabled
            title="Location details coming soon"
          >
            View Location
          </button>

          {/* Later: show only if user manages the event */}
          <button
            type="button"
            className="button button--primary"
            disabled
            title="Edit event coming soon"
          >
            Edit Event
          </button>
        </div>
      </div>
    </article>
  );
};

export default EventItem;
