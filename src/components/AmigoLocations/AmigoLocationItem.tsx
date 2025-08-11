import React from 'react';
import { AmigoLocation } from '../../types/AmigoLocationTypes';
import { Amigo } from '../../types/AmigoTypes';
import '../../assets/sass/pages/_amigoLocations.scss';

interface AmigoLocationItemProps {
  location: AmigoLocation | null; // Allow location to be null
  amigo: Amigo;
}

// Utility function to format keys for display
const formatString = (key: string): string => {
  return key
    .replace(/_/g, ' ')   // Replace underscores with spaces
    .replace(/\b\w/g, c => c.toUpperCase()); // Capitalize first letters
};

const AmigoLocationItem: React.FC<AmigoLocationItemProps> = ({ location, amigo }) => {
  const firstName = amigo.first_name || 'Unknown';
  const lastName = amigo.last_name || 'Unknown';

  // If there is no location data, show a "No Address Information Found" message
  if (!location) {
    return (
      <div className="amigo-location-item" aria-labelledby="amigo-location-item__header">
        <h2 className="amigo-location-item__header" id="amigo-location-item__header">
          Address(es) for {firstName} {lastName}
        </h2>
        <p className="amigo-location-item__field">Amigo Id: {amigo.id}</p>
        <p className="amigo-location-item__message">Message: No Address Information Found.</p>
      </div>
    );
  }

  // Collect non-empty fields to display, excluding amigo_id
  const locationFields = Object.entries(location).filter(([key, value]) => {
    return value !== null && value !== undefined && key !== 'id' && key !== 'amigo' && key !== 'amigo_id' && typeof value !== 'object';
  });

  return (
    <div className="amigo-location-item" aria-labelledby="amigo-location-item__header">
      <h2 className="amigo-location-item__header" id="amigo-location-item__header">
        Address for {firstName} {lastName}
      </h2>
      
      <p className="amigo-location-item__field">Amigo Id: {amigo.id}</p>

      {locationFields.length > 0 ? (
        <ul className="amigo-location-item__fields">
          {locationFields.map(([key, value]) => (
            <li key={key} className="amigo-location-item__field">
              {formatString(key)}:&nbsp;{value}
            </li>
          ))}
        </ul>
      ) : (
        <p className="amigo-location-item__message">Message: No address information found.</p>
      )}
    </div>
  );
};

export default AmigoLocationItem;
