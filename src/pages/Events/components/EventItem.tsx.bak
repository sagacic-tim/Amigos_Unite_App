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
    status,
    status_label,
  } = event;

  // Prefer formatted fields from the API; fall back to raw ISO
  const displayDate = formatted_event_date ?? event_date ?? "";
  const displayTime = formatted_event_time ?? event_time ?? "";
  const displayDescription = description || "No description provided.";

  // Fallback label if the API doesn't send status_label for some reason
  const fallbackStatusLabel = (() => {
    if (status_label) return status_label;
    switch (status) {
      case "planning":
        return "Planning";
      case "active":
        return "Active";
      case "completed":
        return "Completed";
      case "canceled":
        return "Canceled";
      default:
        return status || "Unknown";
    }
  })();

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
          {fallbackStatusLabel}
        </p>

        <p className="card__message">{displayDescription}</p>

        <div className="card__actions">
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
