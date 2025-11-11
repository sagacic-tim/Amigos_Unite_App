// src/pages/Amigos/components/AmigoItem.tsx
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
import { buildAvatarUrl, DEFAULT_AVATAR } from '@/utils/avatar';

interface AmigoItemProps {
  amigo: Amigo;
}

const AmigoItem: React.FC<AmigoItemProps> = ({ amigo }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Is this card the logged-in amigo?
  const canEdit = !!currentUser && currentUser.id === amigo.id;

  // Prefer currentUser when this card represents the logged-in amigo
  const effectiveAmigo = useMemo<Amigo>(() => {
    if (currentUser && currentUser.id === amigo.id) {
      return { ...amigo, ...currentUser };
    }
    return amigo;
  }, [amigo, currentUser]);

  // Build avatar from the effective amigo (so new avatar shows up immediately)
  const avatarUrl = useMemo(
    () => buildAvatarUrl(effectiveAmigo),
    [effectiveAmigo]
  );

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [amigoDetail, setAmigoDetail] = useState<AmigoDetails | null>(null);
  const [amigoLocations, setAmigoLocations] = useState<AmigoLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.dataset.fallbackApplied === 'true') return; // prevent loops if default fails
    img.dataset.fallbackApplied = 'true';
    img.src = DEFAULT_AVATAR;
  };

  const handleOpenDetailModal = async () => {
    setIsDetailModalOpen(true);
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAmigoDetails(effectiveAmigo.id);
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
      const list = await fetchAmigoLocations(effectiveAmigo.id);
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
          alt={`${effectiveAmigo.first_name} ${effectiveAmigo.last_name}'s avatar`}
          loading="lazy"
          onError={handleImgError}
        />
      </div>

      <div className="card__body">
        <h3 className="card__title">
          {effectiveAmigo.first_name} {effectiveAmigo.last_name}
        </h3>

        <ul className="card__list">
          {Object.entries(effectiveAmigo).map(([key, value]) => {
            if (
              value == null ||
              [
                'id',
                'avatar_url',
                'avatar-url',
                'created_at',
                'updated_at',
                'unformatted_phone_1',
                'unformatted_phone_2',
              ].includes(key)
            ) {
              return null;
            }
            const display =
              typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value);
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
          <AmigoDetailItem amigoDetails={amigoDetail} amigo={effectiveAmigo} />
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
              <AmigoLocationItem key={location.id} location={location} amigo={effectiveAmigo} />
            ))}
          </div>
        ) : (
          <AmigoLocationItem location={null} amigo={effectiveAmigo} />
        )}
      </Modal>
    </article>
  );
};

export default AmigoItem;
