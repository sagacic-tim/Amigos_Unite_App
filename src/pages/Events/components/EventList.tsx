// src/pages/Events/components/EventList.tsx
import React, { useEffect, useState } from 'react';
import EventItem from './EventItem';
import { Event } from '@/types/EventTypes';
import '@/assets/sass/components/_events.scss';
import { fetchEvents } from '@/services/EventService';

const EventList: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchEvents();
        if (mounted) setEvents(data);
      } catch (err) {
        console.error(err);
        if (mounted) setError('Error fetching events');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error)   return <p>{error}</p>;

  return <div className="event-list">{events.map(e => <EventItem key={e.id} event={e} />)}</div>;
};

export default EventList;
