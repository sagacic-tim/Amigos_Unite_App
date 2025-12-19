// src/pages/EventDetails/components/EventDetailsItem.tsx
import React from "react";
import type { Event as EventModel } from "@/types/events";
import styles from "../EventDetail.module.scss";
import {formatDateToMMDDYYYY,formatTimeToHHMMAmPm,} from "@/utils/dateFormat";

interface EventDetailsItemProps {
  event: EventModel;
  /**
   * Optional heading id so the wrapper card/modal can reference it.
   * When used from EventItem, this comes from detailsHeadingId.
   */
  headingId?: string;
  /**
   * Optional callback for "View Location".
   * If omitted, this will dispatch a CustomEvent("events:view-location", { detail: { eventId } }).
   */
  onViewLocationClick?: (eventId: number) => void;
}

function formatStatus(status: EventModel["status"], label?: string): string {
  if (label) return label;
  if (!status) return "";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

const EventDetailsItem: React.FC<EventDetailsItemProps> = ({
  event,
  headingId,
  onViewLocationClick,
}) => {
  const {
    id,
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

  // Use headingId from parent (EventItem) if provided, otherwise fall back
  const effectiveHeadingId = headingId ?? `event-details-heading-${id}`;

  const rawDate = formatted_event_date ?? event_date ?? "";
  const rawTime = formatted_event_time ?? event_time ?? "";
  const whenDate = rawDate ? formatDateToMMDDYYYY(rawDate) : "";
  const whenTime = rawTime ? formatTimeToHHMMAmPm(rawTime) : "";

  const speakers =
    event_speakers_performers?.filter(Boolean).join(", ") ?? "";

  const humanStatus = formatStatus(status, status_label);

  const handleViewLocation = () => {
    if (onViewLocationClick) {
      onViewLocationClick(id);
      return;
    }

    // Fallback: event-bus style trigger
    document.dispatchEvent(
      new CustomEvent("events:view-location", {
        detail: { eventId: id },
      }),
    );
  };

  return (
    <article
      className={`card card--details ${styles.eventDetailsCard}`}
      aria-labelledby={effectiveHeadingId}
    >
      <div className="card__body">
        <h3 className="card__title" id={effectiveHeadingId}>
          {event_name}
        </h3>

        {/* Meta line: date · time · type */}
        <p className="card__fields">When: 
          {whenDate && (
            <span className="card__field"> {whenDate}</span>
          )}
          {whenTime && (
            <span className="card__field">
              {whenDate ? " at: " : ""}
              {whenTime}
            </span>
          )}
        </p>
        <p className="card__fields">Kind of event:
          {event_type && (
            <span className="card__field"> {event_type}</span>
          )}
        </p>

        {/* Core fields */}
        <ul className="card__fields">
          <li className="card__field">
            <span className="card__field-label">Status:</span>
            <span>{humanStatus}</span>
          </li>

          {speakers && (
            <li className="card__field">
              <span className="card__field-label">
                Speakers / Performers:
              </span>
              <span>{speakers}</span>
            </li>
          )}
        </ul>

        {/* Description */}
        {description && description.trim().length > 0 && (
          <>
            <h4 className={styles.subheading}>Description</h4>
            <p className="card__message">{description}</p>
          </>
        )}

      </div>

      {/* Actions pinned to bottom via .card__actions */}
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

export default EventDetailsItem;
