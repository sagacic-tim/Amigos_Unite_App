// src/pages/Profile/index.tsx
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '@/hooks/useAuth'
import md5 from 'blueimp-md5';
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

const buildAmigoDetailsPayload = (src: any): AmigoDetailsPayload => ({
  date_of_birth: src.date_of_birth ?? null,
  member_in_good_standing: !!src.member_in_good_standing,
  available_to_host: !!src.available_to_host,
  willing_to_help: !!src.willing_to_help,
  willing_to_donate: !!src.willing_to_donate,
  personal_bio: src.personal_bio ?? null,
});

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


const buildAmigoLocationPayloadForSave = (src: Partial<AmigoLocationPayload>) => {
  const composedAddress = composeAddress(src);

  return {
    // use explicit address if present, otherwise fall back to composedAddress (or null)
    address: src.address ?? (composedAddress || null),

    floor: src.floor ?? null,
    street_number: src.street_number ?? null,
    street_name: src.street_name ?? null,
    room_no: src.room_no ?? null,
    apartment_suite_number: src.apartment_suite_number ?? null,
    city_sublocality: src.city_sublocality ?? null,
    city: src.city ?? null,
    state_province_subdivision: src.state_province_subdivision ?? null,
    state_province: src.state_province ?? null,
    state_province_short: src.state_province_short ?? null,
    country: src.country ?? null,
    country_short: src.country_short ?? null,
    postal_code: src.postal_code ?? null,
    postal_code_suffix: src.postal_code_suffix ?? null,
    post_box: src.post_box ?? null,
    latitude: src.latitude ?? null,
    longitude: src.longitude ?? null,
    time_zone: src.time_zone ?? null,
  };
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

function gravatarIdenticon(email: string, size = 80) {
  const hash = md5(email.trim().toLowerCase());
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon`;
}


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
  const {
    isLoggedIn,
    currentUser,
    refreshAuth,        // ← use this instead
    refreshCurrentUser
  } = useAuth();
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

  // ⬇️ ADD THESE LINES
  const apiOrigin = import.meta.env.VITE_API_ORIGIN as string;

  const initialAvatarSrc = useMemo(() => {
    if (currentUser?.avatar_url) return `${apiOrigin}${currentUser.avatar_url}`;
    const email = (currentUser?.email || '').trim().toLowerCase();
    if (email) return gravatarIdenticon(email, 80);
    return '/images/default-amigo-avatar.png';
  }, [apiOrigin, currentUser?.avatar_url, currentUser?.email]);
  // ⬆️ ADD THESE LINES

  const loadAll = useCallback(async () => {
    if (!amigoId) return;
    setLoading(true);
    setError(null);
    setSaved(false);

    try {
      const d = await privateApi.get(`/api/v1/amigos/${amigoId}/amigo_detail`, { withCredentials: true });
      const rawDetails = d?.data ?? {};
        setDetails(buildAmigoDetailsPayload(rawDetails));    }
    catch {
      setDetails({});
    }

    try {
      const l = await privateApi.get(`/api/v1/amigos/${amigoId}/amigo_locations`, { withCredentials: true });
      const list = Array.isArray(l?.data) ? l.data : (l?.data?.data ?? []);
      const first = list?.[0] ?? null;

      if (first) {
        const { amigo, ...rest } = first; // drop nested amigo; id stays
        setLocation(rest as AmigoLocationPayload);
      } else {
        setLocation(null);
      }
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
      // ─── Amigo Details: clean + upsert ───
      // details is already a normalized AmigoDetailsPayload
      const cleanDetails = buildAmigoDetailsPayload(details || {});

      await privateApi
        .patch(
          `/api/v1/amigos/${amigoId}/amigo_detail`,
          { amigo_detail: cleanDetails },
          { withCredentials: true }
        )
        .catch(async (err) => {
          if (err?.response?.status === 404) {
            await privateApi.post(
              `/api/v1/amigos/${amigoId}/amigo_detail`,
              { amigo_detail: cleanDetails },
              { withCredentials: true }
            );
          } else {
            throw err;
          }
        });

    // ─── Amigo Location (single): send only permitted fields ───
    if (location) {
      const cleanLocation = buildAmigoLocationPayloadForSave(location);

      if (location.id) {
        await privateApi.patch(
          `/api/v1/amigos/${amigoId}/amigo_locations/${location.id}`,
          { amigo_location: cleanLocation },
          { withCredentials: true }
        );
      } else {
        await privateApi.post(
          `/api/v1/amigos/${amigoId}/amigo_locations`,
          { amigo_location: cleanLocation },
          { withCredentials: true }
        );
      }
    }
      // Refresh UI data to show any server-calculated fields
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

          {/* ───────────────── Avatar ───────────────── */}
          <div className="card card--details">
            <h2>Avatar</h2>

            <div className="form-grid">
              {/* Current avatar */}
              <label>
                <span>Current</span>
                <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                  <img
                    src={initialAvatarSrc}
                    alt="Current avatar"
                    width={80}
                    height={80}
                    style={{ borderRadius: '50%', objectFit: 'cover' }}
                    onError={(e) => {
                      const img = e.currentTarget as HTMLImageElement;
                      const email = (currentUser?.email || '').trim().toLowerCase();
                      const stage = img.dataset.fallbackStage || '0';
                      if (stage === '0' && email) {
                        img.dataset.fallbackStage = '1';
                        img.src = gravatarIdenticon(email, 80);
                        return;
                      }
                      img.onerror = null;
                      img.src = '/images/default-amigo-avatar.png';
                    }}
                  />
                  <span>Shown across the app</span>
                </div>
              </label>

              {/* Choose source */}
              <fieldset>
                <legend>Choose source</legend>

                <label className="radio">
                  <input
                    type="radio"
                    name="avatar_source"
                    value="upload"
                    onChange={() => setDetails((d:any) => ({...d, avatar_source: 'upload'}))}
                  />
                  <span>Upload a file</span>
                </label>

                <label className="radio">
                  <input
                    type="radio"
                    name="avatar_source"
                    value="gravatar"
                    onChange={() => setDetails((d:any) => ({...d, avatar_source: 'gravatar'}))}
                  />
                  <span>Use Gravatar (based on your email)</span>
                </label>

                <label className="radio">
                  <input
                    type="radio"
                    name="avatar_source"
                    value="url"
                    onChange={() => setDetails((d:any) => ({...d, avatar_source: 'url'}))}
                  />
                  <span>External image URL (Disqus or other)</span>
                </label>

                <label style={{marginTop: '8px'}}>
                  <span>External URL (if chosen)</span>
                  <input
                    type="url"
                    placeholder="https://example.com/avatar.jpg"
                    onChange={(e) => setDetails((d:any) => ({...d, avatar_remote_url: e.target.value}))}
                  />
                </label>

                {/* File upload input (only if 'upload' selected) */}
                {(details as any)?.avatar_source === 'upload' && (
                  <label>
                    <span>Upload image (PNG/JPG/SVG, ~200×200)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setDetails((d:any) => ({...d, _avatar_file: e.target.files?.[0] ?? null}))}
                    />
                  </label>
                )}
              </fieldset>

              {/* Save avatar source immediately (optional), or piggy-back on Save button */}
              <button
                className="button button--secondary"
                disabled={saving}
                onClick={async () => {
                  if (!amigoId) return;
                  setSaving(true);
                  setError(null);
                  try {
                    const data: any = new FormData();
                    data.append('amigo[avatar_source]', (details as any)?.avatar_source || 'default');
                    if ((details as any)?.avatar_source === 'url' && (details as any)?.avatar_remote_url) {
                      data.append('amigo[avatar_remote_url]', (details as any).avatar_remote_url);
                    }
                    if ((details as any)?.avatar_source === 'upload' && (details as any)?._avatar_file) {
                      data.append('amigo[avatar]', (details as any)._avatar_file);
                    }

                  await privateApi.patch(
                    `/api/v1/amigos/${amigoId}`,
                    data,
                    {
                      withCredentials: true,
                      headers: { 'Accept': 'application/json' }
                      // NOTE: do NOT set Content-Type; browser sets multipart boundary automatically
                    }
                  );
                  // 1) Refresh auth-wide state: currentUser + amigos list
                  await refreshAuth();
                  // 2) Still refresh profile-specific details & locations
                  await loadAll();

                  setSaved(true);
                  } catch (e: any) {
                    setError(e?.response?.data?.errors?.[0] ?? 'Failed to update avatar.');
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                Update Avatar
              </button>
            </div>
          </div>
          
          {/* ───────────────── Actions (Save + Cancel) ──────── */}
          <div className="form-grid__actions">
            <button
              type="button"
              className="button button--primary"
              onClick={saveAll}
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              className="button button--cancel"
              onClick={() => navigate('/amigos')}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </section>
  );
}
