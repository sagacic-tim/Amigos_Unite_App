// src/components/forms/events/EventForm.tsx
import React, { useState } from "react";
import type {
  EventCreateParams,
  EventStatus,
} from "@/types/events/EventTypes";
import type { EventLocationCreatePayload } from "@/types/events/EventLocationTypes";
import type { PlaceResult, PlacePhoto } from "@/services/PlacesService";
import styles from "@/components/forms/events/EventForm.module.scss";
import {
  searchPlacesWithPhotos,
  fetchPlacePhotos,
} from "@/services/PlacesService";

interface EventFormProps {
  initialValues?: Partial<EventCreateParams>;
  submitLabel: string;
  onSubmit: (values: EventCreateParams) => Promise<void> | void;

  /**
   * If true, render Step 3 ("Manage Event") with assistant-coordinator selection.
   * CreateEventPage will omit this, EditEventPage will set it to true.
   */
  includeManagementStep?: boolean;

  /**
   * List of participants eligible to be promoted to assistant_coordinator.
   * These should be Amigos who are already registered for the event.
   */
  managementParticipants?: {
    amigoId: number;
    displayName: string;
    currentRole?: string; // e.g. "participant", "assistant_coordinator"
  }[];

  /**
   * Initial assistant_coordinator selection (amigo IDs), used when editing.
   */
  initialAssistantCoordinatorIds?: number[];

  /**
   * Optional callback so the parent can persist assistant-coordinator changes.
   * This will be called after `onSubmit` if provided.
   */
  onSubmitManagement?: (
    assistantCoordinatorIds: number[],
  ) => Promise<void> | void;
}

const DEFAULT_STATUS: EventStatus = "planning";

// ─────────────────────────────────────────────────────────────────────────────
// Location section types (front-end only)
// ─────────────────────────────────────────────────────────────────────────────

const LOCATION_TYPES = [
  // Core food / beverage
  "Restaurant",
  "Cafe",
  "Coffee Shop",
  "Tea House",
  "Bar",
  "Pub",
  "Club",

  // Dedicated event venues
  "Banquet Hall",
  "Meeting Hall",
  "Event Venue",
  "Conference Center",
  "Convention Center",

  // Community / civic
  "Community Center",
  "Civic Center",
  "Cultural Center",
  "Recreation Center",
  "Leisure Center",

  // Performance / cultural venues
  "Theater",
  "Auditorium",
  "Amphitheater",
  "Concert Hall",

  // Hospitality
  "Hotel",
  "Motel",
  "Inn",
  "Resort",
  "Lodge",

  // Religious venues
  "Church",
  "Cathedral",
  "Temple",
  "Mosque",
  "Synagogue",
  "Abbey",
  "Basilica",
  "Parish",
  "Gurudwara",

  // Education / institutional
  "School",
  "College",
  "University",
  "Library",
  "Training Center",
  "Learning Center",
  "Student Union",

  // Outdoor
  "Park",
  "Campground",
  "Picnic Ground",

  // Misc / legacy options
  "House",
  "Office",
  "Other",
] as const;

type LocationType = (typeof LOCATION_TYPES)[number];

type LocationDraft = {
  name: string;
  type: LocationType | "";
  streetNumber: string;
  streetName: string;
  city: string;
  stateProvince: string;
  country: string;
  postalCode: string;
  owner: string;
  phone: string;
  capacity: string;
  availability: string;
  services: {
    food: boolean;
    drink: boolean;
    internet: boolean;
    bigScreen: boolean;
  };
  imageUrl: string;
  placeId?: string | null;
  photoAttribution?: string | null;
  photoReference?: string | null;
};

const defaultLocation: LocationDraft = {
  name: "",
  type: "",
  streetNumber: "",
  streetName: "",
  city: "",
  stateProvince: "",
  country: "",
  postalCode: "",
  owner: "",
  phone: "",
  capacity: "",
  availability: "",
  services: {
    food: false,
    drink: false,
    internet: false,
    bigScreen: false,
  },
  imageUrl: "",
  placeId: null,
  photoAttribution: null,
  photoReference: null,
};

