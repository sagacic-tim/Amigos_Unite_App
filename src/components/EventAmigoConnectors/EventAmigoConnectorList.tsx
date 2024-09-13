// src/components/EventAmigoConnectors/EventAmigoConnectorList.tsx
import React, { useEffect, useState } from 'react';
import EventAmigoConnectorItem from './EventAmigoConnectorItem';
import { EventAmigoConnector } from '../../types/EventAmigoConnectorTypes';
import '../../assets/sass/components/_eventAmigoConnectors.scss';

const EventAmigoConnectorList: React.FC = () => {
  const [connectors, setConnectors] = useState<EventAmigoConnector[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConnectors = async () => {
      try {
        const response = await fetch('/api/v1/event_amigo_connectors');
        const data = await response.json();
        setConnectors(data);
      } catch (error) {
        setError('Error fetching event amigo connectors');
      } finally {
        setLoading(false);
      }
    };

    fetchConnectors();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="event-amigo-connector-list">
      {connectors.map((connector) => (
        <EventAmigoConnectorItem key={connector.id} eventAmigoConnector={connector} />
      ))}
    </div>
  );
};

export default EventAmigoConnectorList;