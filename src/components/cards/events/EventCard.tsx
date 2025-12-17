// src/components/cards/events/EventCard.tsx
import React, { useEffect, useState } from "react";
import EventRegisterButton from "@/components/cards/events/EventRegisterButton";
import { EventService } from "@/services/EventService";
import useAuth from "@/hooks/useAuthStatus";           // or wherever your current amigo lives
import type { Event, EventAmigoConnector } from "@/types/events";

type Props = {
  event: Event;
};

const EventCard: React.FC<Props> = ({ event }) => {
  const { isLoggedIn, amigo } = useAuth();      // adjust to your actual hook shape
  const [myConnector, setMyConnector] = useState<EventAmigoConnector | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadConnector() {
      if (!isLoggedIn || !amigo) {
        setMyConnector(null);
        return;
      }

      const connectors = await EventService.fetchEventAmigoConnectors(event.id);
      if (cancelled) return;

      const mine = connectors.find((c) => c.amigo_id === amigo.id);
      setMyConnector(mine ?? null);
    }

    loadConnector();
    return () => {
      cancelled = true;
    };
  }, [event.id, isLoggedIn, amigo?.id]);

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
