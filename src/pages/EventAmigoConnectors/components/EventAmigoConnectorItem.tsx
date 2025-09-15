// src/pages/EventAmigoConnectors/components/EventAmigoConnectorItem.tsx
import React from 'react';
import type { EventAmigoConnector } from '@/types/EventAmigoConnectorTypes';
import '@/assets/sass/components/_eventAmigoConnectors.scss';

interface EventAmigoConnectorItemProps {
  eventAmigoConnector: EventAmigoConnector;
}

const EventAmigoConnectorItem: React.FC<EventAmigoConnectorItemProps> = ({ eventAmigoConnector }) => {
  return (
    <div className="event-amigo-connector-item">
      <h2>Event Amigo Connector ID: {eventAmigoConnector.id}</h2>
      <p>Event ID: {eventAmigoConnector.event_id}</p>
      <p>Amigo ID: {eventAmigoConnector.amigo_id}</p>
      <p>Role: {eventAmigoConnector.role}</p>

      <div className="amigo-details">
        <h3>Amigo Details:</h3>
        <p>First Name: {eventAmigoConnector.amigo.first_name}</p>
        <p>Last Name: {eventAmigoConnector.amigo.last_name}</p>
        <p>Username: {eventAmigoConnector.amigo.user_name}</p>
        <p>Email: {eventAmigoConnector.amigo.email}</p>
        {eventAmigoConnector.amigo.avatar_url && (
          <img
            src={eventAmigoConnector.amigo.avatar_url}
            alt={`${eventAmigoConnector.amigo.first_name}'s avatar`}
          />
        )}
      </div>

      <p>Created At: {eventAmigoConnector.created_at}</p>
      <p>Updated At: {eventAmigoConnector.updated_at}</p>
    </div>
  );
};

export default EventAmigoConnectorItem;
