// src/pages/AmigoDetails/components/AmigoDetailsItem.tsx
import React from 'react';
import type { AmigoDetails } from '@/types/AmigoDetailsTypes';
import type { Amigo } from '@/types/AmigoTypes';

interface AmigoDetailsItemProps {
  amigoDetails: AmigoDetails | null;
  amigo: Amigo;
}

const apiOrigin = import.meta.env.VITE_API_ORIGIN as string; // ⬅️ add this

const formatString = (key: string): string =>
  key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const AmigoDetailsItem: React.FC<AmigoDetailsItemProps> = ({ amigoDetails, amigo }) => {
  const firstName = amigo.first_name || 'Unknown';
  const lastName  = amigo.last_name  || 'Unknown';
  const headingId = 'amigo-details-heading';

  // ⬇️ build a safe src: absolute (gravatar) or relative (blob), else default
  const avatarSrc = (() => {
    const url = amigo?.avatar_url || '';
    if (!url) return '/images/default-amigo-avatar.png';
    return url.startsWith('http') ? url : `${apiOrigin}${url}`;
  })();
  // ⬆️

  if (!amigoDetails) {
    return (
      <article className="card card--details" aria-labelledby={headingId}>
        <h2 className="card__title" id={headingId}>
          Details for {firstName} {lastName}
        </h2>

        {/* ⬇️ show avatar even if no details */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '8px 0 16px' }}>
          <img
            src={avatarSrc}
            alt={`${firstName} ${lastName}`}
            width={80}
            height={80}
            style={{ borderRadius: '50%', objectFit: 'cover' }}
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/default-amigo-avatar.png'; }}
          />
          <span>Shown across the app</span>
        </div>
        {/* ⬆️ */}

        <p className="card__message">Message: No details information found.</p>
      </article>
    );
  }

  const detailFields = Object.entries(amigoDetails).filter(([key, value]) =>
    value !== null &&
    value !== undefined &&
    key !== 'id' &&
    key !== 'amigo' &&
    key !== 'amigo_id' &&
    key !== 'locations' &&
    typeof value !== 'object'
  );

  return (
    <article className="card card--details" aria-labelledby={headingId}>
      <h3 className="card__title" id={headingId}>
        Details for {firstName} {lastName}
      </h3>

      {/* ⬇️ avatar block at top of card */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '8px 0 16px' }}>
        <img
          src={avatarSrc}
          alt={`${firstName} {lastName}`}
          width={80}
          height={80}
          style={{ borderRadius: '50%', objectFit: 'cover' }}
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/default-amigo-avatar.png'; }}
        />
        <span>Shown across the app</span>
      </div>
      {/* ⬆️ */}

      <ul className="card__fields">
        <li className="card__field">
          <span className="card__field-label">Amigo Id:</span>{amigo.id}
        </li>

        {detailFields.length > 0 ? (
          detailFields.map(([key, value]) => {
            const display = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value);
            return (
              <li key={key} className="card__field prose">
                <span className="card__field-label">{formatString(key)}:</span>{display}
              </li>
            );
          })
        ) : (
          <li className="card__field">No additional details found.</li>
        )}
      </ul>
    </article>
  );
};

export default AmigoDetailsItem;