function buildLocationPayload(
  loc: LocationDraft,
): EventLocationCreatePayload | null {
  const hasCore =
    (loc.name && loc.name.trim().length > 0) ||
    (loc.streetName && loc.streetName.trim().length > 0) ||
    (loc.city && loc.city.trim().length > 0) ||
    !!loc.placeId;

  if (!hasCore) return null;

  return {
    business_name: loc.name.trim(),
    business_phone: loc.phone || undefined,
    location_type: loc.type || undefined,
    street_number: loc.streetNumber || undefined,
    street_name: loc.streetName || undefined,
    city: loc.city || undefined,
    state_province: loc.stateProvince || undefined,
    country: loc.country || undefined,
    postal_code: loc.postalCode || undefined,
    owner_name: loc.owner || undefined,
    capacity: loc.capacity ? Number(loc.capacity) : undefined,
    availability_notes: loc.availability || undefined,
    has_food: loc.services.food || undefined,
    has_drink: loc.services.drink || undefined,
    has_internet: loc.services.internet || undefined,
    has_big_screen: loc.services.bigScreen || undefined,
    place_id: loc.placeId ?? undefined,
    location_image_attribution: loc.photoAttribution ?? undefined,
    image_url: loc.imageUrl || undefined,
    photo_reference: loc.photoReference ?? undefined,
  };
}

// NEW: build a LocationDraft from a preexisting EventLocationCreatePayload
// (used for pre-populating the edit form)
function buildLocationDraftFromPayload(
  payload: EventLocationCreatePayload,
): LocationDraft {
  return {
    ...defaultLocation,
    name: payload.business_name ?? "",
    type: (payload.location_type as LocationType) || "",
    streetNumber: payload.street_number ?? "",
    streetName: payload.street_name ?? "",
    city: payload.city ?? "",
    stateProvince: payload.state_province ?? "",
    country: payload.country ?? "",
    postalCode: payload.postal_code ?? "",
    owner: payload.owner_name ?? "",
    phone: payload.business_phone ?? "",
    capacity:
      typeof payload.capacity === "number"
        ? String(payload.capacity)
        : "",
    availability: payload.availability_notes ?? "",
    services: {
      food: !!payload.has_food,
      drink: !!payload.has_drink,
      internet: !!payload.has_internet,
      bigScreen: !!payload.has_big_screen,
    },
    imageUrl: payload.image_url ?? "",
    placeId: payload.place_id ?? null,
    photoAttribution: payload.location_image_attribution ?? null,
    photoReference: payload.photo_reference ?? null,
  };
}

