// src/pages/Events/index.tsx
import React from "react";
import { Link } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import EventList from "@/pages/Events/components/EventList";

const EventsPage: React.FC = () => {
  const { isLoggedIn } = useAuth();

  return (
    <div className="container container--page">
      <section className="sectionPageHeading">
        <h1 className="page-title">Scheduled Events</h1>
        <p className="page-description">
          Browse all scheduled Amigos Unite events, including when they are held
          and a brief description. You do not need an account to view events.
        </p>

        {!isLoggedIn && (
          <p className="page-description">
            Create an account or log in to create your own events and manage
            events you coordinate.
          </p>
        )}

        {isLoggedIn && (
          <div className="section-actions">
            <Link to="/events/new" className="button button--primary">
              Create a New Event
            </Link>
          </div>
        )}
      </section>

      {/* Public list of all events */}
      <EventList variant="public" />
    </div>
  );
};

export default EventsPage;
