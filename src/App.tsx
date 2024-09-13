// src/App.tsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import Login from './components/Authentication/Login';
import Signup from './components/Authentication/Signup';
import HomePage from './pages/HomePage';
import AmigosPage from './pages/AmigosPage';
import useAuth from './hooks/useAuth'; // Import custom useAuth hook
import axiosInstance from './services/api'; // Import axios instance
import './App.scss';

const App: React.FC = () => {
  const { isLoggedIn, loading } = useAuth(); // Hook should be used here
  const [isLoginModalOpen, setLoginModalOpen] = useState(false); // Manage login modal state
  const [isSignupModalOpen, setSignupModalOpen] = useState(false); // Manage signup modal state
  const navigate = useNavigate();

  if (loading) {
    return <div>Loading...</div>; // Show loading indicator while checking auth status
  }

  const handleLoginSuccess = () => {
    setLoginModalOpen(false); // Close login modal on success
  };

  const handleSignupSuccess = () => {
    setSignupModalOpen(false); // Close signup modal on success
  };

  const handleLogout = async () => {
    try {
      await axiosInstance.delete('/api/v1/logout');
      window.location.href = '/'; // Redirect to home after logout
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="main-container">
      <nav className="nav-layout">
        <div className="bread-crumbs">
          <Link to="/">Home</Link>
          <Link to="/amigos">Amigos</Link>
        </div>
        <div className="auth-form">
          {!isLoggedIn && <button className="auth-form__button" onClick={() => setLoginModalOpen(true)}>Login</button>}
          {!isLoggedIn && <button className="auth-form__button" onClick={() => setSignupModalOpen(true)}>Signup</button>}
          {isLoggedIn && <button className="auth-form__button" onClick={handleLogout}>Logout</button>}
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="amigos" element={<AmigosPage isLoggedIn={isLoggedIn} />} />
        <Route path="*" element={<HomePage />} />
      </Routes>

      {/* Conditionally render Login Modal */}
      {isLoginModalOpen && (
        <Login isOpen={isLoginModalOpen} onClose={() => setLoginModalOpen(false)} onLoginSuccess={handleLoginSuccess} />
      )}

      {/* Conditionally render Signup Modal */}
      {isSignupModalOpen && !isLoggedIn && (
        <Signup isOpen={isSignupModalOpen} onClose={() => setSignupModalOpen(false)} onSignupSuccess={handleSignupSuccess} />
      )}
    </div>
  );
};

export default App;