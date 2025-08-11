import React from 'react';
import { AmigoDetail } from '../../types/AmigoDetailTypes';
import { Amigo } from '../../types/AmigoTypes';
import '../../assets/sass/pages/_amigoDetails.scss';

interface AmigoDetailItemProps {
  amigoDetail: AmigoDetail | null; // Allow amigoDetail to be null
  amigo: Amigo;
}

// Utility function to format keys for display
const formatString = (key: string): string => {
  return key
    .replace(/_/g, ' ')   // Replace underscores with spaces
    .replace(/\b\w/g, c => c.toUpperCase()); // Capitalize first letters
};

const AmigoDetailItem: React.FC<AmigoDetailItemProps> = ({ amigoDetail, amigo }) => {
  const firstName = amigo.first_name || 'Unknown';
  const lastName = amigo.last_name || 'Unknown';

  // If there is no amigoDetail, show a "No Details Information Found" message
  if (!amigoDetail) {
    return (
      <div className="amigo-detail-item" aria-labelledby="amigo-detail-item__header">
        <h2 className="amigo-detail-item__header" id="amigo-detail-item__header">
          Details for {firstName} {lastName}
        </h2>
        <p className="amigo-detail-item__message">Message: No details information found.</p>
      </div>
    );
  }

  // Collect non-empty fields to display
  const detailFields = Object.entries(amigoDetail).filter(([key, value]) => {
    return value !== null && value !== undefined && key !== 'id' && key !== 'amigo' && key !== 'amigo_id' && typeof value !== 'object';
  });

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

export default AmigoDetailItem;
