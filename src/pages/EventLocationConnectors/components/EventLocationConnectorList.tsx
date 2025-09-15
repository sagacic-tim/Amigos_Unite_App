// src/pages/EventLocationConnectors/components/EventLocationConnectorList.tsx
import React, { useEffect, useState } from 'react';
import EventLocationConnectorItem from './EventLocationConnectorItem';
import { EventLocationConnector } from '@/types/EventLocationConnectorTypes';
import { fetchAllEventLocationConnectors } from '@/services/EventService';
import '@/assets/sass/components/_eventLocationConnectors.scss';

const EventLocationConnectorList: React.FC = () => {
  const [connectors, setConnectors] = useState<EventLocationConnector[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchAllEventLocationConnectors();
        if (mounted) setConnectors(data);
      } catch (err) {
        console.error(err);
        if (mounted) setError('Error fetching event location connectors');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error)   return <p>{error}</p>;

  return (
    <div className="event-location-connector-list">
      {connectors.map((connector) => (
        <EventLocationConnectorItem key={connector.id} eventLocationConnector={connector} />
      ))}
    </div>
  );
};

export default EventLocationConnectorList;
