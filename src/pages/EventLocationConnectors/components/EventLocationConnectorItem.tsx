// src/pages/EventLocationConnectors/components/EventLocationConnectorItem.tsx
import React from 'react';
import type { EventLocationConnector } from '@/types/events';
import '@/assets/sass/components/_eventLocationConnectors.scss';

interface EventLocationConnectorItemProps {
  eventLocationConnector: EventLocationConnector;
}

const EventLocationConnectorItem: React.FC<EventLocationConnectorItemProps> = ({
  eventLocationConnector,
}) => {
  const loc = eventLocationConnector.event_location; // may be undefined

  return (
    <div className="event-location-connector-item">
      <h2>Event Location Connector ID: {eventLocationConnector.id}</h2>
      <p>Event ID: {eventLocationConnector.event_id}</p>
      <p>Location ID: {eventLocationConnector.event_location_id}</p>
      <p>Primary: {eventLocationConnector.is_primary ? 'Yes' : 'No'}</p>
      <p>Status: {eventLocationConnector.status}</p>

      {loc && (
        <div className="location-details">
          <h3>Location Details:</h3>
          <p>Business Name: {loc.business_name}</p>
          {/* address is a single string in EventLocationTypes.ts */}
          <p>Address: {loc.address}</p>
          {/* lat/lng are optional numbers */}
          {loc.latitude != null && <p>Latitude: {loc.latitude}</p>}
          {loc.longitude != null && <p>Longitude: {loc.longitude}</p>}
        </div>
      )}
    </div>
  );
};

export default EventLocationConnectorItem;
