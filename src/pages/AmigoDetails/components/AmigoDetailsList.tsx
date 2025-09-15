import React, { useEffect, useState } from 'react';
import AmigoDetailsItem from './AmigoDetailsItem';
import { AmigoDetails } from '@/types/AmigoDetailsTypes';
import { Amigo } from '@/types/AmigoTypes';
import '@/assets/sass/components/_amigoDetails.scss';

interface AmigoWithDetails {
  amigo: Amigo;
  amigoDetails: AmigoDetails;
}

const AmigoDetailsList: React.FC = () => {
  const [amigosWithDetails, setAmigosWithDetails] = useState<AmigoWithDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAmigosWithDetails = async () => {
      try {
        const amigoResponse = await fetch('/api/v1/amigos');
        const amigos: Amigo[] = await amigoResponse.json();

        const amigoDetails = await Promise.all(
          amigos.map(async (amigo: Amigo) => {
            const amigoDetailsResponse = await fetch(`/api/v1/amigos/${amigo.id}/amigo_detail`);
            const amigoDetails: AmigoDetails = await amigoDetailsResponse.json();
            return { amigo, amigoDetails };
          })
        );

        setAmigosWithDetails(amigoDetails);
      } catch (error) {
        setError('Error fetching amigo details');
      } finally {
        setLoading(false);
      }
    };

    fetchAmigosWithDetails();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="amigo-detail-list">
      {amigosWithDetails.map(({ amigo, amigoDetails }) => (
        <AmigoDetailsItem key={amigo.id} amigo={amigo} amigoDetails={amigoDetails} />
      ))}
    </div>
  );
};

export default AmigoDetailsList;
