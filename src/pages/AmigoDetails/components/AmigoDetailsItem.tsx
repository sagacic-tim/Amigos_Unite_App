// src/pages/AmigoDetails/components/AmigoDetailsItem.tsx
import React, { useMemo } from 'react';
import type { AmigoDetails } from '@/types/AmigoDetailsTypes';
import type { Amigo } from '@/types/AmigoTypes';
import { buildAvatarUrl, DEFAULT_AVATAR } from '@/utils/avatar';
import styles from '../AmigoDetails.module.scss';

interface AmigoDetailsItemProps {
  amigoDetails: AmigoDetails | null;
  amigo: Amigo;
}


const formatString = (key: string): string =>
  key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const AmigoDetailsItem: React.FC<AmigoDetailsItemProps> = ({ amigoDetails, amigo }) => {
  const firstName = amigo.first_name || 'Unknown';
  const lastName  = amigo.last_name  || 'Unknown';
  const headingId = `amigo-details-heading-${amigo.id}`;

  const avatarSrc = useMemo(() => buildAvatarUrl(amigo), [amigo]);

  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.dataset.fallbackApplied === 'true') return; // avoid loops
    img.dataset.fallbackApplied = 'true';
    img.src = DEFAULT_AVATAR;
  };

  const renderAvatarBlock = () => (
    <div className="card__avatar-block">
      <span className="avatar avatar--lg">
        <img
          src={avatarSrc}
          alt={`${firstName} ${lastName}`}
          onError={handleImgError}
          loading="lazy"
        />
      </span>
      <span>Shown across the app</span>
    </div>
  );

  if (!amigoDetails) {
    return (
      <article className="card card--details" aria-labelledby={headingId}>
        <h2 className="card__title" id={headingId}>
          Details for {firstName} {lastName}
        </h2>

        {renderAvatarBlock()}

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
    key !== 'avatar_url' &&
    typeof value !== 'object'
  );

  return (
    <article className={`card card--details ${styles.amigoDetailsCard}`} aria-labelledby={headingId}>
      <h3 className="card__title" id={headingId}>
        Details for {firstName} {lastName}
      </h3>

      {renderAvatarBlock()}

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
