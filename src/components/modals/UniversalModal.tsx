// src/components/modals/UniversalModal.tsx
import React, { useEffect } from "react";
import "../../assets/sass/components/_modals.scss";

export interface UniversalModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Optional id of a heading inside the modal for aria-labelledby */
  titleId?: string;
}

const UniversalModal: React.FC<UniversalModalProps> = ({
  isOpen,
  onClose,
  children,
  titleId,
}) => {
  // Close on Escape (global) – hook always runs, listener only when open
  useEffect(() => {
    if (!isOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close when clicking the overlay itself, not the dialog contents
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleOverlayKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // a11y: provide a keyboard interaction on the same element that has onClick
    if (e.key === "Escape") {
      e.stopPropagation();
      onClose();
    }
  };

  return (
    <div
      className={`modal ${isOpen ? "is-open" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
      onClick={handleOverlayClick}
      onKeyDown={handleOverlayKeyDown}
    >
      <div
        className="modal__dialog"
        role="document"
        // Prevent overlay click handler from firing when user clicks inside the card
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="modal__close"
          aria-label="Close modal"
          onClick={onClose}
        >
          ×
        </button>

        <div className="modal__body">{children}</div>
      </div>
    </div>
  );
};

export default UniversalModal;
