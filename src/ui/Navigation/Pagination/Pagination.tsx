// src/ui/navigation/Pagination/Pagination.tsx
import React from "react";

type Props = {
  page: number;
  pages: number;
  onChange: (page: number) => void;
  className?: string;
};

export default function Pagination({
  page,
  pages,
  onChange,
  className,
}: Props) {
  // If there is only one (or zero) pages, nothing to paginate
  if (pages <= 1) {
    return null;
  }

  const cls = ["pagination", className].filter(Boolean).join(" ");

  const go = (p: number) => () => {
    const clamped = Math.min(Math.max(1, p), pages);
    if (clamped !== page) {
      onChange(clamped);
    }
  };

  const isPrevDisabled = page <= 1;
  const isNextDisabled = page >= pages;

  return (
    <nav className={cls} aria-label="Pagination">
      {/* Previous */}
      <button
        type="button"
        className="pagination__link"
        onClick={go(page - 1)}
        disabled={isPrevDisabled}
        aria-label="Previous page"
      >
        ‹
      </button>

      {/* Page numbers */}
      {Array.from({ length: pages }, (_, i) => i + 1).map((p) => {
        const isActive = p === page;
        return (
          <button
            key={p}
            type="button"
            className={`pagination__link ${isActive ? "is-active" : ""}`}
            onClick={go(p)}
            aria-current={isActive ? "page" : undefined}
          >
            {p}
          </button>
        );
      })}

      {/* Next */}
      <button
        type="button"
        className="pagination__link"
        onClick={go(page + 1)}
        disabled={isNextDisabled}
        aria-label="Next page"
      >
        ›
      </button>
    </nav>
  );
}
