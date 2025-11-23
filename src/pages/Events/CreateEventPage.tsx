
// src/pages/Events/CreateEventPage.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import EventForm from "@/components/forms/EventForm";
import { EventService } from "@/services/EventService";
import type { EventCreateParams } from "@/types/events/EventTypes";

const CreateEventPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = async (values: EventCreateParams) => {
    const event = await EventService.createEvent(values);
    // Creator is elevated to lead_coordinator in Events::CreateEvent service
    // Redirect to Manage Events so they can see/manage their event
    navigate("/events/manage", { replace: true });
  };

  return (
    <div className="container container--page">
      <section className="sectionPageHeading">
        <h1 className="page-title">Create a New Event</h1>
        <p className="page-description">
          Fill out the details below to create a new event. After creation you
          will be the lead coordinator for this event.
        </p>
      </section>

      <EventForm submitLabel="Create Event" onSubmit={handleSubmit} />
    </div>
  );
};

export default CreateEventPage;
