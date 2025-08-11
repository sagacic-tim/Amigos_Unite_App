// src/ui/navigation/MainNav/MainNav.tsx
import React from 'react';
export default function MainNav({ children, className, ...rest }: React.HTMLAttributes<HTMLElement>) {
  const cls = ['main-nav', className].filter(Boolean).join(' ');
  return <nav className={cls} {...rest}>{children}</nav>;
}
