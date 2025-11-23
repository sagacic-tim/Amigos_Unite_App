
// src/pages/Events/EditEventPage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EventForm from "@/components/forms/EventForm";
import { EventService } from "@/services/EventService";
import type { Event, EventCreateParams } from "@/types/events/EventTypes";

const EditEventPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) return;

    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await EventService.fetchEvent(Number(eventId));
        if (mounted) setEvent(data);
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

  const handleSubmit = async (values: EventCreateParams) => {
    if (!eventId) return;
    await EventService.updateEvent(Number(eventId), values);
    navigate("/events/manage", { replace: true });
  };

  if (loading) {
    return (
      <div className="container container--page">
        <p>Loading event…</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container container--page">
        <p>{error || "Event not found."}</p>
      </div>
    );
  }

  const initialValues: Partial<EventCreateParams> = {
    event_name: event.event_name,
    event_date: event.event_date,
    event_time: event.event_time,
    status: event.status,
    event_type: event.event_type ?? undefined,
    event_speakers_performers: event.event_speakers_performers ?? undefined,
    description: event.description ?? undefined,
  };

  return (
    <div className="container container--page">
      <section className="sectionPageHeading">
        <h1 className="page-title">Edit Event</h1>
        <p className="page-description">
          Update the details for <strong>{event.event_name}</strong>.
        </p>
      </section>

      <EventForm
        initialValues={initialValues}
        submitLabel="Save Changes"
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default EditEventPage;
