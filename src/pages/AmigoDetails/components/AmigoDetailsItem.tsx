// src/pages/AmigoDetails/components/AmigoDetailsItem.tsx
import React from 'react';
import { AmigoDetails } from '@/types/AmigoDetailsTypes';
import { Amigo } from '@/types/AmigoTypes';
import '@/assets/sass/pages/_amigoDetails.scss';

interface AmigoDetailsItemProps {
  amigoDetails: AmigoDetails | null; // <-- match the prop name used below
  amigo: Amigo;
}

// Utility function to format keys for display
const formatString = (key: string): string =>
  key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const AmigoDetailsItem: React.FC<AmigoDetailsItemProps> = ({ amigoDetails, amigo }) => {
  const firstName = amigo.first_name || 'Unknown';
  const lastName = amigo.last_name || 'Unknown';

  if (!amigoDetails) {
    return (
      <div className="amigo-detail-item" aria-labelledby="amigo-detail-item__header">
        <h2 className="amigo-detail-item__header" id="amigo-detail-item__header">
          Details for {firstName} {lastName}
        </h2>
        <p className="amigo-detail-item__message">Message: No details information found.</p>
      </div>
    );
  }

  // Exclude ids/relations/objects (e.g., 'locations') from the list
  const detailFields = Object.entries(amigoDetails).filter(([key, value]) =>
    value !== null &&
    value !== undefined &&
    key !== 'id' &&
    key !== 'amigo' &&
    key !== 'amigo_id' &&
    key !== 'locations' &&        // explicit, though typeof object covers it
    typeof value !== 'object'
  );

  return (
    <div className="amigo-detail-item" aria-labelledby="amigo-detail-item__header">
      <h2 className="amigo-detail-item__header" id="amigo-detail-item__header">
        Details for {firstName} {lastName}
      </h2>

      <p className="amigo-detail-item__field">Amigo Id: {amigo.id}</p>

      {detailFields.length > 0 ? (
        <ul className="amigo-detail-item__fields">
          {detailFields.map(([key, value]) => {
            const displayValue = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value;
            return (
              <li key={key} className="amigo-detail-item__field">
                {formatString(key)}:&nbsp;{displayValue}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="amigo-detail-item__message">Message: No details information found.</p>
      )}
    </div>
  );
};

export default AmigoDetailsItem;
