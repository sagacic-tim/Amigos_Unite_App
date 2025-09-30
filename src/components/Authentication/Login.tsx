// src/components/Authentication/Login.tsx
import React, { useState } from 'react';
import Modal from '../Common/Modal';
import '../../pages/Authentication/Authentication.module.scss';
import { loginAmigo, LoginParams } from '../../services/auth';
import { Amigo } from '../../types/AmigoTypes';

interface LoginProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (amigo: Amigo) => void;
  notice?: string; // NEW
}

const Login: React.FC<LoginProps> = ({ isOpen, onClose, onLoginSuccess, notice }) => {
  const [loginAttribute, setLoginAttribute] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleErrorResponse = (status: number) => {
    switch (status) {
      case 401: setErrorMessage('Invalid login credentials.'); break;
      case 500: setErrorMessage('Server error. Please try again later.'); break;
      default:  setErrorMessage('An error occurred. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!loginAttribute || !password) {
      setErrorMessage('Please fill in both fields.');
      return;
    }

    try {
      setLoading(true);
      const params: LoginParams = { login_attribute: loginAttribute, password };
      const amigo = await loginAmigo(params);
      onLoginSuccess(amigo);
      onClose();
    } catch (err: any) {
      if (err.response) handleErrorResponse(err.response.status);
      else setErrorMessage('An error occurred during login. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form className="form-grid form-grid--auth" onSubmit={handleSubmit}>
        {/* Inline notice from guard */}
        {notice && (
          <div className="form_grid__notice" role="status">
            {notice}
          </div>
        )}

        <label className="form-grid__label">
          Username, Email, or Phone No.
          <input
            type="text"
            className="form-grid__input"
            value={loginAttribute}
            onChange={(e) => setLoginAttribute(e.target.value)}
            disabled={loading}
            required
          />
        </label>

        <label className="form-grid__label">
          Password
          <input
            type="password"
            className="form=grid__input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
          />
        </label>

        <button type="submit" className="button button--primary" disabled={loading}>
          {loading ? 'Logging in…' : 'Login'}
        </button>

        {errorMessage && <p className="form-grid__error-message">{errorMessage}</p>}
      </form>
    </Modal>
  );
};

export default Login;
