
// src/pages/Events/ManageEventsPage.tsx
import React from "react";
import EventList from "./components/EventList";

const ManageEventsPage: React.FC = () => {
  return (
    <div className="container container--page">
      <section className="sectionPageHeading">
        <h1 className="page-title">Manage My Events</h1>
        <p className="page-description">
          These are events for which you are lead or assistant coordinator. You
          can edit or delete them here.
        </p>
      </section>

      <EventList variant="manage" />
    </div>
  );
};

export default ManageEventsPage;
