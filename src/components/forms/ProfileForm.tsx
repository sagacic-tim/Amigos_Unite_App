// src/components/forms/ProfileForm.tsx
import { useEffect, useMemo, useState, useCallback } from "react";
import md5 from "blueimp-md5";
import privateApi from "@/services/api/privateApi";
import type { Amigo } from "@/types/AmigoTypes";

// ─────────────────────────────────────────────────────────────────────────────
// Types (lifted from the original Profile page)
// ─────────────────────────────────────────────────────────────────────────────

type AmigoCorePayload = {
  first_name: string;
  last_name: string;
  user_name: string;
  email: string;
  secondary_email: string;
  phone_1: string;
  phone_2: string;
};

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

const buildAmigoLocationPayloadForSave = (
  src: Partial<AmigoLocationPayload>
) => {
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
// Reference data
// ─────────────────────────────────────────────────────────────────────────────

const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  // TODO: add more as needed
];

const US_STATES = [
  { short: "AL", long: "Alabama" },
  { short: "AK", long: "Alaska" },
  { short: "AZ", long: "Arizona" },
  { short: "AR", long: "Arkansas" },
  { short: "CA", long: "California" },
  { short: "CO", long: "Colorado" },
  { short: "CT", long: "Connecticut" },
  { short: "DE", long: "Delaware" },
  { short: "FL", long: "Florida" },
  { short: "GA", long: "Georgia" },
  { short: "HI", long: "Hawaii" },
  { short: "ID", long: "Idaho" },
  { short: "IL", long: "Illinois" },
  { short: "IN", long: "Indiana" },
  { short: "IA", long: "Iowa" },
  { short: "KS", long: "Kansas" },
  { short: "KY", long: "Kentucky" },
  { short: "LA", long: "Louisiana" },
  { short: "ME", long: "Maine" },
  { short: "MD", long: "Maryland" },
  { short: "MA", long: "Massachusetts" },
  { short: "MI", long: "Michigan" },
  { short: "MN", long: "Minnesota" },
  { short: "MS", long: "Mississippi" },
  { short: "MO", long: "Missouri" },
  { short: "MT", long: "Montana" },
  { short: "NE", long: "Nebraska" },
  { short: "NV", long: "Nevada" },
  { short: "NH", long: "New Hampshire" },
  { short: "NJ", long: "New Jersey" },
  { short: "NM", long: "New Mexico" },
  { short: "NY", long: "New York" },
  { short: "NC", long: "North Carolina" },
  { short: "ND", long: "North Dakota" },
  { short: "OH", long: "Ohio" },
  { short: "OK", long: "Oklahoma" },
  { short: "OR", long: "Oregon" },
  { short: "PA", long: "Pennsylvania" },
  { short: "RI", long: "Rhode Island" },
  { short: "SC", long: "South Carolina" },
  { short: "SD", long: "South Dakota" },
  { short: "TN", long: "Tennessee" },
  { short: "TX", long: "Texas" },
  { short: "UT", long: "Utah" },
  { short: "VT", long: "Vermont" },
  { short: "VA", long: "Virginia" },
  { short: "WA", long: "Washington" },
  { short: "WV", long: "West Virginia" },
  { short: "WI", long: "Wisconsin" },
  { short: "WY", long: "Wyoming" },
];

const CA_PROVINCES = [
  { short: "AB", long: "Alberta" },
  { short: "BC", long: "British Columbia" },
  { short: "MB", long: "Manitoba" },
  { short: "NB", long: "New Brunswick" },
  { short: "NL", long: "Newfoundland and Labrador" },
  { short: "NS", long: "Nova Scotia" },
  { short: "NT", long: "Northwest Territories" },
  { short: "NU", long: "Nunavut" },
  { short: "ON", long: "Ontario" },
  { short: "PE", long: "Prince Edward Island" },
  { short: "QC", long: "Quebec" },
  { short: "SK", long: "Saskatchewan" },
  { short: "YT", long: "Yukon" },
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
    [loc.street_number, loc.street_name].filter(Boolean).join(" "),
    loc.apartment_suite_number,
    loc.floor ? `Floor ${loc.floor}` : "",
    loc.room_no ? `Room ${loc.room_no}` : "",
    loc.city_sublocality,
    loc.city,
    [loc.state_province_short || loc.state_province, loc.postal_code]
      .filter(Boolean)
      .join(" "),
    loc.country,
  ].filter(Boolean);
  return parts.join(", ");
}

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

type ProfileFormProps = {
  currentAmigo: Amigo;
  refreshAuth: () => Promise<void>;
  onCancel?: () => void;
};

