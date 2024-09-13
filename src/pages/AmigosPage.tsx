// src/pages/AmigosPage.tsx
import React from 'react';
import AmigoList from '../components/Amigos/AmigoList';
import '../assets/sass/layout/_form.scss';

interface AmigosPageProps {
  isLoggedIn: boolean;
}

const AmigosPage: React.FC<AmigosPageProps> = ({ isLoggedIn }) => {
  return (
    <section className="section-content">
      <h1 className="page-title">Amigos Page</h1>
      {isLoggedIn ? <p className="page-description">This page lists all the amigos currently registered with Amigos Unite.</p> : <p></p>}
      {isLoggedIn ? <AmigoList /> : <p>Please log in to view the list of amigos.</p>}
      {isLoggedIn ? <AmigoList /> : <p>This is the amigos page, visible only to logged-in users.</p>}
    </section>
  );
};

export default AmigosPage;