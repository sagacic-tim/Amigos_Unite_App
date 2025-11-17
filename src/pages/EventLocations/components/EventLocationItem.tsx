// src/pages/EventLocations/components/EventLocationItem.tsx
import React from 'react';
import type { EventLocation } from '@/types/events';
import '@/assets/sass/components/_eventLocations.scss';

interface EventLocationItemProps {
  eventLocation: EventLocation;
}

const EventLocationItem: React.FC<EventLocationItemProps> = ({ eventLocation }) => {
  return (
    <div className="event-location-item">
      <h2>{eventLocation.business_name}</h2>
      <p>Phone: {eventLocation.business_phone}</p>
      <p>Address: {eventLocation.address}</p>
      <p>Floor: {eventLocation.floor}</p>
      <p>Room No: {eventLocation.room_no}</p>
      <p>Suite: {eventLocation.apartment_suite_number}</p>
      <p>Sublocality: {eventLocation.city_sublocality}</p>
      <p>City: {eventLocation.city}</p>
      <p>State: {eventLocation.state_province}</p>
      <p>Country: {eventLocation.country}</p>
      <p>Postal Code: {eventLocation.postal_code}</p>
      <p>Latitude: {eventLocation.latitude}</p>
      <p>Longitude: {eventLocation.longitude}</p>
      <p>Time Zone: {eventLocation.time_zone}</p>
    </div>
  );
};

export default EventLocationItem;
