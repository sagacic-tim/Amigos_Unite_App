// src/components/cards/events/EventCard.tsx
import React from "react";
import EventRegisterButton from "@/components/cards/events/EventRegisterButton";
import type { Event as EventModel } from "@/types/events";  // ← domain Event, aliased

type Props = {
  event: EventModel;  // ← use the alias, not DOM Event
};

const EventCard: React.FC<Props> = ({ event }) => {
  if (!event) return null; // only needed if you sometimes pass undefined

  return (
    <EventRegisterButton
      event={event}
      myConnector={null}
      onChange={() => {
        // TODO: refetch or update local state
      }}
    />
  );
};

export default EventCard;
