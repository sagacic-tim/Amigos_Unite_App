import React, { useState } from 'react';
import axiosInstance from '../../services/api';
import Modal from '../Common/Modal';
import '../../assets/sass/components/_authentication.scss';

interface SignupProps {
  isOpen: boolean;
  onClose: () => void;
  onSignupSuccess: () => void;
}

const Signup: React.FC<SignupProps> = ({ isOpen, onClose, onSignupSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // To store and display error messages
  const [loading, setLoading] = useState(false); // Add loading state

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Please fill in all fields.');
      return;
    }

    try {
      setLoading(true); // Start loading
      const response = await axiosInstance.post('/api/v1/signup', {
        amigo: {
          email: email,
          password: password,
        },
      });

      if (response.status === 201) { // Check for successful signup
        // Handle successful signup
        const { csrf_token } = response.data.status;

        // Store the CSRF token in a cookie or state
        if (csrf_token) {
          document.cookie = `csrf_token=${csrf_token}; Path=/`;
        }

        onSignupSuccess(); // Trigger success handler
        onClose(); // Close modal on success
      } else {
        handleErrorResponse(response.status);
      }
    } catch (error: any) {
      if (error.response) {
        handleErrorResponse(error.response.status);
      } else {
        setErrorMessage('An error occurred during signup. Please try again later.');
      }
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const handleErrorResponse = (status: number) => {
    switch (status) {
      case 400:
        setErrorMessage('Invalid signup details.');
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
          Email:
          <input
            type="email"
            className="auth-form__input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />
        </label>
        <label className="auth-form__label">
          Password:
          <input
            type="password"
            className="auth-form__input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
          />
        </label>
        <button type="submit" className="auth-form__button" disabled={loading}>
          {loading ? 'Signing up...' : 'Signup'}
        </button>
        {errorMessage && <p className="auth-form__error-message">{errorMessage}</p>} {/* Display any error message */}
      </form>
    </Modal>
  );
};

export default Signup;