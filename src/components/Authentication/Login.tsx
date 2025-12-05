// src/components/Authentication/Login.tsx
import React, { useState } from 'react';
import '../../pages/Authentication/Authentication.module.scss';
import { loginAmigo, LoginParams } from '../../services/auth';
import { Amigo } from '../../types/amigos/AmigoTypes';
import AuthFormShell from './AuthFormShell';

interface LoginProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (amigo: Amigo) => void;
  notice?: string;
}

const Login: React.FC<LoginProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  notice,
}) => {
  const [loginAttribute, setLoginAttribute] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(false);

  const handleErrorResponse = (status: number) => {
    switch (status) {
      case 401:
        setErrorMessage('Invalid login credentials.');
        break;
      case 500:
        setErrorMessage('Server error. Please try again later.');
        break;
      default:
        setErrorMessage('An error occurred. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!loginAttribute || !password) {
      setErrorMessage('Please fill in both fields.');
      return;
    }

    try {
      setLoading(true);
      const params: LoginParams = {
        login_attribute: loginAttribute,
        password,
      };
      const amigo = await loginAmigo(params);
      onLoginSuccess(amigo);
      // Parent (AuthModalsHost) closes the modal; no need to call onClose here.
    } catch (err: any) {
      if (err.response) {
        handleErrorResponse(err.response.status);
      } else {
        setErrorMessage(
          'An error occurred during login. Please try again later.',
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFormShell
      isOpen={isOpen}
      title="Login"
      notice={notice}
      errorMessage={errorMessage}
      isSubmitting={loading}
      primaryLabel="Login"
      submittingLabel="Logging in…"
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <label className="form-grid__label">
        Username, Email, or Phone No.
        <input
          type="text"
          className="form-grid__input"
          value={loginAttribute}
          onChange={(e) => setLoginAttribute(e.target.value)}
          disabled={loading}
          required
          autoComplete="username"
        />
      </label>

      <label className="form-grid__label">
        Password
        <input
          type="password"
          className="form-grid__input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          required
          autoComplete="current-password"
        />
      </label>
    </AuthFormShell>
  );
};

export default Login;
