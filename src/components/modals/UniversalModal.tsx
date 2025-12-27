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
  // Close on Escape – hook is ALWAYS called,
  // but only attaches a listener while the modal is open.
  useEffect(() => {
    if (!isOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // Now that hooks have run, we can safely bail out when closed.
  if (!isOpen) return null;

  return (
    <div className={`modal ${isOpen ? "is-open" : ""}`}>
      {/* Backdrop: clickable + keyboard accessible */}
      <div
        className="modal__backdrop"
        role="button"
        aria-label="Close modal"
        tabIndex={0}
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
        aria-labelledby={titleId}
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
