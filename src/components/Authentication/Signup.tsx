// src/components/Authentication/Signup.tsx
import React, { useState } from 'react';
import { publicPost } from '../../services/apiHelper';
import Modal from '../Common/Modal';
import '../../assets/sass/components/_authentication.scss';

interface SignupProps {
  isOpen: boolean;
  onClose: () => void;
  onSignupSuccess: () => void;
}

const Signup: React.FC<SignupProps> = ({ isOpen, onClose, onSignupSuccess }) => {
  const [email, setEmail]     = useState('');
  const [firstName, setFirstName]   = useState('');
  const [lastName, setLastName]     = useState('');
  const [userName, setUserName]     = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !userName || !email || !password || !passwordConfirmation) {
      setErrorMessage('Please fill in all fields.');
      return;
    }
    try {
      setLoading(true);
      await publicPost<{ /* sign‑up response shape */ }>('/api/v1/signup', {
        amigo: {
          first_name:            firstName,
          last_name:             lastName,
          user_name:             userName,
          email,
          password,
          password_confirmation: passwordConfirmation
        }
      });
      onSignupSuccess();
      onClose();
    } catch (err: any) {
      if (err.response?.status === 422) {
        setErrorMessage('Signup failed. Check your inputs.');
      } else {
        setErrorMessage('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="auth-form__label">
          First Name:
          <input
            type="text"
            className="auth-form__input"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            disabled={loading}
            required
          />
        </label>
        <label className="auth-form__label">
          Last Name:
          <input
            type="text"
            className="auth-form__input"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            disabled={loading}
            required
          />
        </label>
        <label className="auth-form__label">
          Username:
          <input
            type="text"
            className="auth-form__input"
            value={userName}
            onChange={e => setUserName(e.target.value)}
            disabled={loading}
            required
          />
        </label>
        <label className="auth-form__label">
          Email:
          <input
            type="email"
            className="auth-form__input"
            value={email}
            onChange={e => setEmail(e.target.value)}
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
            onChange={e => setPassword(e.target.value)}
            disabled={loading}
            required
          />
        </label>

        <label className="auth-form__label">
          Confirm Password:
          <input
            type="password"
            className="auth-form__input"
            value={passwordConfirmation}
            onChange={e => setPasswordConfirmation(e.target.value)}
            disabled={loading}
            required
          />
        </label>
        <button type="submit" className="auth-form__button" disabled={loading}>
          {loading ? 'Signing up…' : 'Signup'}
        </button>
        {errorMessage && <p className="auth-form__error-message">{errorMessage}</p>}
      </form>
    </Modal>
  );
};

export default Signup;
