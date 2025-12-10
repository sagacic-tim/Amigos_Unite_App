// src/pages/Events/EditEventPage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EventForm from "@/components/forms/events/EventForm";
import { EventService } from "@/services/EventService";
import type { EventAmigoConnector } from "@/types/events";
import type {
  Event,
  EventCreateParams,
} from "@/types/events/EventTypes";
import type {
  EventLocation,
  EventLocationCreatePayload,
} from "@/types/events/EventLocationTypes";
import styles from "@/pages/Events/Events.module.scss";

type ManagementParticipant = {
  amigoId: number;
  displayName: string;
  currentRole?: string;
};

// Map a full EventLocation (from API) to the slimmer EventLocationCreatePayload
// used by the EventForm / updateEvent.
function mapEventLocationToCreatePayload(
  loc: EventLocation,
): EventLocationCreatePayload {
  return {
    business_name: loc.business_name,
    business_phone: loc.business_phone ?? undefined,
    location_type: loc.location_type ?? undefined,
    street_number: loc.street_number ?? undefined,
    street_name: loc.street_name ?? undefined,
    city: loc.city ?? undefined,
    state_province: loc.state_province ?? undefined,
    country: loc.country ?? undefined,
    postal_code: loc.postal_code ?? undefined,
    owner_name: loc.owner_name ?? undefined,
    capacity:
      typeof loc.capacity === "number" ? loc.capacity : undefined,
    availability_notes: loc.availability_notes ?? undefined,
    has_food: loc.has_food,
    has_drink: loc.has_drink,
    has_internet: loc.has_internet,
    has_big_screen: loc.has_big_screen,
    place_id: loc.place_id ?? undefined,
    location_image_attribution:
      loc.location_image_attribution ?? undefined,
    image_url: loc.location_image_url ?? undefined,
    // We do not store photo_reference on the EventLocation itself; it is
    // transient, so this remains null when editing an existing event.
    photo_reference: null,
  };
}

const EditEventPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Participants displayed in the "Manage Event" step
  const [managementParticipants, setManagementParticipants] = useState<
    ManagementParticipant[]
  >([]);

  // Amigos who are currently assistant coordinators
  const [
    initialAssistantCoordinatorIds,
    setInitialAssistantCoordinatorIds,
  ] = useState<number[]>([]);

  // ───────────────────────────────────────────────────────────────────────────
  // Effect 1: load the event itself
  // ───────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!eventId) return;

    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const data = await EventService.fetchEvent(Number(eventId));
        if (mounted) {
          setEvent(data);
          setError(null);
        }
      } catch (err) {
        console.error(err);
        if (mounted) setError("Error loading event.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [eventId]);

  // ───────────────────────────────────────────────────────────────────────────
  // Effect 2: load connectors → managementParticipants for this event
  // ───────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!eventId) return;

    let mounted = true;

    (async () => {
      try {
        const connectors = await EventService.fetchEventAmigoConnectors(
          Number(eventId),
        );

        if (!mounted) return;

        const participants: ManagementParticipant[] = [];
        const assistantIds: number[] = [];

        (connectors as EventAmigoConnector[]).forEach((conn) => {
          // Only treat these as “attendees” for management purposes
          if (
            conn.role !== "participant" &&
            conn.role !== "assistant_coordinator"
          ) {
            return;
          }

          const a = conn.amigo; // may be undefined depending on serializer

          const displayName =
            (a &&
              [a.first_name, a.last_name].filter(Boolean).join(" ")) ||
            a?.user_name ||
            `Amigo #${conn.amigo_id}`;

          participants.push({
            amigoId: conn.amigo_id,
            displayName,
            currentRole: conn.role,
          });

          if (conn.role === "assistant_coordinator") {
            assistantIds.push(conn.amigo_id);
          }
        });

        setManagementParticipants(participants);
        setInitialAssistantCoordinatorIds(assistantIds);
      } catch (err) {
        console.error("Error loading event participants:", err);
        // We deliberately do not set `error` here so that lack of participants
        // does not prevent editing the event itself.
      }
    })();

    return () => {
      mounted = false;
    };
  }, [eventId]);

  const handleSubmit = async (values: EventCreateParams) => {
    if (!eventId) return;
    await EventService.updateEvent(Number(eventId), values);
    navigate("/events/manage", { replace: true });
  };

  // Shared outer structure with CreateEventPage
  return (
    <div className="container container--page">
      <section className={`section-content ${styles.page}`}>
        <h1 className={`page-title ${styles.header}`}>Edit Event</h1>

        {loading && (
          <p className="page-description">Loading event…</p>
        )}

        {!loading && (error || !event) && (
          <p className="page-description">
            {error || "Event not found."}
          </p>
        )}

        {!loading && event && (
          <>
            <p className="page-description">
              Update the details for <strong>{event.event_name}</strong>.
            </p>

            <EventForm
              initialValues={{
                event_name: event.event_name,
                event_date: event.event_date,
                event_time: event.event_time,
                status: event.status,
                event_type: event.event_type ?? undefined,
                event_speakers_performers:
                  event.event_speakers_performers ?? undefined,
                description: event.description ?? undefined,
                // Hydrate the location step with the current primary_event_location
                location: event.primary_event_location
                  ? mapEventLocationToCreatePayload(
                      event.primary_event_location,
                    )
                  : undefined,
              }}
              submitLabel="Save Changes"
              onSubmit={handleSubmit}
              includeManagementStep={true}
              // NEW: wire participants into the Manage Event step
              managementParticipants={managementParticipants}
              initialAssistantCoordinatorIds={
                initialAssistantCoordinatorIds
              }
              // onSubmitManagement can later promote/demote roles via the API
            />
          </>
        )}
      </section>
    </div>
  );
};

export default EditEventPage;
