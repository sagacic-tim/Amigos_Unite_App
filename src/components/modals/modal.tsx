// src/components/modals/Modal.tsx
import React, { useEffect } from "react";
import "../../assets/sass/components/_modals.scss";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Optional id of a heading inside the modal for aria-labelledby */
  titleId?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  titleId,
}) => {
  // Close on Escape – hook must be unconditional, but only attaches when open
  useEffect(() => {
    if (!isOpen || typeof window === "undefined") return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  // Render nothing when closed
  if (!isOpen) return null;

  return (
    <div className={`modal ${isOpen ? "is-open" : ""}`}>
      {/* Backdrop: interactive & keyboard-accessible for a11y */}
      <div
        className="modal__backdrop"
        role="button"
        tabIndex={0}
        aria-label="Close modal"
        onClick={onClose}
        onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClose();
          }
        }}
      />

      {/* Dialog content */}
      <div
        className="modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId || undefined}
      >
        <button
          type="button"
          className="modal__close"
          aria-label="Close modal"
          onClick={onClose}
        >
          ×
        </button>

        {/* Body wrapper – domain modals put header/form/footer inside */}
        <div className="modal__body">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
