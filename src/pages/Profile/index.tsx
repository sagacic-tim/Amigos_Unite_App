// src/pages/Profile/index.tsx
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '@/context/AuthContext';
import privateApi, { triggerAuthRequired } from '@/services/privateApi';
import styles from './Profile.module.scss';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
type AmigoDetailsPayload = {
  date_of_birth?: string | null;
  member_in_good_standing?: boolean;
  available_to_host?: boolean;
  willing_to_help?: boolean;
  willing_to_donate?: boolean;
  personal_bio?: string | null;
};

type AmigoLocationPayload = {
  id?: number; // optional: new/unsaved location has no id yet
  address?: string | null; // view-only (composed)
  street_number?: string | null;
  street_name?: string | null;
  floor?: string | null;
  room_no?: string | null;
  apartment_suite_number?: string | null;
  city_sublocality?: string | null;
  city?: string | null;
  state_province_subdivision?: string | null;
  state_province?: string | null;
  state_province_short?: string | null;
  country?: string | null;
  country_short?: string | null;
  postal_code?: string | null;
  postal_code_suffix?: string | null;
  post_box?: string | null;

  latitude?: number | null;
  longitude?: number | null;
  time_zone?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

// ─────────────────────────────────────────────────────────────────────────────
// Reference data (extend as needed)
// ─────────────────────────────────────────────────────────────────────────────
const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  // TODO: add more as needed
];

const US_STATES = [
  { short: 'AL', long: 'Alabama' }, { short: 'AK', long: 'Alaska' },
  { short: 'AZ', long: 'Arizona' }, { short: 'AR', long: 'Arkansas' },
  { short: 'CA', long: 'California' }, { short: 'CO', long: 'Colorado' },
  { short: 'CT', long: 'Connecticut' }, { short: 'DE', long: 'Delaware' },
  { short: 'FL', long: 'Florida' }, { short: 'GA', long: 'Georgia' },
  { short: 'HI', long: 'Hawaii' }, { short: 'ID', long: 'Idaho' },
  { short: 'IL', long: 'Illinois' }, { short: 'IN', long: 'Indiana' },
  { short: 'IA', long: 'Iowa' }, { short: 'KS', long: 'Kansas' },
  { short: 'KY', long: 'Kentucky' }, { short: 'LA', long: 'Louisiana' },
  { short: 'ME', long: 'Maine' }, { short: 'MD', long: 'Maryland' },
  { short: 'MA', long: 'Massachusetts' }, { short: 'MI', long: 'Michigan' },
  { short: 'MN', long: 'Minnesota' }, { short: 'MS', long: 'Mississippi' },
  { short: 'MO', long: 'Missouri' }, { short: 'MT', long: 'Montana' },
  { short: 'NE', long: 'Nebraska' }, { short: 'NV', long: 'Nevada' },
  { short: 'NH', long: 'New Hampshire' }, { short: 'NJ', long: 'New Jersey' },
  { short: 'NM', long: 'New Mexico' }, { short: 'NY', long: 'New York' },
  { short: 'NC', long: 'North Carolina' }, { short: 'ND', long: 'North Dakota' },
  { short: 'OH', long: 'Ohio' }, { short: 'OK', long: 'Oklahoma' },
  { short: 'OR', long: 'Oregon' }, { short: 'PA', long: 'Pennsylvania' },
  { short: 'RI', long: 'Rhode Island' }, { short: 'SC', long: 'South Carolina' },
  { short: 'SD', long: 'South Dakota' }, { short: 'TN', long: 'Tennessee' },
  { short: 'TX', long: 'Texas' }, { short: 'UT', long: 'Utah' },
  { short: 'VT', long: 'Vermont' }, { short: 'VA', long: 'Virginia' },
  { short: 'WA', long: 'Washington' }, { short: 'WV', long: 'West Virginia' },
  { short: 'WI', long: 'Wisconsin' }, { short: 'WY', long: 'Wyoming' },
];

