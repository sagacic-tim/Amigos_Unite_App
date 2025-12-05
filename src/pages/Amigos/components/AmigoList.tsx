// src/pages/Amigos/components/AmigoList.tsx
import React, { useEffect, useState } from 'react';
import AmigoItem from './AmigoItem';
import { Amigo } from '@/types/amigos/AmigoTypes';
import { fetchAmigos } from '@/services/AmigoService';
import useAuthStatus from '@/hooks/useAuthStatus';

// ❌ remove: import styles from "../Amigos.module.scss";

const AmigoList: React.FC = () => {
  const { isLoggedIn, checking } = useAuthStatus();
  const [amigos, setAmigos] = useState<Amigo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (checking) return;
    if (!isLoggedIn) {
      setAmigos([]);
      setLoading(false);
      return;
    }
    (async () => {
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
    })();
  }, [isLoggedIn, checking]);

  if (checking) return <p>Checking session…</p>;
  if (loading)  return <p>Loading amigos...</p>;
  if (error)    return <p>{error}</p>;

  return (
    // Use global layout utilities instead of module CSS
    <section className="container container--page cards-grid">
      {amigos.length > 0
        ? amigos.map(amigo => <AmigoItem key={amigo.id} amigo={amigo} />)
        : <p>No amigos found.</p>}
    </section>
  );
};

export default AmigoList;
