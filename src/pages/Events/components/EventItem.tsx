// src/pages/Events/components/EventItem.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import type { Event, EventLocation } from "@/types/events";
import { EventService } from "@/services/EventService";
import UniversalModal from "@/components/modals/UniversalModal";
import UniversalCard from "@/components/cards/UniversalCard";
import EventDetailsItem from "@/pages/EventDetails/components/EventDetailsItem";
import EventLocationItem from "@/pages/EventLocations/components/EventLocationItem";
import { formatDateToMMDDYYYY, formatTimeToHHMMAmPm } from "@/utils/dateFormat";
import useAuthStatus from "@/hooks/useAuthStatus";

export interface EventItemProps {
  event: Event;
  mode?: "public" | "manage";
  onDelete?: (event: Event) => void;
}

type EventWithLocation = Event & {
  primary_event_location?: EventLocation | null;
};

const EventItem: React.FC<EventItemProps> = ({
  event,
  mode = "public",
  onDelete,
}) => {
  const { isLoggedIn, amigo } = useAuthStatus();

  // Is the logged-in amigo the lead coordinator for this event?
  const isLeadCoordinator =
    !!amigo && event.lead_coordinator_id === amigo.id;

  // Only allow registration in public mode, when logged in, and not the lead coordinator
  const canRegister = mode === "public" && isLoggedIn && !isLeadCoordinator;

  // Base event from the index (no location hydrated)
  const baseEvent = event as EventWithLocation;

  // Hydrated event (from /events/:id show) – includes primary_event_location
  const [fullEvent, setFullEvent] = useState<EventWithLocation | null>(null);

  // Modal state
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);

  // NEW: registration UX state
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  const effectiveEvent: EventWithLocation = fullEvent ?? baseEvent;
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
    primary_event_location,
  } = effectiveEvent;

  const detailsHeadingId = `event-details-heading-${id}`;
  const locationHeadingId = `event-location-heading-${id}`;

  const rawDate = formatted_event_date ?? event_date ?? "";
  const rawTime = formatted_event_time ?? event_time ?? "";
  const displayDate = rawDate ? formatDateToMMDDYYYY(rawDate) : "";
  const displayTime = rawTime ? formatTimeToHHMMAmPm(rawTime) : "";
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

  const hasLocation = !!primary_event_location;

  /**
   * Ensure we have a fully hydrated event from /events/:id (with primary_event_location).
   * This is called before opening either modal.
   */
  const ensureFullEventLoaded = () => {
    if (fullEvent) return;

    EventService.fetchEvent(id)
      .then((loaded) => {
        setFullEvent(loaded as EventWithLocation);
      })
      .catch((err) => {
        console.error("Failed to load full event for modal:", err);
      });
  };

  const handleOpenDetailsModal = () => {
    ensureFullEventLoaded();
    setIsDetailsOpen(true);
  };

  const handleOpenLocationModal = () => {
    ensureFullEventLoaded();
    setIsLocationOpen(true);
  };

  const handleCloseModals = () => {
    setIsDetailsOpen(false);
    setIsLocationOpen(false);
  };

  const handleViewLocationFromDetails = () => {
    ensureFullEventLoaded();
    setIsDetailsOpen(false);
    setIsLocationOpen(true);
  };

  // NEW: registration handler
  const handleRegisterForEvent = async () => {
    if (!canRegister || !amigo || isRegistering) return;

    setIsRegistering(true);

    try {
      await EventService.registerForEvent(id, amigo.id);
      setIsRegistered(true);
    } catch (err) {
      console.error("Error registering for event:", err);
      // Optionally surface this via toast / UI state
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <>
      {/* Summary event card in the Events grid */}
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

          <p className="card__message prose">{displayDescription}</p>
        </div>


        {/* Actions */}
        <div className="card__actions">
          <button
            type="button"
            className="button button--secondary view__details--button"
            onClick={handleOpenDetailsModal}
          >
            View Details
          </button>

          <button
            type="button"
            className="button button--secondary view__location--button"
            onClick={handleOpenLocationModal}
            disabled={false}
            title={
              hasLocation
                ? undefined
                : "If this event has a location, it will load in the modal."
            }
          >
            View Location
          </button>

          {mode === "manage" && (
            <>
              <Link
                to={`/events/${id}/edit`}
                className="button button--primary edit__event--button"
              >
                Edit Event
              </Link>

              <button
                type="button"
                className="button button--danger delete__event--button"
                onClick={() => onDelete?.(event)}
              >
                Delete Event
              </button>
            </>
          )}

          {/* Bottom row: registration (only for logged-in Amigos who are NOT lead coordinators) */}
          {canRegister && (
            <button
              type="button"
              className="button button--primary register__button"
              onClick={handleRegisterForEvent}
              disabled={isRegistering || isRegistered}
            >
              {isRegistered
                ? "Registered"
                : isRegistering
                ? "Registering…"
                : "Register For This Event"}
            </button>
          )}
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
            event={effectiveEvent}
            headingId={detailsHeadingId}
            onViewLocationClick={handleViewLocationFromDetails}
          />
        </UniversalCard>
      </UniversalModal>

      {/* Location modal (reuses EventLocationItem) */}
      <UniversalModal
        isOpen={isLocationOpen}
        onClose={handleCloseModals}
        titleId={locationHeadingId}
      >
        <UniversalCard titleId={locationHeadingId}>
          {primary_event_location ? (
            <EventLocationItem
              eventLocation={primary_event_location}
              headingId={locationHeadingId}
            />
          ) : (
            <p className="card__message">
              No location has been set for this event yet.
            </p>
          )}
        </UniversalCard>
      </UniversalModal>
    </>
  );
};

export default EventItem;