const CA_PROVINCES = [
  { short: 'AB', long: 'Alberta' }, { short: 'BC', long: 'British Columbia' },
  { short: 'MB', long: 'Manitoba' }, { short: 'NB', long: 'New Brunswick' },
  { short: 'NL', long: 'Newfoundland and Labrador' }, { short: 'NS', long: 'Nova Scotia' },
  { short: 'NT', long: 'Northwest Territories' }, { short: 'NU', long: 'Nunavut' },
  { short: 'ON', long: 'Ontario' }, { short: 'PE', long: 'Prince Edward Island' },
  { short: 'QC', long: 'Quebec' }, { short: 'SK', long: 'Saskatchewan' },
  { short: 'YT', long: 'Yukon' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function composeAddress(loc: Partial<AmigoLocationPayload>): string {
  const parts = [
    [loc.street_number, loc.street_name].filter(Boolean).join(' '),
    loc.apartment_suite_number,
    loc.floor ? `Floor ${loc.floor}` : '',
    loc.room_no ? `Room ${loc.room_no}` : '',
    loc.city_sublocality,
    loc.city,
    [loc.state_province_short || loc.state_province, loc.postal_code].filter(Boolean).join(' '),
    loc.country,
  ].filter(Boolean);
  return parts.join(', ');
}

// ─────────────────────────────────────────────────────────────────────────────
export default function Profile() {
  const { isLoggedIn, currentUser } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<AmigoDetailsPayload>({});
  const [location, setLocation] = useState<AmigoLocationPayload | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const amigoId = currentUser?.id;

  const regionOptions = useMemo(() => {
    return {
      US: US_STATES,
      CA: CA_PROVINCES,
    } as Record<string, { short: string; long: string }[]>;
  }, []);

  const loadAll = useCallback(async () => {
    if (!amigoId) return;
    setLoading(true);
    setError(null);
    setSaved(false);

    try {
      // Details
      const d = await privateApi.get(`/api/v1/amigos/${amigoId}/amigo_detail`, { withCredentials: true });
      setDetails(d?.data ?? {});
    } catch {
      setDetails({});
    }

    try {
      // Locations (only keep the first one)
      const l = await privateApi.get(`/api/v1/amigos/${amigoId}/amigo_locations`, { withCredentials: true });
      const list = Array.isArray(l?.data) ? l.data : (l?.data?.data ?? []);
      setLocation(list?.[0] ?? null);
    } catch {
      setLocation(null);
    }

    setLoading(false);
  }, [amigoId]);

  // Auth guard
  useEffect(() => {
    if (!isLoggedIn) {
      triggerAuthRequired('Please log in to view this page.');
      navigate('/', { replace: true });
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    if (isLoggedIn && amigoId) {
      loadAll();
    } else if (isLoggedIn && !amigoId) {
      setLoading(false);
    }
  }, [isLoggedIn, amigoId, loadAll]);

  if (!isLoggedIn) return null;

  if (isLoggedIn && !amigoId) {
    return (
      <section className="section-content">
        <h1 className="page-title">Profile</h1>
        <p>Loading your profile…</p>
      </section>
    );
  }

  // ── Handlers: Details & Location ───────────────────────────────────────────
  const handleDetailsChange = (field: keyof AmigoDetailsPayload, value: any) => {
    setDetails((prev) => ({ ...(prev ?? {}), [field]: value }));
  };

  const handleLocationChange = (field: keyof AmigoLocationPayload, value: any) => {
    setLocation((prev) => ({ ...(prev ?? {}), [field]: value } as AmigoLocationPayload));
  };

  // Single save for both Details and Location
  const saveAll = async () => {
    if (!amigoId) return;
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      // Save Details (PATCH; if 404 then POST)
      await privateApi
        .patch(`/api/v1/amigos/${amigoId}/amigo_detail`, { amigo_detail: details }, { withCredentials: true })
        .catch(async (err) => {
          if (err?.response?.status === 404) {
            await privateApi.post(`/api/v1/amigos/${amigoId}/amigo_detail`, { amigo_detail: details }, { withCredentials: true });
          } else {
            throw err;
          }
        });

      // Save Location (only one allowed)
      if (location) {
        if (location.id) {
          await privateApi.patch(
            `/api/v1/amigos/${amigoId}/amigo_locations/${location.id}`,
            { amigo_location: location },
            { withCredentials: true }
          );
        } else {
          // Create new location
          await privateApi.post(
            `/api/v1/amigos/${amigoId}/amigo_locations`,
            { amigo_location: location },
            { withCredentials: true }
          );
        }
      } else {
        // If absolutely nothing is provided, no-op. (Optional: create an empty shell)
      }

      // Refresh to display server-populated fields (lat/lng/time_zone/timestamps)
      await loadAll();
      setSaved(true);
    } catch (e: any) {
      setError(e?.response?.data?.errors?.[0] ?? 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const countryCode = (location?.country_short || '').toUpperCase();
  const regions = regionOptions[countryCode] ?? [];
  const address = location ? (location.address || composeAddress(location)) : '';

  return (
    <section className={`section-content ${styles.page}`}>
      <h1 className={`page-title ${styles.header}`}>Amigo Profile</h1>

      {error && <p className="form-error">{error}</p>}
      {saved && <p className="form-success">Saved!</p>}

      {loading ? (
        <p>Loading…</p>
      ) : (
        <>
          {/* ───────────────── Amigo Details ───────────────── */}
          <div className="card card--details">
            <h2>Amigo Details</h2>

            <div className="form-grid">
              <fieldset>
                <label>
                  <span>Date of Birth</span>
                  <input
                    type="date"
                    value={details?.date_of_birth ?? ''}
                    onChange={(e) => handleDetailsChange('date_of_birth', e.target.value || null)}
                  />
                </label>

                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={!!details?.member_in_good_standing}
                    onChange={(e) => handleDetailsChange('member_in_good_standing', e.target.checked)}
                  />
                  <span>Member in good standing</span>
                </label>

                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={!!details?.available_to_host}
                    onChange={(e) => handleDetailsChange('available_to_host', e.target.checked)}
                  />
                  <span>Available to host</span>
                </label>

                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={!!details?.willing_to_help}
                    onChange={(e) => handleDetailsChange('willing_to_help', e.target.checked)}
                  />
                  <span>Willing to help</span>
                </label>

                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={!!details?.willing_to_donate}
                    onChange={(e) => handleDetailsChange('willing_to_donate', e.target.checked)}
                  />
                  <span>Willing to donate</span>
                </label>

                <label className="textarea">
                  <span>Personal Bio</span>
                  <textarea
                    value={details?.personal_bio ?? ''}
                    onChange={(e) => handleDetailsChange('personal_bio', e.target.value || null)}
                    rows={5}
                  />
                </label>
              </fieldset>
            </div>
          </div>

          {/* ───────────────── Amigo Location (single) ─────── */}
          <div className="card card--locations">
            <h2>Amigo Location</h2>

            <div className="form-grid">
              {/* View-only composed address */}
              <label>
                <span>Address (view only)</span>
                <input type="text" value={address} readOnly />
              </label>

              <label>
                <span>Street Number</span>
                <input
                  type="text"
                  value={location?.street_number ?? ''}
                  onChange={(e) => handleLocationChange('street_number', e.target.value)}
                />
              </label>

              <label>
                <span>Street Name</span>
                <input
                  type="text"
                  value={location?.street_name ?? ''}
                  onChange={(e) => handleLocationChange('street_name', e.target.value)}
                />
              </label>

              <label>
                <span>Floor</span>
                <input
                  type="text"
                  value={location?.floor ?? ''}
                  onChange={(e) => handleLocationChange('floor', e.target.value)}
                />
              </label>

              <label>
                <span>Room No</span>
                <input
                  type="text"
                  value={location?.room_no ?? ''}
                  onChange={(e) => handleLocationChange('room_no', e.target.value)}
                />
              </label>

              <label>
                <span>Apt/Suite</span>
                <input
                  type="text"
                  value={location?.apartment_suite_number ?? ''}
                  onChange={(e) => handleLocationChange('apartment_suite_number', e.target.value)}
                />
              </label>

              <label>
                <span>City Sublocality</span>
                <input
                  type="text"
                  value={location?.city_sublocality ?? ''}
                  onChange={(e) => handleLocationChange('city_sublocality', e.target.value)}
                />
              </label>

              <label>
                <span>City</span>
                <input
                  type="text"
                  value={location?.city ?? ''}
                  onChange={(e) => handleLocationChange('city', e.target.value)}
                />
              </label>

              {/* Country (dropdown) */}
              <label>
                <span>Country</span>
                <select
                  value={location?.country_short ?? ''}
                  onChange={(e) => {
                    const code = e.target.value || '';
                    const long = COUNTRIES.find(c => c.code === code)?.name ?? '';
                    handleLocationChange('country_short', code);
                    handleLocationChange('country', long);
                    // Reset region fields when country changes
                    handleLocationChange('state_province_short', '');
                    handleLocationChange('state_province', '');
                    handleLocationChange('state_province_subdivision', '');
                  }}
                >
                  <option value="">— Select country —</option>
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
              </label>

              {/* State/Province (dropdown shows both short + long) */}
              <label>
                <span>State/Province</span>
                <select
                  value={location?.state_province_short ?? ''}
                  onChange={(e) => {
                    const s = e.target.value || '';
                    const entry = regions.find(r => r.short === s);
                    handleLocationChange('state_province_short', s);
                    handleLocationChange('state_province', entry?.long ?? '');
                    handleLocationChange('state_province_subdivision', entry?.long ?? '');
                  }}
                  disabled={regions.length === 0}
                >
                  <option value="">{regions.length ? '— Select —' : '— N/A —'}</option>
                  {regions.map((r) => (
                    <option key={r.short} value={r.short}>
                      {r.short} — {r.long}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Postal Code</span>
                <input
                  type="text"
                  value={location?.postal_code ?? ''}
                  onChange={(e) => handleLocationChange('postal_code', e.target.value)}
                />
              </label>

              <label>
                <span>Postal Code Suffix</span>
                <input
                  type="text"
                  value={location?.postal_code_suffix ?? ''}
                  onChange={(e) => handleLocationChange('postal_code_suffix', e.target.value)}
                />
              </label>

              <label>
                <span>Post Box</span>
                <input
                  type="text"
                  value={location?.post_box ?? ''}
                  onChange={(e) => handleLocationChange('post_box', e.target.value)}
                />
              </label>

              {/* View-only / managed by backend after Google geocoding */}
              <label>
                <span>Latitude</span>
                <input type="text" value={location?.latitude ?? ''} readOnly />
              </label>
              <label>
                <span>Longitude</span>
                <input type="text" value={location?.longitude ?? ''} readOnly />
              </label>
              <label>
                <span>Time Zone</span>
                <input type="text" value={location?.time_zone ?? ''} readOnly />
              </label>
            </div>
          </div>

          {/* ───────────────── Actions (single Save) ──────── */}
          <div className="actions">
            <button className="button button--primary" onClick={saveAll} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </>
      )}
    </section>
  );
}
