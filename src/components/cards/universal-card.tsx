
// src/components/cards/Card.tsx
import React from "react";

export interface CardProps {
  /** Modifier, e.g. "details", "profile", "auth" → .card--details etc. */
  variant?: string;
  className?: string;
  /** Optional card title; if omitted, children render their own heading. */
  title?: string;
  /** Heading level for the title, for a11y/semantics. */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Main content inside card__body. */
  children: React.ReactNode;
  /** Optional actions → rendered inside card__actions. */
  actions?: React.ReactNode;
  /** id of an external heading element (for aria-labelledby). */
  ariaLabelledBy?: string;
}

const Card: React.FC<CardProps> = ({
  variant,
  className,
  title,
  headingLevel = 3,
  children,
  actions,
  ariaLabelledBy,
}) => {
  const HeadingTag = `h${headingLevel}` as keyof JSX.IntrinsicElements;

  const classes = [
    "card",
    variant ? `card--${variant}` : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={classes} aria-labelledby={ariaLabelledBy}>
      <div className="card__body">
        {title && (
          <HeadingTag
            className="card__title"
            id={ariaLabelledBy && !title ? ariaLabelledBy : undefined}
          >
            {title}
          </HeadingTag>
        )}
        {children}
      </div>

      {actions && <div className="card__actions">{actions}</div>}
    </article>
  );
};

export default Card;
