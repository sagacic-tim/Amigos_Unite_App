import React from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../services/api';

interface LogoutProps {
  onLogoutSuccess: () => void;
}

const clearCookies = () => {
  document.cookie.split(";").forEach((c) => {
    document.cookie = c
      .replace(/^ +/, "")
      .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
  });
};

const Logout: React.FC<LogoutProps> = ({ onLogoutSuccess }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout(); // Make the logout request via axios
      clearCookies(); // Clear cookies after successful logout
      onLogoutSuccess(); // Call the prop function after successful logout
      navigate('/'); // Navigate to home or another page after logout
    } catch (error) {
      console.error('Error logging out:', error);
      // Optionally, add user feedback here (e.g., display an error message)
    }
  };

  return (
    <button onClick={handleLogout}>
      Logout
    </button>
  );
};

export default Logout;