// src/ui/navigation/Breadcrumbs/Breadcrumbs.tsx
import React from 'react';
type Crumb = { href?: string; label: React.ReactNode };
type Props = { items: Crumb[] } & React.HTMLAttributes<HTMLElement>;
export default function Breadcrumbs({ items, className, ...rest }: Props) {
  const cls = ['breadcrumbs', className].filter(Boolean).join(' ');
  return (
    <nav className={cls} aria-label="Breadcrumb" {...rest}>
      {items.map((c, i) => (
        <span className="breadcrumbs__item" key={i}>
          {c.href ? <a href={c.href}>{c.label}</a> : <span>{c.label}</span>}
        </span>
      ))}
    </nav>
  );
}
