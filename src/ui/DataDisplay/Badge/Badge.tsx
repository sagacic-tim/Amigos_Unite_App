
// src/ui/data-display/Badge/Badge.tsx
import React from 'react';

type Props = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: 'success' | 'warning' | 'error' | 'info';
};

export default function Badge({ variant, className, ...rest }: Props) {
  const cls = ['badge', variant ? `-${variant}` : '', className].filter(Boolean).join(' ');
  return <span className={cls} {...rest} />;
}
