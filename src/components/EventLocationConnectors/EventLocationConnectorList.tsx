// src/components/EventLocationConnectors/EventLocationConnectorList.tsx
import React, { useEffect, useState } from 'react';
import EventLocationConnectorItem from './EventLocationConnectorItem';
import { EventLocationConnector } from '../../types/EventLocationConnectorTypes';
import '../../assets/sass/components/_eventLocationConnectors.scss';

const EventLocationConnectorList: React.FC = () => {
  const [connectors, setConnectors] = useState<EventLocationConnector[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConnectors = async () => {
      try {
        const response = await fetch('/api/v1/event_location_connectors');
        const data = await response.json();
        setConnectors(data);
      } catch (error) {
        setError('Error fetching event location connectors');
      } finally {
        setLoading(false);
      }
    };

    fetchConnectors();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="event-location-connector-list">
      {connectors.map((connector) => (
        <EventLocationConnectorItem key={connector.id} eventLocationConnector={connector} />
      ))}
    </div>
  );
};

export default EventLocationConnectorList;