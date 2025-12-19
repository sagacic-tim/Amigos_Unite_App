// src/components/Authentication/Logout.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { privateDel } from '../../services/apiHelper';
import '../../pages/Authentication/Authentication.module.scss';

interface LogoutProps {
  onLogoutSuccess: () => void;
}

// Optional: make this more surgical later (JWT + CSRF only)
const clearAuthCookies = () => {
  document.cookie.split(';').forEach((c) => {
    document.cookie = c
      .replace(/^ +/, '')
      .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
  });
};

const Logout: React.FC<LogoutProps> = ({ onLogoutSuccess }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await privateDel<void>('/api/v1/logout');
      clearAuthCookies();
      onLogoutSuccess();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      type="button"
      className="button button--primary"
    >
      Logout
    </button>
  );
};

export default Logout;
