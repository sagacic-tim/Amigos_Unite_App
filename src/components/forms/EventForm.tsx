
// src/pages/Events/components/EventForm.tsx
import React, { useState } from "react";
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

  const handleSubmit = async (e: React.FormEvent) => {
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

  return (
    <form className="form form--event" onSubmit={handleSubmit}>
      {error && <div className="form__error">{error}</div>}

      <div className="form__field">
        <label htmlFor="event_name" className="form__label">
          Event Name
        </label>
        <input
          id="event_name"
          name="event_name"
          type="text"
          className="form__input"
          value={values.event_name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form__field form__field--inline">
        <div>
          <label htmlFor="event_date" className="form__label">
            Date
          </label>
          <input
            id="event_date"
            name="event_date"
            type="date"
            className="form__input"
            value={values.event_date}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="event_time" className="form__label">
            Time
          </label>
          <input
            id="event_time"
            name="event_time"
            type="time"
            className="form__input"
            value={values.event_time}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="status" className="form__label">
            Status
          </label>
          <select
            id="status"
            name="status"
            className="form__select"
            value={values.status ?? DEFAULT_STATUS}
            onChange={handleStatusChange}
          >
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="canceled">Canceled</option>
          </select>
        </div>
      </div>

      <div className="form__field">
        <label htmlFor="event_type" className="form__label">
          Event Type
        </label>
        <input
          id="event_type"
          name="event_type"
          type="text"
          className="form__input"
          value={values.event_type ?? ""}
          onChange={handleChange}
          placeholder="Workshop, meetup, concert…"
        />
      </div>

      <div className="form__field">
        <label htmlFor="event_speakers_performers" className="form__label">
          Speakers / Performers
        </label>
        <input
          id="event_speakers_performers"
          name="event_speakers_performers"
          type="text"
          className="form__input"
          onChange={handleSpeakersChange}
          placeholder="Comma-separated list (e.g., Alice, Bob)"
        />
      </div>

      <div className="form__field">
        <label htmlFor="description" className="form__label">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          className="form__textarea"
          value={values.description ?? ""}
          onChange={handleChange}
          rows={4}
        />
      </div>

      {/* Location selection / creation will plug in here next iteration */}
      <fieldset className="form__fieldset">
        <legend className="form__legend">Location</legend>
        <p className="form__hint">
          We will wire existing/new Event Locations into this form next, using
          event_location_connectors. For now, events are created without a
          primary location link.
        </p>
      </fieldset>

      <div className="form__actions">
        <button
          type="submit"
          className="button button--primary"
          disabled={submitting}
        >
          {submitting ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
};

export default EventForm;
