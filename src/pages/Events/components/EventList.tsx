// src/pages/Events/components/EventList.tsx
import React, { useEffect, useState } from "react";
import type { Event } from "@/types/events";
import useAuth from "@/hooks/useAuth";
import { EventService } from "@/services/EventService";
import EventItem from "./EventItem";

type EventListVariant = "public" | "manage";

interface EventListProps {
  variant?: EventListVariant;
}

const EventList: React.FC<EventListProps> = ({ variant = "public" }) => {
  const { currentAmigo } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await EventService.fetchEvents();
        let filtered = data;

        if (variant === "manage" && currentAmigo) {
          const myId = currentAmigo.id;

          filtered = data.filter((ev) => {
            if (ev.lead_coordinator_id === myId) return true;
            if (ev.lead_coordinator && ev.lead_coordinator.id === myId) {
              return true;
            }

            if (ev.event_amigo_connectors?.length) {
              return ev.event_amigo_connectors.some((conn) => {
                if (conn.amigo_id !== myId) return false;
                return (
                  conn.role === "lead_coordinator" ||
                  conn.role === "assistant_coordinator"
                );
              });
            }

            return false;
          });
        }

        if (mounted) setEvents(filtered);
      } catch (err) {
        console.error(err);
        if (mounted) setError("Error fetching events.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [variant, currentAmigo?.id]);

  const handleDelete = async (event: Event) => {
    if (!window.confirm(`Delete event "${event.event_name}"?`)) return;
    try {
      await EventService.deleteEvent(event.id);
      setEvents((prev) => prev.filter((e) => e.id !== event.id));
    } catch (err) {
      console.error(err);
      setError("Error deleting event.");
    }
  };

  if (loading) return <p>Loading events…</p>;
  if (error) return <p>{error}</p>;
  if (!events.length)
    return <p>No events found. Be the first to create one!</p>;

  return (
    <section className="section section--events">
      <div className="cards-grid" aria-live="polite">
        {events.map((event) => (
          <EventItem
            key={event.id}
            event={event}
            mode={variant === "manage" ? "manage" : "public"}
            onDelete={variant === "manage" ? handleDelete : undefined}
          />
        ))}
      </div>
    </section>
  );
};

export default EventList;
