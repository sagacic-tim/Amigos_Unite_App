// src/App.tsx
import React, { useState, useEffect } from 'react';
import { Route, Routes, Link } from 'react-router-dom';
import { publicGet }    from './services/apiHelper';
import Login from './components/Authentication/Login';
import Signup from './components/Authentication/Signup';
import HomePage from './pages/HomePage';
import AmigosPage from './pages/AmigosPage';
import './App.scss';

const App: React.FC = () => {

  useEffect(() => {
    const fetchCsrf = async () => {
      try {
        await publicGet('/api/v1/csrf'); // sets cookie/header so subsequent requests work
      } catch (e) {
        console.error('Failed to load CSRF token', e);
      }
    };
    fetchCsrf();
  }, []);

  const [isLoginModalOpen, setLoginModalOpen] = useState(false); // Manage login modal state
  const [isSignupModalOpen, setSignupModalOpen] = useState(false); // Manage signup modal state

  // Handle closing modals after login/signup success
  const handleLoginSuccess = () => {
    setLoginModalOpen(false); // Close login modal on success
  };

  const handleSignupSuccess = () => {
    setSignupModalOpen(false); // Close signup modal on success
  };

  return (
    <div className="main-container">
      <nav className="nav-layout">
        <div className="bread-crumbs">
          <Link to="/">Home</Link>
          <Link to="/amigos">Amigos</Link>
        </div>
        <div className="auth-form">
          <button className="auth-form__button" onClick={() => setLoginModalOpen(true)}>Login</button>
          <button className="auth-form__button" onClick={() => setSignupModalOpen(true)}>Signup</button>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="amigos" element={<AmigosPage />} /> {/* Authentication logic inside AmigosPage */}
        <Route path="*" element={<HomePage />} />
      </Routes>

      {/* Conditionally render Login Modal */}
      {isLoginModalOpen && (
        <Login
          isOpen={isLoginModalOpen}
          onClose={() => setLoginModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {/* Conditionally render Signup Modal */}
      {isSignupModalOpen && (
        <Signup
          isOpen={isSignupModalOpen}
          onClose={() => setSignupModalOpen(false)}
          onSignupSuccess={handleSignupSuccess}
        />
      )}
    </div>
  );
};

export default App;
