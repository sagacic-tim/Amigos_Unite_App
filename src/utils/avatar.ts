// src/utils/avatar.ts
import md5 from 'crypto-js/md5';
import type { Amigo } from '@/types/amigos/AmigoTypes';
import { resolveApiUrl } from '@/utils/resolveApiUrl';

export const DEFAULT_AVATAR = '/images/default-amigo-avatar.png';

/**
 * Some serializers may expose the avatar URL as "avatar-url" instead of "avatar_url".
 * This helper safely reads that legacy field without using `any`.
 */
type AmigoWithLegacyAvatar = Amigo & {
  'avatar-url'?: string | null;
};

function getLegacyAvatarUrl(amigo: Amigo | null | undefined): string | null {
  if (!amigo) return null;
  const candidate = (amigo as AmigoWithLegacyAvatar)['avatar-url'];
  return candidate ?? null;
}

/**
 * Choose the best avatar URL:
 * 1) explicit amigo.avatar_url (your API / ActiveStorage)
 * 2) legacy amigo['avatar-url'] (older serializer shape)
 * 3) Gravatar, based on amigo.email, with a generic fallback style
 * 4) local default image
 */
export function buildAvatarUrl(amigo: Amigo | null | undefined): string {
  const rawAvatar = amigo?.avatar_url ?? getLegacyAvatarUrl(amigo);

  const explicit = resolveApiUrl(rawAvatar);
  if (explicit) return explicit;

  // 3) Gravatar from email (if present)
  const email = amigo?.email?.trim().toLowerCase() ?? '';
  if (email) {
    const hash = md5(email).toString();
    const params = new URLSearchParams({
      d: 'retro', // or 'identicon', 'monsterid', etc.
      s: '160',
    });
    return `https://www.gravatar.com/avatar/${hash}?${params.toString()}`;
  }

  // 4) fallback to local default
  return DEFAULT_AVATAR;
}