// ─────────────────────────────────────────────────────────────────────────────

export default function ProfileForm({
  currentAmigo,
  refreshAuth,
  onCancel,
}: ProfileFormProps) {
  const [loading, setLoading] = useState(true);
  const [amigoCore, setAmigoCore] = useState<AmigoCorePayload | null>(null);
  const [details, setDetails] = useState<AmigoDetailsPayload>({});
  const [location, setLocation] = useState<AmigoLocationPayload | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const amigoId = currentAmigo.id;

  const regionOptions = useMemo(
    () =>
      ({
        US: US_STATES,
        CA: CA_PROVINCES,
      }) as Record<string, { short: string; long: string }[]>,
    []
  );

  const apiOrigin = import.meta.env.VITE_API_ORIGIN as string;

  const initialAvatarSrc = useMemo(() => {
    if (currentAmigo.avatar_url) return `${apiOrigin}${currentAmigo.avatar_url}`;
    const email = (currentAmigo.email || "").trim().toLowerCase();
    if (email) return gravatarIdenticon(email, 80);
    return "/images/default-amigo-avatar.png";
  }, [apiOrigin, currentAmigo.avatar_url, currentAmigo.email]);

  const loadAll = useCallback(async () => {
    if (!amigoId) return;
    setLoading(true);
    setError(null);
    setSaved(false);

    // Core amigo info
    try {
      const a = await privateApi.get(`/api/v1/amigos/${amigoId}`, {
        withCredentials: true,
      });
      const raw = (a?.data ?? {}) as any;

      setAmigoCore({
        first_name: raw.first_name ?? currentAmigo.first_name ?? "",
        last_name: raw.last_name ?? currentAmigo.last_name ?? "",
        user_name: raw.user_name ?? currentAmigo.user_name ?? "",
        email: raw.email ?? currentAmigo.email ?? "",
        secondary_email: raw.secondary_email ?? "",
        phone_1: raw.phone_1 ?? "",
        phone_2: raw.phone_2 ?? "",
      });
    } catch {
      // Fallback from currentAmigo if show endpoint fails
      setAmigoCore({
        first_name: currentAmigo.first_name ?? "",
        last_name: currentAmigo.last_name ?? "",
        user_name: currentAmigo.user_name ?? "",
        email: currentAmigo.email ?? "",
        secondary_email: "",
        phone_1: "",
        phone_2: "",
      });
    }

    // Amigo Details
    try {
      const d = await privateApi.get(
        `/api/v1/amigos/${amigoId}/amigo_detail`,
        {
          withCredentials: true,
        }
      );
      const rawDetails = d?.data ?? {};
      setDetails(buildAmigoDetailsPayload(rawDetails));
    } catch {
      setDetails({});
    }

    // Amigo Location(s)
    try {
      const l = await privateApi.get(
        `/api/v1/amigos/${amigoId}/amigo_locations`,
        {
          withCredentials: true,
        }
      );
      const list = Array.isArray(l?.data) ? l.data : l?.data?.data ?? [];
      const first = list?.[0] ?? null;

      if (first) {
        const { amigo, ...rest } = first; // drop nested amigo
        setLocation(rest as AmigoLocationPayload);
      } else {
        setLocation(null);
      }
    } catch {
      setLocation(null);
    }

    setLoading(false);
  }, [amigoId, currentAmigo]);

  useEffect(() => {
    if (amigoId) {
      void loadAll();
    } else {
      setLoading(false);
    }
  }, [amigoId, loadAll]);

  // ── Handlers: Core, Details & Location ─────────────────────────────────────

  const handleCoreChange = (field: keyof AmigoCorePayload, value: string) => {
    setAmigoCore((prev) => ({
      ...(prev ?? {
        first_name: "",
        last_name: "",
        user_name: "",
        email: "",
        secondary_email: "",
        phone_1: "",
        phone_2: "",
      }),
      [field]: value,
    }));
  };

  const handleDetailsChange = (
    field: keyof AmigoDetailsPayload,
    value: any
  ) => {
    setDetails((prev) => ({ ...(prev ?? {}), [field]: value }));
  };

  const handleLocationChange = (
    field: keyof AmigoLocationPayload,
    value: any
  ) => {
    setLocation((prev) => ({
      ...(prev ?? {}),
      [field]: value,
    } as AmigoLocationPayload));
  };

  const saveAll = async () => {
    if (!amigoId) return;
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      // Core Amigo
      if (amigoCore) {
        const core = amigoCore;
        const amigoPayload: any = {
          first_name: (core.first_name || "").trim(),
          last_name: (core.last_name || "").trim(),
          user_name: (core.user_name || "").trim(),
          email: (core.email || "").trim(),
          secondary_email: (core.secondary_email || "").trim(),
        };

        if (core.phone_1) {
          amigoPayload.phone_1 = core.phone_1.trim();
        }
        if (core.phone_2) {
          amigoPayload.phone_2 = core.phone_2.trim();
        }

        await privateApi.patch(
          `/api/v1/amigos/${amigoId}`,
          { amigo: amigoPayload },
          { withCredentials: true }
        );

        await refreshAuth();
      }

      // Amigo Details
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

      // Amigo Location
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

      await loadAll();
      setSaved(true);
    } catch (e: any) {
      setError(
        e?.response?.data?.errors?.[0] ?? "Failed to save profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const countryCode = (location?.country_short || "").toUpperCase();
  const regions = regionOptions[countryCode] ?? [];
  const address = location
    ? location.address || composeAddress(location)
    : "";

  if (!amigoId) {
    return <p>Loading your profile…</p>;
  }

  return (
    <>
      {/* Global messages for the form set */}
      {error && <p className="form-error">{error}</p>}
      {saved && <p className="form-success">Saved!</p>}

      {loading ? (
        <p>Loading…</p>
      ) : (
        <>
          {/* Account Info */}
          <div className="card card--details">
            <h2>Account Info</h2>

            <div className="form-grid form-grid--one-column">
              <fieldset>
                <label>
                  <span>First Name</span>
                  <input
                    type="text"
                    value={amigoCore?.first_name ?? ""}
                    onChange={(e) =>
                      handleCoreChange("first_name", e.target.value)
                    }
                  />
                </label>

                <label>
                  <span>Last Name</span>
                  <input
                    type="text"
                    value={amigoCore?.last_name ?? ""}
                    onChange={(e) =>
                      handleCoreChange("last_name", e.target.value)
                    }
                  />
                </label>

                <label>
                  <span>Username</span>
                  <input
                    type="text"
                    value={amigoCore?.user_name ?? ""}
                    onChange={(e) =>
                      handleCoreChange("user_name", e.target.value)
                    }
                  />
                </label>

                <label>
                  <span>Email</span>
                  <input
                    type="email"
                    value={amigoCore?.email ?? ""}
                    onChange={(e) =>
                      handleCoreChange("email", e.target.value)
                    }
                  />
                </label>

                <label>
                  <span>Secondary Email</span>
                  <input
                    type="email"
                    value={amigoCore?.secondary_email ?? ""}
                    onChange={(e) =>
                      handleCoreChange(
                        "secondary_email",
                        e.target.value
                      )
                    }
                  />
                </label>

                <label>
                  <span>Phone 1</span>
                  <input
                    type="tel"
                    value={amigoCore?.phone_1 ?? ""}
                    onChange={(e) =>
                      handleCoreChange("phone_1", e.target.value)
                    }
                    placeholder="+1 (626) 998-2531"
                  />
                  <small className="form-hint">
                    Enter any format; we&apos;ll store it in international format.
                  </small>
                </label>

                <label>
                  <span>Phone 2</span>
                  <input
                    type="tel"
                    value={amigoCore?.phone_2 ?? ""}
                    onChange={(e) =>
                      handleCoreChange("phone_2", e.target.value)
                    }
                    placeholder="+1 (626) 998-2531"
                  />
                  <small className="form-hint">
                    Enter any format; we&apos;ll store it in international format.
                  </small>
                </label>
              </fieldset>
            </div>
          </div>

          {/* Amigo Details */}
          <div className="card card--details">
            <h2>Amigo Details</h2>

            <div className="form-grid form-grid--one-column">
              <fieldset>
                <label>
                  <span>Date of Birth</span>
                  <input
                    type="date"
                    value={details?.date_of_birth ?? ""}
                    onChange={(e) =>
                      handleDetailsChange(
                        "date_of_birth",
                        e.target.value || null
                      )
                    }
                  />
                </label>

                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={!!details?.member_in_good_standing}
                    onChange={(e) =>
                      handleDetailsChange(
                        "member_in_good_standing",
                        e.target.checked
                      )
                    }
                  />
                  <span>Member in good standing</span>
                </label>

                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={!!details?.available_to_host}
                    onChange={(e) =>
                      handleDetailsChange(
                        "available_to_host",
                        e.target.checked
                      )
                    }
                  />
                  <span>Available to host</span>
                </label>

                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={!!details?.willing_to_help}
                    onChange={(e) =>
                      handleDetailsChange(
                        "willing_to_help",
                        e.target.checked
                      )
                    }
                  />
                  <span>Willing to help</span>
                </label>

                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={!!details?.willing_to_donate}
                    onChange={(e) =>
                      handleDetailsChange(
                        "willing_to_donate",
                        e.target.checked
                      )
                    }
                  />
                  <span>Willing to donate</span>
                </label>

                <label className="textarea">
                  <span>Personal Bio</span>
                  <textarea
                    value={details?.personal_bio ?? ""}
                    onChange={(e) =>
                      handleDetailsChange(
                        "personal_bio",
                        e.target.value || null
                      )
                    }
                    rows={5}
                  />
                </label>
              </fieldset>
            </div>
          </div>

          {/* Amigo Location */}
          <div className="card card--locations">
            <h2>Amigo Location</h2>

            <div className="form-grid form-grid--one-column">
              <label>
                <span>Address (view only)</span>
                <input type="text" value={address} readOnly />
              </label>

              <label>
                <span>Street Number</span>
                <input
                  type="text"
                  value={location?.street_number ?? ""}
                  onChange={(e) =>
                    handleLocationChange(
                      "street_number",
                      e.target.value
                    )
                  }
                />
              </label>

              <label>
                <span>Street Name</span>
                <input
                  type="text"
                  value={location?.street_name ?? ""}
                  onChange={(e) =>
                    handleLocationChange(
                      "street_name",
                      e.target.value
                    )
                  }
                />
              </label>

              <label>
                <span>Floor</span>
                <input
                  type="text"
                  value={location?.floor ?? ""}
                  onChange={(e) =>
                    handleLocationChange("floor", e.target.value)
                  }
                />
              </label>

              <label>
                <span>Room No</span>
                <input
                  type="text"
                  value={location?.room_no ?? ""}
                  onChange={(e) =>
                    handleLocationChange("room_no", e.target.value)
                  }
                />
              </label>

              <label>
                <span>Apt/Suite</span>
                <input
                  type="text"
                  value={location?.apartment_suite_number ?? ""}
                  onChange={(e) =>
                    handleLocationChange(
                      "apartment_suite_number",
                      e.target.value
                    )
                  }
                />
              </label>

              <label>
                <span>City Sublocality</span>
                <input
                  type="text"
                  value={location?.city_sublocality ?? ""}
                  onChange={(e) =>
                    handleLocationChange(
                      "city_sublocality",
                      e.target.value
                    )
                  }
                />
              </label>

              <label>
                <span>City</span>
                <input
                  type="text"
                  value={location?.city ?? ""}
                  onChange={(e) =>
                    handleLocationChange("city", e.target.value)
                  }
                />
              </label>

              <label>
                <span>Country</span>
                <select
                  value={location?.country_short ?? ""}
                  onChange={(e) => {
                    const code = e.target.value || "";
                    const long =
                      COUNTRIES.find((c) => c.code === code)?.name ?? "";
                    handleLocationChange("country_short", code);
                    handleLocationChange("country", long);
                    handleLocationChange("state_province_short", "");
                    handleLocationChange("state_province", "");
                    handleLocationChange("state_province_subdivision", "");
                  }}
                >
                  <option value="">— Select country —</option>
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>State/Province</span>
                <select
                  value={location?.state_province_short ?? ""}
                  onChange={(e) => {
                    const s = e.target.value || "";
                    const entry = regions.find((r) => r.short === s);
                    handleLocationChange("state_province_short", s);
                    handleLocationChange(
                      "state_province",
                      entry?.long ?? ""
                    );
                    handleLocationChange(
                      "state_province_subdivision",
                      entry?.long ?? ""
                    );
                  }}
                  disabled={regions.length === 0}
                >
                  <option value="">
                    {regions.length ? "— Select —" : "— N/A —"}
                  </option>
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
                  value={location?.postal_code ?? ""}
                  onChange={(e) =>
                    handleLocationChange(
                      "postal_code",
                      e.target.value
                    )
                  }
                />
              </label>

              <label>
                <span>Postal Code Suffix</span>
                <input
                  type="text"
                  value={location?.postal_code_suffix ?? ""}
                  onChange={(e) =>
                    handleLocationChange(
                      "postal_code_suffix",
                      e.target.value
                    )
                  }
                />
              </label>

              <label>
                <span>Post Box</span>
                <input
                  type="text"
                  value={location?.post_box ?? ""}
                  onChange={(e) =>
                    handleLocationChange("post_box", e.target.value)
                  }
                />
              </label>

              <label>
                <span>Latitude</span>
                <input
                  type="text"
                  value={location?.latitude ?? ""}
                  readOnly
                />
              </label>
              <label>
                <span>Longitude</span>
                <input
                  type="text"
                  value={location?.longitude ?? ""}
                  readOnly
                />
              </label>
              <label>
                <span>Time Zone</span>
                <input
                  type="text"
                  value={location?.time_zone ?? ""}
                  readOnly
                />
              </label>
            </div>
          </div>

          {/* Avatar */}
          <div className="card card--details">
            <h2>Avatar</h2>

            <div className="form-grid form-grid--one-column">
              <label>
                <span>Current</span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <img
                    src={initialAvatarSrc}
                    alt="Current avatar"
                    width={80}
                    height={80}
                    style={{
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                    onError={(e) => {
                      const img = e.currentTarget as HTMLImageElement;
                      const email = (currentAmigo.email || "")
                        .trim()
                        .toLowerCase();
                      const stage = img.dataset.fallbackStage || "0";
                      if (stage === "0" && email) {
                        img.dataset.fallbackStage = "1";
                        img.src = gravatarIdenticon(email, 80);
                        return;
                      }
                      img.onerror = null;
                      img.src = "/images/default-amigo-avatar.png";
                    }}
                  />
                  <span>Shown across the app</span>
                </div>
              </label>

              <fieldset>
                <legend>Choose source</legend>

                <label className="radio">
                  <input
                    type="radio"
                    name="avatar_source"
                    value="upload"
                    onChange={() =>
                      setDetails((d: any) => ({
                        ...d,
                        avatar_source: "upload",
                      }))
                    }
                  />
                  <span>Upload a file</span>
                </label>

                <label className="radio">
                  <input
                    type="radio"
                    name="avatar_source"
                    value="gravatar"
                    onChange={() =>
                      setDetails((d: any) => ({
                        ...d,
                        avatar_source: "gravatar",
                      }))
                    }
                  />
                  <span>Use Gravatar (based on your email)</span>
                </label>

                <label className="radio">
                  <input
                    type="radio"
                    name="avatar_source"
                    value="url"
                    onChange={() =>
                      setDetails((d: any) => ({
                        ...d,
                        avatar_source: "url",
                      }))
                    }
                  />
                  <span>External image URL (Disqus or other)</span>
                </label>

                <label style={{ marginTop: "8px" }}>
                  <span>External URL (if chosen)</span>
                  <input
                    type="url"
                    placeholder="https://example.com/avatar.jpg"
                    onChange={(e) =>
                      setDetails((d: any) => ({
                        ...d,
                        avatar_remote_url: e.target.value,
                      }))
                    }
                  />
                </label>

                {(details as any)?.avatar_source === "upload" && (
                  <label>
                    <span>Upload image (PNG/JPG/SVG, ~200×200)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setDetails((d: any) => ({
                          ...d,
                          _avatar_file: e.target.files?.[0] ?? null,
                        }))
                      }
                    />
                  </label>
                )}
              </fieldset>

              <button
                className="button button--secondary"
                disabled={saving}
                onClick={async () => {
                  if (!amigoId) return;
                  setSaving(true);
                  setError(null);
                  try {
                    const data: any = new FormData();
                    data.append(
                      "amigo[avatar_source]",
                      (details as any)?.avatar_source || "default"
                    );
                    if (
                      (details as any)?.avatar_source === "url" &&
                      (details as any)?.avatar_remote_url
                    ) {
                      data.append(
                        "amigo[avatar_remote_url]",
                        (details as any).avatar_remote_url
                      );
                    }
                    if (
                      (details as any)?.avatar_source === "upload" &&
                      (details as any)?._avatar_file
                    ) {
                      data.append(
                        "amigo[avatar]",
                        (details as any)._avatar_file
                      );
                    }

                    await privateApi.patch(
                      `/api/v1/amigos/${amigoId}`,
                      data,
                      {
                        withCredentials: true,
                        headers: { Accept: "application/json" },
                      }
                    );
                    await refreshAuth();
                    await loadAll();
                    setSaved(true);
                  } catch (e: any) {
                    setError(
                      e?.response?.data?.errors?.[0] ??
                        "Failed to update avatar."
                    );
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                Update Avatar
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="form-grid__actions">
            <button
              type="button"
              className="button button--primary"
              onClick={saveAll}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              className="button button--cancel"
              onClick={() => onCancel?.()}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </>
  );
}
