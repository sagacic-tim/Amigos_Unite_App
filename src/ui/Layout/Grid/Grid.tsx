// src/ui/layout/Grid/Grid.tsx
import React from 'react';
type Props = React.HTMLAttributes<HTMLDivElement> & { cols?: 2 | 3 | 4 };
export default function Grid({ cols, className, ...rest }: Props) {
  const cls = ['grid', cols ? `grid--cols-${cols}` : '', className].filter(Boolean).join(' ');
  return <div className={cls} {...rest} />;
}
