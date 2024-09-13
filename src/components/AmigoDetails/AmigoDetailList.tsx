import React, { useEffect, useState } from 'react';
import AmigoDetailItem from './AmigoDetailItem';
import { AmigoDetail } from '../../types/AmigoDetailTypes';
import { Amigo } from '../../types/AmigoTypes';
import '../../assets/sass/components/_amigoDetails.scss';

interface AmigoWithDetail {
  amigo: Amigo;
  amigoDetail: AmigoDetail;
}

const AmigoDetailList: React.FC = () => {
  const [amigosWithDetails, setAmigosWithDetails] = useState<AmigoWithDetail[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAmigosWithDetails = async () => {
      try {
        const amigoResponse = await fetch('/api/v1/amigos');
        const amigos = await amigoResponse.json();

        const amigoDetails = await Promise.all(
          amigos.map(async (amigo: Amigo) => {
            const amigoDetailResponse = await fetch(`/api/v1/amigos/${amigo.id}/amigo_detail`);
            const amigoDetail = await amigoDetailResponse.json();
            return { amigo, amigoDetail };
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
      {amigosWithDetails.map(({ amigo, amigoDetail }) => (
        <AmigoDetailItem key={amigo.id} amigo={amigo} amigoDetail={amigoDetail} />
      ))}
    </div>
  );
};

export default AmigoDetailList;