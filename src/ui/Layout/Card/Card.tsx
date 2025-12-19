// src/ui/layout/Card/Card.tsx
import React from 'react';
export default function Card({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  const cls = ['card', className].filter(Boolean).join(' ');
  return <div className={cls} {...rest} />;
}
