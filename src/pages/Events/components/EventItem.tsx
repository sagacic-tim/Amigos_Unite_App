// src/pages/Events/components/EventItem.tsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import type { Event, EventLocation, EventAmigoConnector } from "@/types/events";
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

type EventRole =
  | "lead_coordinator"
  | "assistant_coordinator"
  | "participant"
  | null;

const EventItem: React.FC<EventItemProps> = ({
  event,
  mode = "public",
  onDelete,
}) => {
  const { isLoggedIn, amigo } = useAuthStatus();
  const amigoId = amigo?.id ?? null;

  // Base event from the index (no location hydrated)
  const baseEvent = event as EventWithLocation;

  // Hydrated event (from /events/:id show) – includes primary_event_location
  const [fullEvent, setFullEvent] = useState<EventWithLocation | null>(null);

  // Modal state
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);

  // Registration / status state
  const [isRegistering, setIsRegistering] = useState(false);
  const [eventRole, setEventRole] = useState<EventRole>(null);

  // Derived: is this amigo associated with this event in any role?
  const isRegistered = !!eventRole;

  // Are they a coordinator on this event?
  const isCoordinatorRole =
    eventRole === "lead_coordinator" || eventRole === "assistant_coordinator";

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
   * Determine the current amigo's role on this event (if any), using:
   * - event.event_amigo_connectors if already present, or
   * - a call to EventService.fetchEventAmigoConnectors(event.id) otherwise,
   * plus the event.lead_coordinator_id as a fallback for lead coordinator.
   */
  useEffect(() => {
    if (!amigoId || !isLoggedIn) {
      setEventRole(null);
      return;
    }

    let cancelled = false;

    const pickRoleFromConnectors = (
      connectors: EventAmigoConnector[]
    ): EventRole => {
      const mine = connectors.filter((c) => c.amigo_id === amigoId);
      if (mine.length === 0) return null;

      if (mine.some((c) => c.role === "lead_coordinator")) {
        return "lead_coordinator";
      }
      if (mine.some((c) => c.role === "assistant_coordinator")) {
        return "assistant_coordinator";
      }
      if (mine.some((c) => c.role === "participant")) {
        return "participant";
      }
      return null;
    };

    const applyRole = (connectors: EventAmigoConnector[]) => {
      let role = pickRoleFromConnectors(connectors);

      // Fallback: if the event has lead_coordinator_id pointing at this amigo,
      // treat them as lead even if no connector came back with that role.
      if (!role && event.lead_coordinator_id === amigoId) {
        role = "lead_coordinator";
      }

      if (!cancelled) {
        setEventRole(role);
      }
    };

    // 1) If connectors are already embedded on the event, use them.
    if (
      Array.isArray(event.event_amigo_connectors) &&
      event.event_amigo_connectors.length > 0
    ) {
      applyRole(event.event_amigo_connectors as EventAmigoConnector[]);
      return;
    }

    // 2) Otherwise fetch connectors for this event.
    EventService.fetchEventAmigoConnectors(event.id)
      .then((connectors) => {
        if (!cancelled) {
          applyRole(connectors as EventAmigoConnector[]);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error(
            `Error checking registration status for event ${event.id}:`,
            err
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    amigoId,
    isLoggedIn,
    event.id,
    event.event_amigo_connectors,
    event.lead_coordinator_id,
  ]);

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

  /**
   * Registration handler:
   * - Only in "public" mode
   * - Only when logged in
   * - Only if the amigo does not already have any role on this event
   */
  const handleRegisterForEvent = async () => {
    if (mode !== "public" || !amigo || !isLoggedIn || isRegistering || eventRole) {
      return;
    }

    setIsRegistering(true);

    try {
      const connector = await EventService.registerForEvent(id, amigo.id);
      setEventRole(connector.role as EventRole); // expected "participant" currently
    } catch (err) {
      console.error("Error registering for event:", err);
    } finally {
      setIsRegistering(false);
    }
  };

  // Only show the registration/status button on public listings when logged in.
  const showRegisterButton = mode === "public" && isLoggedIn;

  const buttonLabel = (() => {
    if (eventRole === "lead_coordinator") return "Lead Coordinator";
    if (eventRole === "assistant_coordinator") return "Assistant Coordinator";
    if (eventRole === "participant") return "Already Registered";
    if (isRegistering) return "Registering…";
    return "Register For This Event";
  })();

  // Choose spotlight vs primary styles based on coordinator role.
  const registerButtonClassName = [
    "button",
    isCoordinatorRole ? "button--spotlight" : "button--primary",
    "register__button",
  ].join(" ");

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

          {/* Registration / status button (public listing only) */}
          {showRegisterButton && (
            <button
              type="button"
              className={registerButtonClassName}
              onClick={handleRegisterForEvent}
              // Once they have any role, this becomes a status label only.
              disabled={isRegistering || isRegistered}
            >
              {buttonLabel}
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
