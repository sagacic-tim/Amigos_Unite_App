// src/components/modals/UniversalCard.tsx
import React from "react";

export interface UniversalCardProps {
  /** Extra className for card-level styling (e.g. module SCSS hook) */
  className?: string;
  /** Optional heading id used for aria-labelledby on the surrounding article */
  titleId?: string;
  children: React.ReactNode;
}

/**
 * Generic "details card" shell that uses the global `.card` styles.
 * Content (headings, fields, etc.) is supplied by the caller.
 */
const UniversalCard: React.FC<UniversalCardProps> = ({
  className = "",
  titleId,
  children,
}) => {
  const classes = ["card", "card--details", className].filter(Boolean).join(" ");

  return (
    <article className={classes} aria-labelledby={titleId}>
      <div className="card__body">{children}</div>
    </article>
  );
};

export default UniversalCard;
