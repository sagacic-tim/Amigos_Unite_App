import React, { useState } from 'react';
import axiosInstance from '../../services/api';
import Modal from '../Common/Modal';
import '../../assets/sass/components/_authentication.scss';

const Login: React.FC<{ isOpen: boolean; onClose: () => void; onLoginSuccess: () => void }> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [loginAttribute, setLoginAttribute] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!loginAttribute || !password) {
      setErrorMessage('Please fill in all fields.');
      return;
    }

    try {
      setLoading(true);
      const response = await axiosInstance.post('/api/v1/login', {
        amigo: {
          login_attribute: loginAttribute,
          password: password,
        },
      });

      if (response.status === 200) {
        // Check for the content type of the response
        const contentType = response.headers['content-type'];
        if (!contentType || !contentType.includes('application/json')) {
          setErrorMessage('Unexpected response format');
          return;
        }
        console.log('Login response data:', response.data); // Log the entire response
        const { csrf_token, jwt } = response.data.data || {};
        if (jwt && csrf_token) {
          console.log('JWT and CSRF token successfully extracted.');
      
          const secureFlag = window.location.protocol === 'https:' ? 'Secure; ' : '';
          document.cookie = `jwt=${jwt}; Path=/; ${secureFlag}SameSite=None`;
          document.cookie = `csrf_token=${csrf_token}; Path=/; ${secureFlag}SameSite=None`;
          onLoginSuccess();
          onClose();
        } else {
          console.error('Failed to extract tokens:', response.data);
          setErrorMessage('Failed to retrieve authentication tokens.');
        }
      } else {
        handleErrorResponse(response.status);
      }           
      
    } catch (error: any) {
      if (error.response) {
        handleErrorResponse(error.response.status);
      } else {
        setErrorMessage('An error occurred during login. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="auth-form__label">
          Username, Email, or Phone No.
          <input
            type="text"
            className="auth-form__input"
            value={loginAttribute}
            onChange={(e) => setLoginAttribute(e.target.value)}
            disabled={loading}
          />
        </label>
        <label className="auth-form__label">
          Password
          <input
            type="password"
            className="auth-form__input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </label>
        <button type="submit" className="auth-form__button" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        {errorMessage && <p className="auth-form__error-message">{errorMessage}</p>}
      </form>
    </Modal>
  );
};

export default Login;