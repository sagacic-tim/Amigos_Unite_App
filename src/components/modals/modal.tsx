// src/components/modals/Modal.tsx
import React, { useEffect } from "react";
import "../../assets/sass/components/_modals.scss";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  titleId?: string; // optional aria-labelledby target
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, titleId }) => {
  // Optional: close on Escape – hook must be unconditional
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
    <div
      className={`modal ${isOpen ? "is-open" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId || undefined}
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

        {/* Body wrapper – domain modals put header/form/footer inside */}
        <div className="modal__body">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
