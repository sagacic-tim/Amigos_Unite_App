// src/ui/navigation/Pagination/Pagination.tsx
import React from 'react';
type Props = {
  page: number; pages: number;
  onChange: (page: number) => void;
  className?: string;
};
export default function Pagination({ page, pages, onChange, className }: Props) {
  const cls = ['pagination', className].filter(Boolean).join(' ');
  const go = (p: number) => () => onChange(Math.min(Math.max(1, p), pages));
  return (
    <nav className={cls} aria-label="Pagination">
      <a className="pagination__link" onClick={go(page - 1)} role="button">‹</a>
      {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
        <a key={p} className={`pagination__link ${p === page ? 'is-active' : ''}`} onClick={go(p)} role="button">
          {p}
        </a>
      ))}
      <a className="pagination__link" onClick={go(page + 1)} role="button">›</a>
    </nav>
  );
}