const EventForm: React.FC<EventFormProps> = ({
  initialValues,
  submitLabel,
  onSubmit,
  includeManagementStep = false,
  managementParticipants,
  initialAssistantCoordinatorIds,
  onSubmitManagement,
}) => {
  // ── Event core state ──────────────────────────────────────────────────────
  const [values, setValues] = useState<EventCreateParams>({
    event_name: initialValues?.event_name ?? "",
    event_date: initialValues?.event_date ?? "",
    event_time: initialValues?.event_time ?? "",
    status: initialValues?.status ?? DEFAULT_STATUS,
    event_type: initialValues?.event_type ?? "",
    event_speakers_performers:
      initialValues?.event_speakers_performers ?? [],
    description: initialValues?.description ?? "",
    // `location` is optional and injected at submit-time from LocationDraft
  });

  // ── Location state (front-end only) ───────────────────────────────────────
  const [location, setLocation] = useState<LocationDraft>(() => {
    if (initialValues?.location) {
      return buildLocationDraftFromPayload(initialValues.location);
    }
    return defaultLocation;
  });

  // NEW: management state (assistant coordinators)
  const [assistantCoordinatorIds, setAssistantCoordinatorIds] =
    useState<number[]>(() => initialAssistantCoordinatorIds ?? []);

  // Stepper state: 1 = Event Details, 2 = Event Location, 3 = Manage Event (optional)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = includeManagementStep ? 3 : 2;

  // Google Places search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [placeResults, setPlaceResults] = useState<PlaceResult[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(
    null,
  );
  const [placePhotos, setPlacePhotos] = useState<PlacePhoto[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ───────────────────────────────────────────────────────────────────────────
  // Handlers: Event fields
  // ───────────────────────────────────────────────────────────────────────────

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setValues((prev) => ({
      ...prev,
      status: e.target.value as EventStatus,
    }));
  };

  const handleSpeakersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const speakers = input
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    setValues((prev) => ({
      ...prev,
      event_speakers_performers: speakers,
    }));
  };

  // ───────────────────────────────────────────────────────────────────────────
  // Handlers: Location fields
  // ───────────────────────────────────────────────────────────────────────────

  const handleLocationChange = <
    K extends keyof Omit<LocationDraft, "services">,
  >(
    field: K,
    value: LocationDraft[K],
  ) => {
    setLocation((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleServiceToggle = (service: keyof LocationDraft["services"]) => {
    setLocation((prev) => ({
      ...prev,
      services: {
        ...prev.services,
        [service]: !prev.services[service],
      },
    }));
  };

  // ───────────────────────────────────────────────────────────────────────────
  // Google Places: search → select place → load photos
  // ───────────────────────────────────────────────────────────────────────────

  const handleSearchPlaces = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    setSearchError(null);

    try {
      const results = await searchPlacesWithPhotos(searchQuery);
      setPlaceResults(results);
      setSelectedPlace(null);
      setPlacePhotos([]);
    } catch (err) {
      console.error(err);
      setSearchError("Could not load places from Google.");
    } finally {
      setSearching(false);
    }
  };

  const handleSelectPlace = async (place: PlaceResult) => {
    setSelectedPlace(place);

    // Basic location fields (you can enrich this later from formatted_address)
    setLocation((prev) => ({
      ...prev,
      name: prev.name || place.name || "",
      placeId: place.place_id,
    }));

    try {
      const photos = await fetchPlacePhotos(place.place_id);
      setPlacePhotos(photos);
    } catch (err) {
      console.error(err);
      setSearchError("Could not load photos for that location.");
    }
  };

  const handleSelectPlaceImage = (photo: PlacePhoto) => {
    setLocation((prev) => ({
      ...prev,
      imageUrl: photo.photo_url || "",
      placeId: photo.place_id || prev.placeId || null,
      photoAttribution:
        photo.photo_attribution || prev.photoAttribution || null,
      photoReference:
        photo.photo_reference ?? prev.photoReference ?? null,
    }));
  };

  // ───────────────────────────────────────────────────────────────────────────
  // Submit: multi-step + final submit
  // ───────────────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // For steps before the last, just advance the wizard
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
      return;
    }

    // Final step: perform the real submit
    setSubmitting(true);
    setError(null);

    try {
      // Normalize event_time to HH:MM:SS
      let normalizedTime = values.event_time;
      if (normalizedTime && normalizedTime.length === 5) {
        normalizedTime = `${normalizedTime}:00`;
      }

      const locationPayload = buildLocationPayload(location);

      const payload: EventCreateParams = {
        ...values,
        event_time: normalizedTime,
        ...(locationPayload ? { location: locationPayload } : {}),
      };

      // 1) Save event core + location
      await onSubmit(payload);

      // 2) Optionally persist assistant-coordinator selection
      if (includeManagementStep && onSubmitManagement) {
        await onSubmitManagement(assistantCoordinatorIds);
      }
    } catch (err: any) {
      console.error(err);
      const msg =
        err?.response?.data?.errors?.join(", ") ||
        err?.response?.data?.error ||
        "An error occurred while saving the event.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const speakersValue =
    values.event_speakers_performers &&
    values.event_speakers_performers.length
      ? values.event_speakers_performers.join(", ")
      : "";

  // ───────────────────────────────────────────────────────────────────────────
  // Render (multi-step)
  // ───────────────────────────────────────────────────────────────────────────

  return (
    <div className="form form--details">
      <h2 className="form-grid__title">Event Info</h2>
      <p className="form-hint">
        Step {currentStep} of {totalSteps}
      </p>

      <form
        className="form-grid form-grid--one-column"
        onSubmit={handleSubmit}
      >
        {error && <p className="form-error">{error}</p>}

        {/* ───────────── Step 1: Event basics ───────────── */}
        {currentStep === 1 && (
          <fieldset>
            <label>
              <span>Event Name</span>
              <input
                id="event_name"
                name="event_name"
                type="text"
                value={values.event_name}
                onChange={handleChange}
                required
              />
            </label>

            <div className="form-grid__fields">
              <label>
                <span>Date</span>
                <input
                  id="event_date"
                  name="event_date"
                  type="date"
                  value={values.event_date}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                <span>Time</span>
                <input
                  id="event_time"
                  name="event_time"
                  type="time"
                  value={values.event_time}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                <span>Status</span>
                <select
                  id="status"
                  name="status"
                  value={values.status ?? DEFAULT_STATUS}
                  onChange={handleStatusChange}
                >
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="canceled">Canceled</option>
                </select>
              </label>
            </div>

            <label>
              <span>Event Type</span>
              <input
                id="event_type"
                name="event_type"
                type="text"
                value={values.event_type ?? ""}
                onChange={handleChange}
                placeholder="Workshop, meetup, concert…"
              />
            </label>

            <label>
              <span>Speakers / Performers</span>
              <input
                id="event_speakers_performers"
                name="event_speakers_performers"
                type="text"
                value={speakersValue}
                onChange={handleSpeakersChange}
                placeholder="Comma-separated list (e.g., Alice, Bob)"
              />
            </label>

            <label className="textarea">
              <span>Description</span>
              <textarea
                id="description"
                name="description"
                value={values.description ?? ""}
                onChange={handleChange}
                rows={4}
              />
            </label>
          </fieldset>
        )}

        {/* ───────────── Step 2: Location section ───────────── */}
        {currentStep === 2 && (
          <fieldset>
            <legend className="formsLegend">Location</legend>

            {/* Basic info: name + type */}
            <div className="form-grid__fields">
              <label>
                <span>Location Name</span>
                <input
                  type="text"
                  value={location.name}
                  onChange={(e) =>
                    handleLocationChange("name", e.target.value)
                  }
                  placeholder="e.g., Moonbeam Cafe"
                />
              </label>

              <label>
                <span>Location Type</span>
                <select
                  value={location.type}
                  onChange={(e) =>
                    handleLocationChange(
                      "type",
                      e.target.value as LocationType | "",
                    )
                  }
                >
                  <option value="">— Select type —</option>
                  {LOCATION_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* Address block */}
            <div className="form-grid__fields">
              <label>
                <span>Street Number</span>
                <input
                  type="text"
                  value={location.streetNumber}
                  onChange={(e) =>
                    handleLocationChange("streetNumber", e.target.value)
                  }
                />
              </label>

              <label>
                <span>Street Name</span>
                <input
                  type="text"
                  value={location.streetName}
                  onChange={(e) =>
                    handleLocationChange("streetName", e.target.value)
                  }
                />
              </label>
            </div>

            <div className="form-grid__fields">
              <label>
                <span>City</span>
                <input
                  type="text"
                  value={location.city}
                  onChange={(e) =>
                    handleLocationChange("city", e.target.value)
                  }
                />
              </label>

              <label>
                <span>State / Province</span>
                <input
                  type="text"
                  value={location.stateProvince}
                  onChange={(e) =>
                    handleLocationChange("stateProvince", e.target.value)
                  }
                />
              </label>

              <label>
                <span>Country</span>
                <input
                  type="text"
                  value={location.country}
                  onChange={(e) =>
                    handleLocationChange("country", e.target.value)
                  }
                />
              </label>

              <label>
                <span>ZIP / Postal Code</span>
                <input
                  type="text"
                  value={location.postalCode}
                  onChange={(e) =>
                    handleLocationChange("postalCode", e.target.value)
                  }
                />
              </label>
            </div>

            {/* Contact + capacity */}
            <div className="form-grid__fields">
              <label>
                <span>Owner / Contact Name</span>
                <input
                  type="text"
                  value={location.owner}
                  onChange={(e) =>
                    handleLocationChange("owner", e.target.value)
                  }
                  placeholder="Person or organization responsible for the venue"
                />
              </label>

              <label>
                <span>Location Phone</span>
                <input
                  type="tel"
                  value={location.phone}
                  onChange={(e) =>
                    handleLocationChange("phone", e.target.value)
                  }
                  placeholder="+xx (xxx) xxx-xxxx"
                />
              </label>

              <label>
                <span>Seating Capacity</span>
                <input
                  type="number"
                  min={0}
                  value={location.capacity}
                  onChange={(e) =>
                    handleLocationChange("capacity", e.target.value)
                  }
                  placeholder="e.g., 40"
                />
              </label>
            </div>

            {/* Availability notes */}
            <label className="textarea">
              <span>Availability</span>
              <textarea
                value={location.availability}
                onChange={(e) =>
                  handleLocationChange("availability", e.target.value)
                }
                rows={3}
                placeholder="e.g., Weeknights after 6pm; Saturdays 9am–5pm"
              />
            </label>

            {/* Services */}
            <fieldset>
              <legend>Services available</legend>
              <div className="form-grid__fields">
                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={location.services.food}
                    onChange={() => handleServiceToggle("food")}
                  />
                  <span>Food available</span>
                </label>

                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={location.services.drink}
                    onChange={() => handleServiceToggle("drink")}
                  />
                  <span>Drinks available</span>
                </label>

                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={location.services.internet}
                    onChange={() => handleServiceToggle("internet")}
                  />
                  <span>Internet / Wi-Fi</span>
                </label>

                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={location.services.bigScreen}
                    onChange={() => handleServiceToggle("bigScreen")}
                  />
                  <span>Big Screen / Projector</span>
                </label>
              </div>
            </fieldset>

            {/* Location image: search + gallery + manual override */}
            <fieldset>
              <legend>Location image</legend>

              {/* Search input + button */}
              <label>
                <span>Search Google Places for a location</span>
                <div className="places-search">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g., Tierra Mia West Covina"
                  />
                  <button
                    type="button"
                    className="button button--secondary"
                    onClick={handleSearchPlaces}
                    disabled={searching || !searchQuery.trim()}
                  >
                    {searching ? "Searching…" : "Search"}
                  </button>
                </div>
              </label>

              {searchError && (
                <p className="form-error">{searchError}</p>
              )}

              {/* List of candidate places */}
              {placeResults.length > 0 && (
                <ul className="places-results">
                  {placeResults.map((place) => (
                    <li key={place.place_id}>
                      <button
                        type="button"
                        className={`${styles["places-button"]}${
                          selectedPlace?.place_id === place.place_id
                            ? " places-results__item--selected"
                            : ""
                        }`}
                        onClick={() => handleSelectPlace(place)}
                      >
                        <strong>{place.name}</strong>
                        <span>{place.formatted_address}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {/* Scrollable gallery of photos for the selected place */}
              {selectedPlace && placePhotos.length > 0 && (
                <div className="places-gallery" role="list">
                  {placePhotos.map((photo, idx) => {
                    const isSelected =
                      location.imageUrl === photo.photo_url;

                    return (
                      <button
                        type="button"
                        key={
                          photo.photo_url ||
                          `${photo.place_id}-${idx}`
                        }
                        role="listitem"
                        className={
                          "places-gallery__item" +
                          (isSelected
                            ? " places-gallery__item--selected"
                            : "")
                        }
                        onClick={() => handleSelectPlaceImage(photo)}
                      >
                        {photo.photo_url && (
                          <img
                            src={photo.photo_url}
                            alt={
                              selectedPlace.name || "Location photo"
                            }
                            className="places-gallery__image"
                          />
                        )}
                        {photo.photo_attribution && (
                          <span
                            className="places-gallery__attribution"
                            dangerouslySetInnerHTML={{
                              __html: photo.photo_attribution,
                            }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Manual override / fallback */}
              <p className="form-hint">
                If needed, you can override the image URL manually:
              </p>

              <label>
                <span>Image URL (override)</span>
                <input
                  type="url"
                  value={location.imageUrl}
                  onChange={(e) =>
                    handleLocationChange("imageUrl", e.target.value)
                  }
                  placeholder="https://example.com/location.jpg"
                />
              </label>

              {/* Final preview of whichever image is selected / typed */}
              {location.imageUrl && (
                <div style={{ marginTop: "8px" }}>
                  <span className="form-hint">Preview</span>
                  <img
                    src={location.imageUrl}
                    alt={
                      location.name
                        ? `Preview of ${location.name}`
                        : "Preview of selected location"
                    }
                    style={{
                      marginTop: "4px",
                      maxWidth: "100%",
                      borderRadius: "8px",
                      display: "block",
                    }}
                  />
                </div>
              )}
            </fieldset>
          </fieldset>
        )}

        {/* ───────────── Manage Event (Step 3) ───────────── */}
        {includeManagementStep && currentStep === 3 && (
          <fieldset>
            <legend className="formsLegend">Manage Event</legend>

            {!managementParticipants ||
            managementParticipants.length === 0 ? (
              <p className="form-hint">
                There are no registered participants yet. Participants can be
                promoted to assistant coordinators after they register for this
                event.
              </p>
            ) : (
              <>
                <p className="form-hint">
                  Select one or more participants to assign as assistant
                  coordinators.
                </p>

                <ul className="roles-list">
                  {managementParticipants.map((p) => {
                    const checked =
                      assistantCoordinatorIds.includes(p.amigoId);

                    return (
                      <li
                        key={p.amigoId}
                        className="roles-list__item"
                      >
                        <label className="checkbox">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              setAssistantCoordinatorIds((prev) =>
                                checked
                                  ? prev.filter(
                                      (id) => id !== p.amigoId,
                                    )
                                  : [...prev, p.amigoId],
                              )
                            }
                          />
                          <span>
                            {p.displayName}
                            {p.currentRole ===
                              "assistant_coordinator" &&
                              " (already assistant coordinator)"}
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </fieldset>
        )}

        {/* ───────────── Actions ───────────── */}
        <div className="form-grid__actions">
          {currentStep > 1 && (
            <button
              type="button"
              className="button button--secondary"
              onClick={() =>
                setCurrentStep((prev) => Math.max(prev - 1, 1))
              }
              disabled={submitting}
            >
              Back
            </button>
          )}

          <button
            type="submit"
            className="button button--primary"
            disabled={submitting}
          >
            {currentStep < totalSteps
              ? "Continue"
              : submitting
              ? "Saving…"
              : submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventForm;
