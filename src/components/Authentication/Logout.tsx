import React from 'react';
import { useNavigate } from 'react-router-dom';
import { privateDel } from '../../services/apiHelper';

interface LogoutProps {
  onLogoutSuccess: () => void;
}

const clearCookies = () => {
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
      clearCookies();
      onLogoutSuccess();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return <button onClick={handleLogout} type="button" className="button--primary">Logout</button>;
};

export default Logout;
