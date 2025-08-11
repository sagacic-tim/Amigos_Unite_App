
// src/ui/feedback/Modal/Modal.tsx
import React from 'react';

type Props = {
  open: boolean;
  titleId?: string;
  onClose?: () => void;
  children: React.ReactNode;
};

export default function Modal({ open, titleId, onClose, children }: Props) {
  return (
    <div className={`modal ${open ? 'is-open' : ''}`} role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <div className="modal__dialog">
        {children}
        {onClose && (
          <button className="modal__close" aria-label="Close" onClick={onClose}>✕</button>
        )}
      </div>
    </div>
  );
}
