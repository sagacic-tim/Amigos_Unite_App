// src/ui/navigation/SubNav/SubNav.tsx
import React from 'react';
export default function SubNav({ children, className, ...rest }: React.HTMLAttributes<HTMLElement>) {
  const cls = ['sub-nav', className].filter(Boolean).join(' ');
  return <nav className={cls} {...rest}>{children}</nav>;
}
