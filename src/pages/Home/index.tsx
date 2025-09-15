// src/pages/Home/index.tsx
import React from 'react';
import useDeviceType from '@/hooks/useDeviceType';
import bannerDesktop from '@/assets/images/home_page/amigos-march.jpg';
import bannerMobile  from '@/assets/images/home_page/amigos-march-mobile.jpg';
import '@/assets/sass/pages/_home.scss';

const HomePage: React.FC = () => {
  // If your hook returns 'mobile' | 'tablet' | 'desktop'
  const isMobile = useDeviceType(); // boolean
  const banner   = isMobile ? bannerMobile : bannerDesktop;

  // Prefer <picture> for responsive sources, with a safe fallback:
  return (
    <main className="home">
      <section className="home__heading">
        <h1 className="home__heading--title">Welcome to Amigos Unite!</h1>
        <p className="home__heading--intro">
          This is a place where everyone comes to connect to everyone else. At Amigos Unite everyone can join in the
          conversation that will take place at your favorite coffee shop, like Tierra Mia, and everyone can schedule a
          meeting anywhere and all the people that are members of Amigos Unite will be given email and text messages
          announcing the meeting taking place, if they live within ten miles of that location. That way there is always
          something happening not too far from where you live.
        </p>
      </section>

      <section className="home__banner">
        <picture>
          <source media="(max-width: 640px)" srcSet={bannerMobile} />
          <img className="home__banner--image" src={banner} alt="Amigos Unite Gathering" />
        </picture>
      </section>
    </main>
  );
};

export default HomePage;
