// src/components/Amigos/AmigoList.tsx
import React, { useEffect, useState } from 'react';
import AmigoItem from './AmigoItem';
import { Amigo } from '../../types/AmigoTypes';
import { fetchAmigos } from '../../services/AmigoService';
import useAuth from '../../hooks/useAuth'; // Import the useAuth hook
import '../../assets/sass/pages/_amigos.scss';

const AmigoList: React.FC = () => {
  const { isLoggedIn } = useAuth(); // Use the useAuth hook to get auth status
  const [amigos, setAmigos] = useState<Amigo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch the list of amigos whenever the isLoggedIn state changes
  useEffect(() => {
    if (!isLoggedIn) {
      setAmigos([]); // Clear the amigos if the user is not logged in
      return;
    }

    const loadAmigos = async () => {
      try {
        setLoading(true);
        const amigosData = await fetchAmigos();
        setAmigos(amigosData);
      } catch (error: any) {
        console.error('Error loading amigos:', error);
        setError('Error fetching amigos. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadAmigos();
  }, [isLoggedIn]); // Depend on the isLoggedIn state

  if (loading) return <p>Loading amigos...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="amigo-list">
      {amigos.length > 0 ? (
        amigos.map((amigo) => (
          <AmigoItem key={amigo.id} amigo={amigo} />
        ))
      ) : (
        <p>No amigos found.</p>
      )}
    </div>
  );
};

export default AmigoList;
