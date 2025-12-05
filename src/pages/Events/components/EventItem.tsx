// src/pages/Events/components/EventItem.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import type { Event } from "@/types/events/EventTypes";
import UniversalModal from "@/components/modals/UniversalModal";
import UniversalCard from "@/components/cards/UniversalCard";
import EventDetailsItem from "@/pages/EventDetails/components/EventDetailsItem";

interface EventItemProps {
  event: Event;
  mode?: "public" | "manage";
  onDelete?: (event: Event) => void;
}

const EventItem: React.FC<EventItemProps> = ({
  event,
  mode = "public",
  onDelete,
}) => {
  const {
    id,
    event_name,
    event_type,
    formatted_event_date,
    formatted_event_time,
    event_date,
    event_time,
    description,
    status,
    status_label,
    // This is already used in EditEventPage, so it should exist on Event
    primary_event_location,
  } = event as Event & {
    primary_event_location?: any | null; // type is EventLocation in your types
  };

  // Modal state
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);

  const detailsHeadingId = `event-details-heading-${id}`;
  const locationHeadingId = `event-location-heading-${id}`;

  const displayDate = formatted_event_date ?? event_date ?? "";
  const displayTime = formatted_event_time ?? event_time ?? "";
  const displayDescription = description || "No description provided.";

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

  const hasPrimaryLocation = !!primary_event_location;

  const handleOpenDetailsModal = () => setIsDetailsOpen(true);

  const handleOpenLocationModal = () => {
    if (!hasPrimaryLocation) return;
    setIsLocationOpen(true);
  };

  const handleCloseModals = () => {
    setIsDetailsOpen(false);
    setIsLocationOpen(false);
  };

  // Used when the user clicks "View Location" **inside** the details modal
  const handleViewLocationFromDetails = () => {
    setIsDetailsOpen(false);
    if (hasPrimaryLocation) {
      setIsLocationOpen(true);
    }
  };

  return (
    <>
      {/* Summary card in the Events grid */}
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

          {/* Ensure .card__actions has margin-top: auto in SCSS so it pins to the bottom */}
          <div className="card__actions">
            <button
              type="button"
              className="button button--secondary"
              onClick={handleOpenDetailsModal}
            >
              View Details
            </button>

            <button
              type="button"
              className="button button--secondary"
              onClick={handleOpenLocationModal}
              disabled={!hasPrimaryLocation}
              title={
                hasPrimaryLocation
                  ? undefined
                  : "Location details coming soon"
              }
            >
              View Location
            </button>

            {mode === "manage" && (
              <>
                <Link
                  to={`/events/${id}/edit`}
                  className="button button--primary"
                >
                  Edit Event
                </Link>

                <button
                  type="button"
                  className="button button--danger"
                  onClick={() => onDelete?.(event)}
                >
                  Delete Event
                </button>
              </>
            )}
          </div>
        </div>
      </article>

      {/* Details modal */}
      <UniversalModal
        isOpen={isDetailsOpen}
        onClose={handleCloseModals}
        titleId={detailsHeadingId}
      >
        <UniversalCard titleId={detailsHeadingId}>
          <EventDetailsItem
            event={event}
            headingId={detailsHeadingId}
            onViewLocationClick={() => {
              // Close details → open location, if available
              handleViewLocationFromDetails();
            }}
          />
        </UniversalCard>
      </UniversalModal>

      {/* Location modal (uses primary_event_location if present) */}
      <UniversalModal
        isOpen={isLocationOpen}
        onClose={handleCloseModals}
        titleId={locationHeadingId}
      >
        <UniversalCard titleId={locationHeadingId}>
          {hasPrimaryLocation ? (
            <>
              <h3 className="card__title" id={locationHeadingId}>
                {primary_event_location.business_name ||
                  "Primary Event Location"}
              </h3>

              <ul className="card__fields">
                <li className="card__field">
                  <span className="card__field-label">Address:</span>
                  <span>{primary_event_location.address ?? "—"}</span>
                </li>

                {primary_event_location.city && (
                  <li className="card__field">
                    <span className="card__field-label">City:</span>
                    <span>{primary_event_location.city}</span>
                  </li>
                )}

                {primary_event_location.state_province && (
                  <li className="card__field">
                    <span className="card__field-label">State/Province:</span>
                    <span>{primary_event_location.state_province}</span>
                  </li>
                )}

                {primary_event_location.country && (
                  <li className="card__field">
                    <span className="card__field-label">Country:</span>
                    <span>{primary_event_location.country}</span>
                  </li>
                )}

                {primary_event_location.postal_code && (
                  <li className="card__field">
                    <span className="card__field-label">Postal Code:</span>
                    <span>{primary_event_location.postal_code}</span>
                  </li>
                )}

                {primary_event_location.availability_notes && (
                  <li className="card__field prose">
                    <span className="card__field-label">
                      Availability Notes:
                    </span>
                    <span>{primary_event_location.availability_notes}</span>
                  </li>
                )}
              </ul>
            </>
          ) : (
            <p className="card__message">
              No primary location has been set for this event yet.
            </p>
          )}
        </UniversalCard>
      </UniversalModal>
    </>
  );
};

export default EventItem;
