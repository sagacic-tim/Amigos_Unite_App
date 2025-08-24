// src/components/Common/Modal.tsx
import React, { useEffect } from 'react';
import '../../assets/sass/components/_modals.scss';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  titleId?: string; // optional aria-labelledby target
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, titleId }) => {
  if (!isOpen) return null;

  // Optional: close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className={`modal ${isOpen ? 'is-open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={onClose} // click backdrop to close
    >
      <div
        className="modal__dialog"
        role="document"
        onClick={(e) => e.stopPropagation()} // don’t close when clicking inside dialog
      >
        <button
          type="button"
          className="modal__close"
          aria-label="Close modal"
          onClick={onClose}
        >
          ×
        </button>

        {/* Optional header/body/footer slots if you adopt them: */}
        {/* <header className="modal__header"><h2 id={titleId} className="modal__title">…</h2></header> */}
        <div className="modal__body">{children}</div>
        {/* <footer className="modal__footer">…</footer> */}
      </div>
    </div>
  );
};

export default Modal;
