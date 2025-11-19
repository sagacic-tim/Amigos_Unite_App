// src/pages/Events/components/EventList.tsx
import React, { useEffect, useState } from "react";
import useAuthStatus from "@/hooks/useAuthStatus";
import { fetchEvents } from "@/services/EventService";
import type { Event } from "@/types/events/EventTypes";
import EventItem from "./EventItem";

const EventList: React.FC = () => {
  const { isLoggedIn, checking } = useAuthStatus();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (checking) return;

    if (!isLoggedIn) {
      setEvents([]);
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        const data = await fetchEvents();
        setEvents(data);
      } catch (err) {
        console.error("Error loading events:", err);
        setError("Error fetching events. Please try again later.");
      } finally {
        setLoading(false);
      }
    })();
  }, [isLoggedIn, checking]);

  if (checking) return <p>Checking session…</p>;
  if (loading) return <p>Loading events...</p>;
  if (error) return <p>{error}</p>;

  return (
    <section className="container container--page cards-grid">
      {events.length > 0 ? (
        events.map((event) => <EventItem key={event.id} event={event} />)
      ) : (
        <p>No events found.</p>
      )}
    </section>
  );
};

export default EventList;
