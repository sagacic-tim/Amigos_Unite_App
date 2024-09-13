// src/components/EventLocationConnectors/EventLocationConnectorItem.tsx
import React from 'react';
import { EventLocationConnector } from '../../types/EventLocationConnectorTypes';
import '../../assets/sass/components/_eventLocationConnectors.scss';

interface EventLocationConnectorItemProps {
  eventLocationConnector: EventLocationConnector;
}

const EventLocationConnectorItem: React.FC<EventLocationConnectorItemProps> = ({ eventLocationConnector }) => {
  return (
    <div className="event-location-connector-item">
      <h2>Event Location Connector ID: {eventLocationConnector.id}</h2>
      <p>Event ID: {eventLocationConnector.event_id}</p>
      <p>Event Name: {eventLocationConnector.event_name}</p>
      <p>Event Date: {eventLocationConnector.event_date}</p>
      <p>Event Time: {eventLocationConnector.event_time}</p>
      <p>Location ID: {eventLocationConnector.event_location_id}</p>
      <div className="location-details">
        <h3>Location Details:</h3>
        <p>Business Name: {eventLocationConnector.business_name}</p>
        <p>Address: {eventLocationConnector.business_address.street}, {eventLocationConnector.business_address.city}, {eventLocationConnector.business_address.state}, {eventLocationConnector.business_address.postal_code}, {eventLocationConnector.business_address.country}</p>
        <p>Latitude: {eventLocationConnector.latitude}</p>
        <p>Longitude: {eventLocationConnector.longitude}</p>
      </div>
    </div>
  );
};

export default EventLocationConnectorItem;