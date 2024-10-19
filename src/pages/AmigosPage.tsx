import React from 'react';
import AmigoList from '../components/Amigos/AmigoList';
import useAuth from '../hooks/useAuth'; // Import useAuth hook
import '../assets/sass/layout/_form.scss';

const AmigosPage: React.FC = () => {
  const { isLoggedIn } = useAuth(); // Check auth status directly

  // If the user is not logged in, return a login prompt
  if (!isLoggedIn) {
    return (
      <section className="section-content">
        <h1 className="page-title">Amigos Page</h1>
        <p>Please log in to view the list of amigos.</p>
      </section>
    );
  }

  // If the user is logged in, render the amigos list
  return (
    <section className="section-content">
      <h1 className="page-title">Amigos Page</h1>
      <p className="page-description">This page lists all the amigos currently registered with Amigos Unite.</p>
      <AmigoList />
    </section>
  );
};

export default AmigosPage;