// src/pages/AmigoDetails/components/AmigoDetailsItem.tsx
import React from 'react';
import type { AmigoDetails } from '@/types/AmigoDetailsTypes';
import type { Amigo } from '@/types/AmigoTypes';

interface AmigoDetailsItemProps {
  amigoDetails: AmigoDetails | null;
  amigo: Amigo;
}

const formatString = (key: string): string =>
  key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const AmigoDetailsItem: React.FC<AmigoDetailsItemProps> = ({ amigoDetails, amigo }) => {
  const firstName = amigo.first_name || 'Unknown';
  const lastName  = amigo.last_name  || 'Unknown';
  const headingId = 'amigo-details-heading';

  if (!amigoDetails) {
    return (
      <article className="card card--details" aria-labelledby={headingId}>
        <h2 className="card__title" id={headingId}>
          Details for {firstName} {lastName}
        </h2>
        <p className="card__message prose">Message: No details information found.</p>
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
          <li className="card__field prose">No additional details found.</li>
        )}
      </ul>
    </article>
  );
};

export default AmigoDetailsItem;
