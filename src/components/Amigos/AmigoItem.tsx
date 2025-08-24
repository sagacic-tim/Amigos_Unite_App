import React, { useState } from 'react';
import { Amigo } from '../../types/AmigoTypes';
import Modal from '../Common/Modal';
import AmigoDetailItem from '../AmigoDetails/AmigoDetailItem';
import '../../assets/sass/pages/_amigos.scss';
import { AmigoDetail } from '../../types/AmigoDetailTypes';
import { AmigoLocation } from '../../types/AmigoLocationTypes';
import { fetchAmigoDetails, fetchAmigoLocations } from '../../services/AmigoService';
import AmigoLocationItem from '../AmigoLocations/AmigoLocationItem';

interface AmigoItemProps {
  amigo: Amigo;
}

const AmigoItem: React.FC<AmigoItemProps> = ({ amigo }) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || ''; // Set your base URL in environment variables
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [amigoDetail, setAmigoDetail] = useState<AmigoDetail | null>(null);
  const [amigoLocations, setAmigoLocations] = useState<AmigoLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAvatarUrl = () => {
    const defaultAvatarUrl = `${baseUrl}/default-amigo-avatar.png`;
  
    if (amigo.avatar_url && amigo.avatar_url.trim() !== '') {
      return `${baseUrl}${amigo.avatar_url}`;
    }
  
    return defaultAvatarUrl;
  }

  const handleOpenDetailModal = async () => {
    setIsDetailModalOpen(true);
    setLoading(true);
    setError(null);

    try {
      const amigoDetailData = await fetchAmigoDetails(amigo.id);
      if (Object.keys(amigoDetailData).length === 0) {
        setError('No Details Information Found');
      } else {
        setAmigoDetail(amigoDetailData);
      }
    } catch (error: any) {
      console.error('Error fetching amigo details:', error);
      setError('Error loading amigo details.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenLocationModal = async () => {
    setIsLocationModalOpen(true);
    setLoading(true);
    setError(null);

    try {
      const amigoLocationsData = await fetchAmigoLocations(amigo.id);
      setAmigoLocations(amigoLocationsData.length > 0 ? amigoLocationsData : []);
    } catch (error: any) {
      console.error('Error fetching amigo locations:', error);
      setError('Error loading amigo locations.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
    setIsLocationModalOpen(false);
    setAmigoDetail(null);
    setAmigoLocations([]);
    setError(null);
  };

  return (
    <div className="amigo-item">
      <div className="amigo-item__avatar">
        {amigo.avatar_url && <img src={getAvatarUrl()} alt={`${amigo.first_name} ${amigo.last_name}'s avatar`} />}
      </div>
      <div className="amigo-item__details">
        <h2 className="amigo-item__details--heading">{amigo.first_name} {amigo.last_name}</h2>
        <ul className="amigo-item__details--list">
          {Object.entries(amigo).map(([key, value]) => {
            // Skip unformatted phone numbers and other irrelevant keys
            if (value === null || value === undefined || ['id', 'avatar_url', 'created_at', 'updated_at', 'unformatted_phone_1', 'unformatted_phone_2'].includes(key)) {
              return null;
            }

            // Format the value for display (e.g., booleans as Yes/No)
            const displayValue = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value;

            return (
              <li key={key} className="amigo-item__details--list-item">
                <span className="amigo-item__details--label">
                  {key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}:
                </span> 
                {displayValue}
              </li>
            );
          })}
        </ul>
        <button className="button--secondary" onClick={handleOpenDetailModal}>View Details</button>
        <button className="button--secondary" onClick={handleOpenLocationModal}>View Address(es)</button>
      </div>

      <Modal isOpen={isDetailModalOpen} onClose={handleCloseModal}>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>{error}</p>
        ) : amigoDetail ? (
          <AmigoDetailItem amigoDetail={amigoDetail} amigo={amigo} />
        ) : (
          <p>No Details Information Found.</p>
        )}
      </Modal>

      <Modal isOpen={isLocationModalOpen} onClose={handleCloseModal}>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>{error}</p>
        ) : amigoLocations.length > 0 ? (
          <div className="amigo-item__locations">
            {amigoLocations.map((location) => (
              <AmigoLocationItem key={location.id} location={location} amigo={amigo} />
            ))}
          </div>
        ) : (
          <AmigoLocationItem location={null} amigo={amigo} />
        )}
      </Modal>
    </div>
  );
};

export default AmigoItem;
