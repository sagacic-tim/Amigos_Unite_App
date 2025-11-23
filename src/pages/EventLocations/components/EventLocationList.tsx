// src/pages/EventLocations/components/EventLocationList.tsx
import React, { useEffect, useState } from "react";
import EventLocationItem from "./EventLocationItem";
import type { EventLocation } from "@/types/events";
import { EventLocationService } from "@/services/EventLocationService";
import "@/assets/sass/components/_eventLocations.scss";

const EventLocationList: React.FC = () => {
  const [eventLocations, setEventLocations] = useState<EventLocation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await EventLocationService .fetchEventLocations();
        if (mounted) setEventLocations(data);
      } catch (err) {
        console.error(err);
        if (mounted) setError("Error fetching event locations.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <p>Loading locations…</p>;
  if (error) return <p>{error}</p>;
  if (!eventLocations.length) return <p>No event locations found.</p>;

  return (
    <section className="section section--event-locations">
      <div className="cards-grid cards-grid--locations">
        {eventLocations.map((eventLocation) => (
          <EventLocationItem
            key={eventLocation.id}
            eventLocation={eventLocation}
          />
        ))}
      </div>
    </section>
  );
};

export default EventLocationList;
