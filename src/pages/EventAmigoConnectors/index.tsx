
// src/pages/EventAmigoConnectors/index.tsx
import React from 'react';
import EventAmigoConnectorList from './components/EventAmigoConnectorList';

export default function EventAmigoConnectorsPage() {
  return (
    <section className="section-content">
      <h1 className="page-title">Event ↔ Amigo Connectors</h1>
      <EventAmigoConnectorList />
    </section>
  );
}
