// src/pages/AmigoDetails/components/AmigoDetailsList.tsx
import React, { useEffect, useState } from 'react';
import AmigoDetailsItem from './AmigoDetailsItem';
import type { AmigoDetails } from '@/types/AmigoDetailsTypes';
import type { Amigo } from '@/types/AmigoTypes';
import privateApi from '@/services/privateApi';
import useAuth from '@/hooks/useAuth';

interface AmigoWithDetails {
  amigo: Amigo;
  amigoDetails: AmigoDetails;
}

const AmigoDetailsList: React.FC = () => {
  const { amigos, loading: authLoading } = useAuth(); // ✅ single source of amigos
  const [amigosWithDetails, setAmigosWithDetails] = useState<AmigoWithDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Wait until the auth layer has finished its own initial load
    if (authLoading) return;

    // If there are no amigos, we’re done — nothing to fetch
    if (!amigos.length) {
      setAmigosWithDetails([]);
      setLoading(false);
      return;
    }

    const fetchAmigosWithDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const amigoDetails = await Promise.all(
          amigos.map(async (amigo: Amigo) => {
            const detailsRes = await privateApi.get<AmigoDetails>(
              `/api/v1/amigos/${amigo.id}/amigo_detail`
            );
            return { amigo, amigoDetails: detailsRes.data };
          })
        );

        setAmigosWithDetails(amigoDetails);
      } catch (err) {
        console.error('Error fetching amigo details', err);
        setError('Error fetching amigo details');
        setAmigosWithDetails([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchAmigosWithDetails();
  }, [amigos, authLoading]);

  if (loading) return <p>Loading...</p>;
  if (error)   return <p>{error}</p>;

  if (!amigosWithDetails.length) {
    return <p>No amigos found.</p>;
  }

  return (
    <div className="amigo-detail-list">
      {amigosWithDetails.map(({ amigo, amigoDetails }) => (
        <AmigoDetailsItem key={amigo.id} amigo={amigo} amigoDetails={amigoDetails} />
      ))}
    </div>
  );
};

export default AmigoDetailsList;
