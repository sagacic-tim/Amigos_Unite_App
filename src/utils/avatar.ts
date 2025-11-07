// src/utils/avatar.ts
import md5 from 'crypto-js/md5';
import type { Amigo } from '@/types/AmigoTypes';
import { resolveApiUrl } from '@/utils/resolveApiUrl';

export const DEFAULT_AVATAR = '/images/default-amigo-avatar.png';

/**
 * Choose the best avatar URL:
 * 1) explicit amigo.avatar_url (your API / ActiveStorage)
 * 2) Gravatar, based on amigo.email, with a generic fallback style
 * 3) local default image
 */
export function buildAvatarUrl(amigo: Amigo | null | undefined): string {
  // 1) explicit avatar from backend
  const explicit = resolveApiUrl(amigo?.avatar_url);
  if (explicit) return explicit;

  // 2) Gravatar from email (if present)
  const email = amigo?.email?.trim().toLowerCase() ?? '';
  if (email) {
    const hash = md5(email).toString();
    const params = new URLSearchParams({
      d: 'retro', // or 'identicon', 'monsterid', etc.
      s: '160',
    });
    return `https://www.gravatar.com/avatar/${hash}?${params.toString()}`;
  }

  // 3) fallback to local default
  return DEFAULT_AVATAR;
}
