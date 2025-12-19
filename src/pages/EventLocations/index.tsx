
// src/pages/EventLocations/index.tsx
import React from "react";
import EventLocationList from "./components/EventLocationList";

const EventLocationsPage: React.FC = () => {
  return (
    <div className="container container--page">
      <section className="sectionPageHeading">
        <h1 className="page-title">Event Locations</h1>
        <p className="page-description">
          Browse all locations where Amigos Unite events are held.
        </p>
      </section>

      <EventLocationList />
    </div>
  );
};

export default EventLocationsPage;
