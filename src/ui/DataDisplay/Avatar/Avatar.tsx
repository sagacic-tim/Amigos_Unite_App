
// src/ui/data-display/Avatar/Avatar.tsx
import React from 'react';

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  size?: 'sm' | 'md' | 'lg';
};

export default function Avatar({ size = 'md', className, ...imgProps }: Props) {
  const wrapperClass = ['avatar', size === 'sm' ? 'avatar--sm' : size === 'lg' ? 'avatar--lg' : '', className]
    .filter(Boolean).join(' ');
  return (
    <span className={wrapperClass}>
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <img {...imgProps} />
    </span>
  );
}
