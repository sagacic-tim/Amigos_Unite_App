// src/pages/Amigos/AmigosItem.tsx
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import Modal from '@/components/Common/Modal';
import AmigoDetailItem from '@/pages/AmigoDetails/components/AmigoDetailsItem';
import AmigoLocationItem from '@/pages/AmigoLocations/components/AmigoLocationItem';
import { fetchAmigoDetails, fetchAmigoLocations } from '@/services/AmigoService';
import type { Amigo } from '@/types/AmigoTypes';
import type { AmigoDetails } from '@/types/AmigoDetailsTypes';
import type { AmigoLocation } from '@/types/AmigoLocationTypes';
import '@/assets/sass/pages/_amigos.scss';

interface AmigoItemProps {
  amigo: Amigo;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
// Safely compute the ORIGIN (protocol + host + optional port), stripping any path like /api/v1
const API_ORIGIN = (() => {
  try {
    return new URL(API_BASE).origin; // e.g. "http://localhost:3001"
  } catch {
    return ''; // best-effort fallback
  }
})();

const AmigoItem: React.FC<AmigoItemProps> = ({ amigo }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // only allow editing if the viewing user == this amigo (no admin fields required)
  const canEdit = !!currentUser && currentUser.id === amigo.id;

  const apiBase = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
  const DEFAULT_AVATAR = `${API_ORIGIN}/images/default-amigo-avatar.png`;

  const avatarUrl = useMemo(() => {
    const raw = amigo.avatar_url;
    const src = (typeof raw === 'string' ? raw : '').trim();
    if (!src) return DEFAULT_AVATAR;

  // Absolute URLs pass through; relative paths get the API origin prefix.
  return src.startsWith('http://') || src.startsWith('https://')
    ? src
    : `${API_ORIGIN}${src}`;
}, [amigo.avatar_url, API_ORIGIN]);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [amigoDetail, setAmigoDetail] = useState<AmigoDetails | null>(null);
  const [amigoLocations, setAmigoLocations] = useState<AmigoLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenDetailModal = async () => {
    setIsDetailModalOpen(true);
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAmigoDetails(amigo.id);
      if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
        setError('No Details Information Found');
        setAmigoDetail(null);
      } else {
        setAmigoDetail(data);
      }
    } catch (err) {
      console.error('Error fetching amigo details:', err);
      setError('Error loading amigo details.');
      setAmigoDetail(null);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenLocationModal = async () => {
    setIsLocationModalOpen(true);
    setLoading(true);
    setError(null);
    try {
      const list = await fetchAmigoLocations(amigo.id);
      setAmigoLocations(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Error fetching amigo locations:', err);
      setError('Error loading amigo locations.');
      setAmigoLocations([]);
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
        <img
          src={avatarUrl}
          alt={`${amigo.first_name} ${amigo.last_name}'s avatar`}
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = DEFAULT_AVATAR; }}
        />
      </div>

      <div className="amigo-item__details">
        <h2 className="amigo-item__details--heading">
          {amigo.first_name} {amigo.last_name}
        </h2>

        <ul className="amigo-item__details--list">
          {Object.entries(amigo).map(([key, value]) => {
            if (
              value === null ||
              value === undefined ||
              ['id', 'avatar_url', 'created_at', 'updated_at', 'unformatted_phone_1', 'unformatted_phone_2'].includes(key)
            ) {
              return null;
            }
            const display =
              typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value);
            return (
              <li key={key} className="amigo-item__details--list-item">
                <span className="amigo-item__details--label">
                  {key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}:
                </span>
                {display}
              </li>
            );
          })}
        </ul>

        <div className="amigo-item__actions">
          <button className="button__secondary" onClick={handleOpenDetailModal}>
            View Details
          </button>
          <button className="button__secondary" onClick={handleOpenLocationModal}>
            View Address(es)
          </button>

          {canEdit && (
            <button
              className="button__primary"
              onClick={() => navigate('/user-profile?edit=amigo')}
            >
              Edit my details
            </button>
          )}
        </div>
      </div>

      <Modal isOpen={isDetailModalOpen} onClose={handleCloseModal}>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>{error}</p>
        ) : amigoDetail ? (
          <AmigoDetailItem amigoDetails={amigoDetail} amigo={amigo} />
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
