// src/pages/EventAmigoConnectors/components/EventAmigoConnectorList.tsx
import React, { useEffect, useState } from 'react';
import EventAmigoConnectorItem from './EventAmigoConnectorItem';
import type { EventAmigoConnector } from '@/types/EventAmigoConnectorTypes';
import { fetchAllEventAmigoConnectors } from '@/services/EventService';
import '@/assets/sass/components/_eventAmigoConnectors.scss';

const EventAmigoConnectorList: React.FC = () => {
  const [connectors, setConnectors] = useState<EventAmigoConnector[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchAllEventAmigoConnectors();
        if (mounted) setConnectors(data);
      } catch (err) {
        console.error(err);
        if (mounted) setError('Error fetching event amigo connectors');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error)   return <p>{error}</p>;

  return (
    <div className="event-amigo-connector-list">
      {connectors.map((connector) => (
        <EventAmigoConnectorItem key={connector.id} eventAmigoConnector={connector} />
      ))}
    </div>
  );
};

export default EventAmigoConnectorList;
