// src/pages/Amigos/components/AmigoList.tsx
import React, { useEffect, useState } from 'react';
import AmigoItem from './AmigoItem';
import { Amigo } from '@/types/AmigoTypes';
import { fetchAmigos } from '@/services/AmigoService';
import useAuthStatus from '@/hooks/useAuthStatus';  // ← swap hook
import '@/assets/sass/pages/_amigos.scss';

const AmigoList: React.FC = () => {
  const { isLoggedIn, checking } = useAuthStatus();  // ← use checking to avoid a flash
  const [amigos, setAmigos] = useState<Amigo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // While verifying session, don’t render “not logged in”
    if (checking) return;

    if (!isLoggedIn) {
      setAmigos([]);
      setLoading(false);
      return;
    }

    const loadAmigos = async () => {
      try {
        setLoading(true);
        const amigosData = await fetchAmigos();
        setAmigos(amigosData);
      } catch (err) {
        console.error('Error loading amigos:', err);
        setError('Error fetching amigos. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadAmigos();
  }, [isLoggedIn, checking]); // ← refetch when auth changes

  if (checking) return <p>Checking session…</p>;
  if (loading)  return <p>Loading amigos...</p>;
  if (error)    return <p>{error}</p>;

  return (
    <div className="amigo-list">
      {amigos.length > 0
        ? amigos.map(amigo => <AmigoItem key={amigo.id} amigo={amigo} />)
        : <p>No amigos found.</p>}
    </div>
  );
};

export default AmigoList;
