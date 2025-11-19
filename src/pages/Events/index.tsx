// src/pages/Events/index.tsx
import React from "react";
import useAuth from "@/hooks/useAuth";
import EventList from "@/pages/Events/components/EventList";

const EventsPage: React.FC = () => {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return (
      <section className="sectionPageHeading">
        <h1 className="page-title">Events</h1>
        <p>Please log in to view the list of events.</p>
      </section>
    );
  }

  return (
    <div className="container container--page">
      <section className="sectionPageHeading">
        <h1 className="page-title">Events</h1>
        <p className="page-description">
          This page lists all scheduled events in Amigos Unite,
          including when they will be held and a brief description.
        </p>
      </section>

      <EventList />
    </div>
  );
};

export default EventsPage;
