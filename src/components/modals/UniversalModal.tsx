
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
  if (!isOpen) return null;

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className={`modal ${isOpen ? "is-open" : ""}`}
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

        <div className="modal__body">{children}</div>
      </div>
    </div>
  );
};

export default UniversalModal;
