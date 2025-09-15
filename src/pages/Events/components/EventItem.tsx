// src/components/Events/EventItem.tsx
import React from 'react';
import { Event } from '@/types/EventTypes';
import '@/assets/sass/components/_events.scss';

interface EventItemProps {
  event: Event;
}

const EventItem: React.FC<EventItemProps> = ({ event }) => {
  return (
    <div className="event-item">
      <h2>{event.event_name}</h2>
      <p>Type: {event.event_type}</p>
      <p>Date: {event.event_date}</p>
      <p>Time: {event.event_time}</p>
      <p>Speakers/Performers: {event.event_speakers_performers.join(', ')}</p>
      <p>Lead Coordinator: {event.lead_coordinator.first_name} {event.lead_coordinator.last_name}</p>
      <p>Created At: {event.created_at}</p>
      <p>Updated At: {event.updated_at}</p>
    </div>
  );
};

export default EventItem;
