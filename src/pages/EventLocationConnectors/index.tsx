
// src/pages/EventLocationConnectors/index.tsx
import React from 'react';
import EventLocationConnectorList from './components/EventLocationConnectorList';

export default function EventLocationConnectorsPage() {
  return (
    <section className="section-content">
      <h1 className="page-title">Event ↔ Location Connectors</h1>
      <EventLocationConnectorList />
    </section>
  );
}
