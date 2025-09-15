
import React from 'react';
import EventList from './components/EventList';

export default function EventsPage() {
  return (
    <section className="section-content">
      <h1 className="page-title">Events</h1>
      <EventList />
    </section>
  );
}
