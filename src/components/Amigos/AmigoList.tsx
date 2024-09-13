import React, { useEffect, useState } from 'react';
import AmigoItem from './AmigoItem';
import { Amigo } from '../../types/AmigoTypes';
import { fetchAmigos } from '../../services/AmigoService';
import '../../assets/sass/components/_amigos.scss';

const AmigoList: React.FC = () => {
  const [amigos, setAmigos] = useState<Amigo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAmigos = async () => {
      try {
        const amigosData = await fetchAmigos(); // Fetch the amigos array directly
        setAmigos(amigosData); // Set the amigos array directly
      } catch (error) {
        console.error('Error loading amigos:', error);
        setError('Error fetching amigos');
      } finally {
        setLoading(false);
      }
    };

    loadAmigos(); // Call the function to load amigos on component mount
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="amigo-list">
      {amigos.map((amigo) => (
        <AmigoItem key={amigo.id} amigo={amigo} />
      ))}
    </div>
  );
};

export default AmigoList;