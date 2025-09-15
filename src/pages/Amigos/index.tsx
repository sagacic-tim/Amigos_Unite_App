import React from 'react';
import AmigoList from '@/pages/Amigos/components/AmigoList';
import useAuth from '@/hooks/useAuth';
import '@/assets/sass/components/_forms.scss';

const AmigosPage: React.FC = () => {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return (
      <section className="section-content">
        <h1 className="page-title">Amigos Page</h1>
        <p>Please log in to view the list of amigos.</p>
      </section>
    );
  }

  return (
    <section className="section-content">
      <h1 className="page-title">Amigos Page</h1>
      <p className="page-description">
        This page lists all the amigos currently registered with Amigos Unite.
      </p>
      <AmigoList />
    </section>
  );
};

export default AmigosPage;
