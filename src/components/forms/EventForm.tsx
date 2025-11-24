// src/components/forms/EventForm.tsx
import { useState } from "react";
import type { EventCreateParams, EventStatus } from "@/types/events/EventTypes";

interface EventFormProps {
  initialValues?: Partial<EventCreateParams>;
  submitLabel: string;
  onSubmit: (values: EventCreateParams) => Promise<void> | void;
}

const DEFAULT_STATUS: EventStatus = "planning";

const EventForm: React.FC<EventFormProps> = ({
  initialValues,
  submitLabel,
  onSubmit,
}) => {
  const [values, setValues] = useState<EventCreateParams>({
    event_name: initialValues?.event_name ?? "",
    event_date: initialValues?.event_date ?? "",
    event_time: initialValues?.event_time ?? "",
    status: initialValues?.status ?? DEFAULT_STATUS,
    event_type: initialValues?.event_type ?? "",
    event_speakers_performers:
      initialValues?.event_speakers_performers ?? [],
    description: initialValues?.description ?? "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Normalize event_time to HH:MM:SS
      let normalizedTime = values.event_time;
      if (normalizedTime && normalizedTime.length === 5) {
        normalizedTime = `${normalizedTime}:00`;
      }

      const payload: EventCreateParams = {
        ...values,
        event_time: normalizedTime,
      };

      await onSubmit(payload);
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

  return (
    <div className="form form--details">
      <h2>Event Info</h2>
      <form
        className="form-grid form-grid--one-column"
        onSubmit={handleSubmit}
      >
        {error && <p className="form-error">{error}</p>}

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

        <fieldset>
          <legend>Location</legend>
          <p className="form-grid__notice">
            We will wire existing/new Event Locations into this form next, using
            event_location_connectors. For now, events are created without a
            primary location link.
          </p>
        </fieldset>

        <div className="form-grid__actions">
          <button
            type="submit"
            className="button button--primary"
            disabled={submitting}
          >
            {submitting ? "Saving…" : submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventForm;
