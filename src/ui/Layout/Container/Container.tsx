
// src/ui/layout/Container/Container.tsx
import React from 'react';
export default function Container({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  const cls = ['container', className].filter(Boolean).join(' ');
  return <div className={cls} {...rest} />;
}
