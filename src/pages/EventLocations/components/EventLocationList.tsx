// src/pages/EventLocations/components/EventLocationList.tsx
import React, { useEffect, useState } from 'react';
import EventLocationItem from './EventLocationItem';
import type { EventLocation } from '@/types/events';
import '@/assets/sass/components/_eventLocations.scss';

const EventLocationList: React.FC = () => {
  const [eventLocations, setEventLocations] = useState<EventLocation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEventLocations = async () => {
      try {
        const response = await fetch('/api/v1/event_locations');
        const data = await response.json();
        setEventLocations(data);
      } catch (error) {
        setError('Error fetching event locations');
      } finally {
        setLoading(false);
      }
    };

    fetchEventLocations();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error)   return <p>{error}</p>;

  return (
    <div className="event-location-list">
      {eventLocations.map((eventLocation) => (
        <EventLocationItem key={eventLocation.id} eventLocation={eventLocation} />
      ))}
    </div>
  );
};

export default EventLocationList;
