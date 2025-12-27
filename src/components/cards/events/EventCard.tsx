// src/components/cards/events/EventCard.tsx
import React, { useEffect, useState } from "react";
import EventRegisterButton from "@/components/cards/events/EventRegisterButton";
import { EventService } from "@/services/EventService";
import useAuth from "@/hooks/useAuthStatus";
import type { Event, EventAmigoConnector } from "@/types/events";

type Props = {
  event: Event;
};

const EventCard: React.FC<Props> = ({ event }) => {
  const { isLoggedIn, amigo } = useAuth();

  // 🔹 Derive a stable ID so the effect doesn't depend on the whole amigo object
  const amigoId = amigo?.id ?? null;

  const [myConnector, setMyConnector] = useState<EventAmigoConnector | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadConnector() {
      // If not logged in or no amigo ID, clear connector and bail
      if (!isLoggedIn || !amigoId) {
        setMyConnector(null);
        return;
      }

      try {
        const connectors = await EventService.fetchEventAmigoConnectors(event.id);
        if (cancelled) return;

        const mine = connectors.find((c) => c.amigo_id === amigoId);
        setMyConnector(mine ?? null);
      } catch (err) {
        if (!cancelled) {
          console.error(`Error loading connector for event ${event.id}:`, err);
          setMyConnector(null);
        }
      }
    }

    void loadConnector();

    return () => {
      cancelled = true;
    };
  }, [event.id, isLoggedIn, amigoId]); // ✅ now matches what we actually use

  if (!event) return null;

  return (
    <EventRegisterButton
      event={event}
      myConnector={myConnector}
      onChange={setMyConnector}
    />
  );
};

export default EventCard;
