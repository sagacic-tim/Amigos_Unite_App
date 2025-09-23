// src/components/Authentication/Signup.tsx
import type React from 'react';
import { useEffect, useState } from 'react';
import Modal from '../Common/Modal';
import '@/assets/sass/pages/_authentication.scss';

import { signupAmigo } from '@/services/auth';
import { ensureCsrfToken } from '@/services/csrf';

interface SignupProps {
  isOpen: boolean;
  onClose: () => void;
  onSignupSuccess: () => void;
}

const Signup: React.FC<SignupProps> = ({ isOpen, onClose, onSignupSuccess }) => {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [userName, setUserName] = useState('');
  const [phone1, setPhone1] = useState(''); // optional
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Prime CSRF when the modal opens (once per open)
  useEffect(() => {
    if (isOpen) {
      ensureCsrfToken().catch(() => {});
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Basic client validation
    if (!firstName || !lastName || !userName || !email || !password || !passwordConfirmation) {
      setErrorMessage('Please fill in all fields.');
      return;
    }
    if (!/^[A-Za-z0-9_]+$/.test(userName)) {
      setErrorMessage('Username may only contain letters, numbers, and underscore.');
      return;
    }
    if (password !== passwordConfirmation) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    // Optional phone — if provided, nudge toward E.164 shape (server still validates)
    if (phone1 && !/^\+\d{6,15}$/.test(phone1)) {
      setErrorMessage('Phone number must be in international format (e.g., +14155550123).');
      return;
    }

    try {
      setLoading(true);

      // Send exactly what your controller permits at signup
      await signupAmigo({
        amigo: {
          first_name: firstName,
          last_name: lastName,
          user_name: userName,
          email,
          password,
          password_confirmation: passwordConfirmation,
          ...(phone1 ? { phone_1: phone1 } : {}), // optional
        },
      });

      onSignupSuccess();
      onClose();
    } catch (err: any) {
      const status = err?.response?.status as number | undefined;
      const errorsArray: string[] = Array.isArray(err?.response?.data?.errors)
        ? err.response.data.errors
        : [];

      const apiMsg =
        errorsArray.join(', ') ||
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        '';

      if (status === 422) {
        const text = apiMsg.toString();
        if (/has already been taken|already exists/i.test(text)) {
          setErrorMessage('An account with that email/username already exists.');
        } else {
          setErrorMessage(apiMsg || 'Signup failed. Check your inputs.');
        }
      } else if (status === 401) {
        setErrorMessage(apiMsg || 'Unauthorized (CSRF or auth). Please reload and try again.');
      } else if (status === 404) {
        setErrorMessage('Signup endpoint not found. Please check your API routes.');
      } else {
        setErrorMessage(apiMsg || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form className="form-grid form-grid--auth" onSubmit={handleSubmit}>
        {errorMessage && <p className="form-error">{errorMessage}</p>}

        <fieldset>
          <label className="form-grid label">
            First Name:
            <input
              type="text"
              className="form-grid__fields"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={loading}
              autoComplete="given-name"
              required
            />
          </label>

          <label className="form-grid label">
            Last Name:
            <input
              type="text"
              className="form-grid__fields"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={loading}
              autoComplete="family-name"
              required
            />
          </label>

          <label className="form-grid label">
            Username:
            <input
              type="text"
              className="form-grid__fields"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              disabled={loading}
              autoComplete="username"
              required
            />
          </label>

          <label className="form-grid label">
            Email:
            <input
              type="email"
              className="form-grid__fields"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoComplete="email"
              required
            />
          </label>

          <label className="form-grid label">
            Phone (optional):
            <input
              type="tel"
              className="form-grid__fields"
              placeholder="+14155550123"
              value={phone1}
              onChange={(e) => setPhone1(e.target.value)}
              disabled={loading}
              autoComplete="tel"
            />
          </label>

          <label className="form-grid label">
            Password:
            <input
              type="password"
              className="form-grid__fields"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="new-password"
              required
            />
          </label>

          <label className="form-grid label">
            Confirm Password:
            <input
              type="password"
              className="form-grid__fields"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              disabled={loading}
              autoComplete="new-password"
              required
            />
          </label>

          <button type="submit" className="button button--primary" disabled={loading}>
            {loading ? 'Signing up…' : 'Signup'}
          </button>

        </fieldset>

      </form>
    </Modal>
  );
};

export default Signup;
