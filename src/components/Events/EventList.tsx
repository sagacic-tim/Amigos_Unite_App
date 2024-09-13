// src/components/Events/EventList.tsx
import React, { useEffect, useState } from 'react';
import EventItem from './EventItem';
import { Event } from '../../types/EventTypes';
import '../../assets/sass/components/_events.scss';

const EventList: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/v1/events');
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        setError('Error fetching events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="event-list">
      {events.map((event) => (
        <EventItem key={event.id} event={event} />
      ))}
    </div>
  );
};

export default EventList;