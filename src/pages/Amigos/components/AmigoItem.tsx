// src/pages/Amigos/components/AmigoItem.tsx
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '@/hooks/useAuth'; // <- use the context export you showed earlier
import Modal from '@/components/Common/Modal';
import AmigoDetailItem from '@/pages/AmigoDetails/components/AmigoDetailsItem';
import AmigoLocationItem from '@/pages/AmigoLocations/components/AmigoLocationItem';
import { fetchAmigoDetails, fetchAmigoLocations } from '@/services/AmigoService';
import type { Amigo } from '@/types/AmigoTypes';
import type { AmigoDetails } from '@/types/AmigoDetailsTypes';
import type { AmigoLocation } from '@/types/AmigoLocationTypes';
// import styles from "../Amigos.module.scss";

interface AmigoItemProps {
  amigo: Amigo;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
const API_ORIGIN = (() => {
  try {
    return new URL(API_BASE).origin; // e.g. "https://localhost:3001"
  } catch {
    return '';
  }
})();

const AmigoItem: React.FC<AmigoItemProps> = ({ amigo }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const canEdit = !!currentUser && currentUser.id === amigo.id;
  const DEFAULT_AVATAR = `${API_ORIGIN}/images/default-amigo-avatar.png`;

  const avatarUrl = useMemo(() => {
    const raw = amigo.avatar_url;
    const src = (typeof raw === 'string' ? raw : '').trim();
    if (!src) return DEFAULT_AVATAR;

    // Absolute URLs pass through; relative paths get the API origin prefix.
    return src.startsWith('http://') || src.startsWith('https://')
      ? src
      : `${API_ORIGIN}${src}`;
  }, [amigo.avatar_url]);

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
    <article className="card card--profile">
      <div className="card__media card__media--avatar">
        <img
          src={avatarUrl}
          alt={`${amigo.first_name} ${amigo.last_name}'s avatar`}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = DEFAULT_AVATAR;
          }}
        />
      </div>

      <div className="card__body">
        <h3 className="card__title">
          {amigo.first_name} {amigo.last_name}
        </h3>

        <ul className="card__list">
          {Object.entries(amigo).map(([key, value]) => {
            if (
              value == null ||
              ['id', 'avatar_url', 'created_at', 'updated_at', 'unformatted_phone_1', 'unformatted_phone_2'].includes(key)
            ) {
              return null;
            }
            const display = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value);
            return (
              <li key={key} className="card__list-item">
                <span className="card__label">
                  {key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}:
                </span>
                {display}
              </li>
            );
          })}
        </ul>

        <div className="card__actions">
          <button className="button button--secondary" onClick={handleOpenDetailModal}>
            View Details
          </button>
          <button className="button button--secondary" onClick={handleOpenLocationModal}>
            View Address(es)
          </button>

          {canEdit && (
            <button
              className="button button--primary"
              onClick={() => navigate('/user-profile?edit=amigo')}
            >
              Edit Profile
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
          <div className="card__body">
            {amigoLocations.map((location) => (
              <AmigoLocationItem key={location.id} location={location} amigo={amigo} />
            ))}
          </div>
        ) : (
          <AmigoLocationItem location={null} amigo={amigo} />
        )}
      </Modal>
    </article>
  );
};

export default AmigoItem;
