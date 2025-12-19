
// src/components/Authentication/AuthFormShell.tsx
import type React from 'react';
import Modal from '../Common/Modal';
import '../../pages/Authentication/Authentication.module.scss';

interface AuthFormShellProps {
  isOpen: boolean;
  title: string;
  notice?: string;
  errorMessage?: string | null;
  isSubmitting?: boolean;
  primaryLabel: string;
  submittingLabel?: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  children: React.ReactNode;
}

/**
 * Shared wrapper for auth forms (login, signup, etc.).
 * Handles:
 * - Modal
 * - form-grid layout
 * - Title, notice, error block
 * - Primary + Cancel buttons in a single actions row
 */
const AuthFormShell: React.FC<AuthFormShellProps> = ({
  isOpen,
  title,
  notice,
  errorMessage,
  isSubmitting = false,
  primaryLabel,
  submittingLabel,
  onClose,
  onSubmit,
  children,
}) => {
  if (!isOpen) return null;

  const buttonLabel =
    isSubmitting && submittingLabel ? submittingLabel : primaryLabel;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form className="form-grid form-grid--auth" onSubmit={onSubmit}>
        <h2 className="form-grid__title">{title}</h2>

        {notice && (
          <div className="form-grid__notice" role="status">
            {notice}
          </div>
        )}

        {errorMessage && <p className="form-error">{errorMessage}</p>}

        <fieldset>{children}</fieldset>

        <div className="form-grid__actions">
          <button
            type="submit"
            className="button button--primary"
            disabled={isSubmitting}
          >
            {buttonLabel}
          </button>
          <button
            type="button"
            className="button button--cancel"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AuthFormShell;
