// src/lib/avatar.ts
import md5 from 'blueimp-md5';

/**
 * Build a Gravatar URL (or return null if email missing).
 * Uses d=404 so you can detect absence with a HEAD/GET if you want.
 */
export function gravatarUrl(email?: string, size = 200): string | null {
  if (!email) return null;
  const hash = md5(email.trim().toLowerCase());
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=404`;
}

/**
 * Optionally: build a Disqus avatar URL.
 * Note: Disqus avatars are forum/user-contextual; often you’ll rely on
 * Disqus’ embed to render them. This is a placeholder if you have a direct URL.
 */
export function disqusAvatarUrl(_identifier: string, size = 200): string | null {
  // Unless you have a stable Disqus image URL pattern, prefer Gravatar or upload.
  return null;
}
