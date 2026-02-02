// src/components/Authentication/Signup.tsx
import type React from 'react';
import { useEffect, useState } from 'react';
import '../../pages/Authentication/Authentication.module.scss';

import { signupAmigo } from '@/services/auth';
import { ensureCsrfToken } from '@/services/csrf';
import AuthFormShell from './AuthFormShell';
import axios from 'axios';

interface SignupProps {
  isOpen: boolean;
  onClose: () => void;
  onSignupSuccess: () => void;
}

type ApiErrorPayload = {
  errors?: unknown;
  error?: unknown;
  message?: unknown;
  status?: {
    errors?: unknown;
    message?: unknown;
    code?: unknown;
  };
};

function coerceString(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

function extractErrors(payload: unknown): string[] {
  if (!payload || typeof payload !== 'object') return [];

  const p = payload as ApiErrorPayload;

  // Prefer arrays of errors
  const candidates: unknown[] = [];

  // Common shapes:
  // { errors: [...] }
  if (Array.isArray(p.errors)) candidates.push(...p.errors);

  // Your current Rails shape:
  // { status: { errors: [...] } }
  if (p.status && Array.isArray(p.status.errors)) candidates.push(...p.status.errors);

  // Some APIs return { status: { message: "..." } } or { message: "..." }
  // We'll handle messages separately below.

  return candidates.map((e) => (typeof e === 'string' ? e : String(e))).filter(Boolean);
}

function extractMessage(payload: unknown): string {
  if (!payload || typeof payload !== 'object') return '';

  const p = payload as ApiErrorPayload;

  const fromStatusMessage = coerceString(p.status?.message);
  if (fromStatusMessage) return fromStatusMessage;

  const fromTopMessage = coerceString(p.message);
  if (fromTopMessage) return fromTopMessage;

  const fromError = coerceString(p.error);
  if (fromError) return fromError;

  return '';
}

function friendly422Message(raw: string): string {
  // Keep your “already exists” UX, but otherwise surface the server truth.
  if (/has already been taken|already exists/i.test(raw)) {
    return 'An account with that email/username already exists.';
  }
  return raw;
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!firstName || !lastName || !userName || !email || !password || !passwordConfirmation) {
      setErrorMessage('Please fill in all fields.');
      return;
    }

    if (!/^[A-Za-z0-9_]+$/.test(userName)) {
      setErrorMessage('Username may only contain letters, numbers, and underscore.');
      return;
    }

    // Match Devise config: config.password_length = 10..64
    if (password.length < 10) {
      setErrorMessage('Password must be at least 10 characters.');
      return;
    }
    if (password.length > 64) {
      setErrorMessage('Password must be 64 characters or fewer.');
      return;
    }

    if (password !== passwordConfirmation) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (phone1 && !/^\+\d{6,15}$/.test(phone1)) {
      setErrorMessage('Phone number must be in international format (e.g., +14155550123).');
      return;
    }

    try {
      setLoading(true);

      await signupAmigo({
        amigo: {
          first_name: firstName,
          last_name: lastName,
          user_name: userName,
          email,
          password,
          password_confirmation: passwordConfirmation,
          ...(phone1 ? { phone_1: phone1 } : {}),
        },
      });

      onSignupSuccess();
      // Parent will close the modal; no need to call onClose here.
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const data = err.response?.data;

        const errors = extractErrors(data);
        const msg = extractMessage(data);
        const combined = errors.join(', ') || msg;

        if (status === 422) {
          setErrorMessage(friendly422Message(combined || 'Signup failed. Check your inputs.'));
        } else if (status === 401) {
          setErrorMessage(combined || 'Unauthorized (CSRF or auth). Please reload and try again.');
        } else if (status === 404) {
          setErrorMessage('Signup endpoint not found. Please check your API routes.');
        } else {
          setErrorMessage(combined || 'Something went wrong. Please try again.');
        }
      } else {
        setErrorMessage('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFormShell
      isOpen={isOpen}
      title="Signup"
      errorMessage={errorMessage}
      isSubmitting={loading}
      primaryLabel="Signup"
      submittingLabel="Signing up…"
      onClose={onClose}
      onSubmit={handleSubmit}
    >
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
    </AuthFormShell>
  );
};

export default Signup;
