// src/pages/AmigoLocations/components/AmigoLocationContainer.tsx

import React, { useState, useEffect } from 'react';
import type { Amigo } from '@/types/amigos/AmigoTypes';
import type { AmigoLocation } from '@/types/amigos/AmigoLocationTypes';
import AmigoLocationItem from './AmigoLocationItem';
import { fetchAmigoLocations } from '@/services/AmigoService';

interface AmigoLocationContainerProps {
  amigo: Amigo;
}

const AmigoLocationContainer: React.FC<AmigoLocationContainerProps> = ({ amigo }) => {
  const [amigoLocations, setAmigoLocations] = useState<AmigoLocation[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetchAmigoLocations(amigo.id);

        if (response.length === 0) {
          setError('No address information found.');
          setAmigoLocations(null);
        } else {
          setAmigoLocations(response);
        }
      } catch {
        // We don’t need the actual error object, just surface a friendly message
        setError('Error loading amigo locations.');
      } finally {
        setLoading(false);
      }
    };

    void fetchLocations();
  }, [amigo.id]);

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <AmigoLocationItem
          location={amigoLocations ? amigoLocations[0] : null}
          amigo={amigo}
        />
      )}
    </div>
  );
};

export default AmigoLocationContainer;
