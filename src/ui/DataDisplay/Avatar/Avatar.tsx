// src/ui/DataDisplay/Avatar/Avatar.tsx
import React from 'react';

type AvatarSize = 'sm' | 'md' | 'lg';

type AvatarProps = Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  'alt'
> & {
  size?: AvatarSize;
  /**
   * Accessible alternative text for the avatar image.
   * Use an empty string ("") for purely decorative avatars.
   */
  alt?: string;
};

/**
 * Derive a human-readable alt text from an image src, e.g.
 *  "/images/tim-michel-avatar.png" -> "tim michel avatar"
 *
 * Returns undefined if it can't derive something meaningful
 * (e.g. hashed filenames).
 */
function deriveAltFromSrc(src?: string): string | undefined {
  if (!src) return undefined;

  let path = src;
  // Handle absolute URLs gracefully
  try {
    const url = new URL(src, window.location.origin);
    path = url.pathname;
  } catch {
    // src was probably already a path; ignore
  }

  const fileName = path.split('/').pop();
  if (!fileName) return undefined;

  // Strip query/hash and extension
  const base = fileName
    .split('?')[0]
    .split('#')[0]
    .replace(/\.[a-z0-9]+$/i, ''); // remove extension

  if (!base) return undefined;

  // Ignore typical hashed filenames (e.g. "a3f9c2b1")
  if (/^[a-f0-9]{8,}$/i.test(base)) return undefined;

  // Replace separators with spaces and normalize whitespace
  const human = base
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return human || undefined;
}

export default function Avatar({
  size = 'md',
  className,
  alt,
  ...imgProps
}: AvatarProps) {
  const wrapperClassName = [
    'avatar',
    size === 'sm' ? 'avatar--sm' : '',
    size === 'lg' ? 'avatar--lg' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Prefer explicit alt from props; otherwise derive from src; otherwise decorative.
  const src = typeof imgProps.src === 'string' ? imgProps.src : undefined;
  const effectiveAlt = alt ?? deriveAltFromSrc(src) ?? '';

  return (
    <span className={wrapperClassName}>
      <img alt={effectiveAlt} {...imgProps} />
    </span>
  );
}
