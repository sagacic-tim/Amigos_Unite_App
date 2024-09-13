import React, { useEffect, useState } from 'react';
import AmigoLocationItem from './AmigoLocationItem';
import { AmigoLocation } from '../../types/AmigoLocationTypes';
import { Amigo } from '../../types/AmigoTypes';
import '../../assets/sass/components/_amigoLocations.scss';

interface AmigoWithLocation {
  amigo: Amigo;
  location: AmigoLocation;
}

const AmigoLocationList: React.FC = () => {
  const [amigosWithLocations, setAmigosWithLocations] = useState<AmigoWithLocation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAmigosWithLocations = async () => {
      try {
        const amigoResponse = await fetch('/api/v1/amigos');
        const amigos = await amigoResponse.json();

        const amigoLocations = await Promise.all(
          amigos.map(async (amigo: Amigo) => {
            const locationResponse = await fetch(`/api/v1/amigos/${amigo.id}/amigo_locations`);
            const location = await locationResponse.json();
            return { amigo, location };
          })
        );

        setAmigosWithLocations(amigoLocations);
      } catch (error) {
        setError('Error fetching amigo locations');
      } finally {
        setLoading(false);
      }
    };

    fetchAmigosWithLocations();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="amigo-location-list">
      {amigosWithLocations.map(({ amigo, location }) => (
        <AmigoLocationItem key={location.id} location={location} amigo={amigo} />
      ))}
    </div>
  );
};

export default AmigoLocationList;