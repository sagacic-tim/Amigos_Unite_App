
// src/pages/Events/EventDetails/components/EventDetailCard.tsx
import React from "react";
import type { Event } from "@/types/events";

type Props = {
  event: Event;
};

function formatStatus(status: Event["status"], statusLabel?: string): string {
  if (statusLabel) return statusLabel;
  if (!status) return "";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

const EventDetailCard: React.FC<Props> = ({ event }) => {
  const {
    event_name,
    event_date,
    event_time,
    status,
    status_label,
    event_type,
    event_speakers_performers,
    description,
    formatted_event_date,
    formatted_event_time,
  } = event;

  const whenDate = formatted_event_date ?? event_date;
  const whenTime =
    formatted_event_time ??
    (event_time && event_time.length >= 5 ? event_time.slice(0, 5) : event_time);

  const speakers =
    event_speakers_performers?.filter(Boolean).join(", ") ?? "";

  const humanStatus = formatStatus(status, status_label);

  const handleViewLocation = () => {
    // Future integration point – safe no-op until a listener exists.
    document.dispatchEvent(
      new CustomEvent("events:view-location", {
        detail: { eventId: event.id },
      }),
    );
  };

  return (
    <article className="card card--details">
      <div className="card__body">
        <h3 className="card__title">{event_name}</h3>

        <p>
          {whenDate && <span>{whenDate}</span>}
          {whenTime && (
            <span>
              {whenDate ? " • " : ""}
              {whenTime}
            </span>
          )}
          {event_type && (
            <span>
              {(whenDate || whenTime) ? " • " : ""}
              {event_type}
            </span>
          )}
        </p>

        <ul className="card__fields">
          <li className="card__field">
            <span className="card__field-label">Status:</span>
            <span>{humanStatus}</span>
          </li>

          {speakers && (
            <li className="card__field">
              <span className="card__field-label">Speakers / Performers:</span>
              <span>{speakers}</span>
            </li>
          )}
        </ul>

        {description && description.trim().length > 0 && (
          <>
            <h4>Description</h4>
            <p className="card__message">{description}</p>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="card__actions">
        <button
          type="button"
          className="button button--secondary"
          onClick={handleViewLocation}
        >
          View Location
        </button>
      </div>
    </article>
  );
};

export default EventDetailCard;
