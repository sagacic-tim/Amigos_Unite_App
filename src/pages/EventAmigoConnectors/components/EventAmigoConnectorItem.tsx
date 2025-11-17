// src/pages/EventAmigoConnectors/components/EventAmigoConnectorItem.tsx
import React from 'react';
import type { EventAmigoConnector } from '@/types/events';
import '@/assets/sass/components/_eventAmigoConnectors.scss';

type EventAmigoConnectorWithTimestamps = EventAmigoConnector & {
  created_at?: string;
  updated_at?: string;
};

interface EventAmigoConnectorItemProps {
  eventAmigoConnector: EventAmigoConnectorWithTimestamps;
}

const EventAmigoConnectorItem: React.FC<EventAmigoConnectorItemProps> = ({ eventAmigoConnector }) => {
  const a = eventAmigoConnector.amigo; // may be undefined

  return (
    <div className="event-amigo-connector-item">
      <h2>Event Amigo Connector ID: {eventAmigoConnector.id}</h2>
      <p>Event ID: {eventAmigoConnector.event_id}</p>
      <p>Amigo ID: {eventAmigoConnector.amigo_id}</p>
      <p>Role: {eventAmigoConnector.role}</p>

      {a && (
        <div className="amigo-details">
          <h3>Amigo Details:</h3>
          <p>First Name: {a.first_name ?? '—'}</p>
          <p>Last Name: {a.last_name ?? '—'}</p>
          <p>Username: {a.user_name}</p>
          <p>Email: {a.email ?? '—'}</p>
          {a.avatar_url && (
            <img
              src={a.avatar_url}
              alt={`${a.first_name ?? 'Amigo'}'s avatar`}
            />
          )}
        </div>
      )}

      {/* Render only if included by API */}
      {eventAmigoConnector.created_at && <p>Created At: {eventAmigoConnector.created_at}</p>}
      {eventAmigoConnector.updated_at && <p>Updated At: {eventAmigoConnector.updated_at}</p>}
    </div>
  );
};

export default EventAmigoConnectorItem;
