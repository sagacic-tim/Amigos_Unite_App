// src/pages/EventLocations/components/EventLocationItem.tsx
import React from "react";
import type { EventLocation } from "@/types/events";

interface EventLocationItemProps {
  eventLocation: EventLocation;
  /** Optional heading id so the wrapper card/modal can reference it */
  headingId?: string;
}

const EventLocationItem: React.FC<EventLocationItemProps> = ({
  eventLocation,
  headingId,
}) => {
  const {
    id,
    business_name,
    business_phone,
    address,
    // Image fields
    location_image_url,
  } = eventLocation;

  const computedHeadingId = headingId ?? `event-location-heading-${id}`;

  return (
    <>
      {/* Title */}
      <h3 className="card__title" id={computedHeadingId}>
        {business_name || "Event Location"}
      </h3>

      {/* Full address at the top of the card */}
      <p className="card__subtitle">
        {address || "No address available."}
      </p>
      {/* image block at the bottom of the card if eists */}
      {location_image_url && (
        <figure className="card__media">
          <img
            src={location_image_url}
            className="card__image"
            alt={
              business_name
                ? `Photo of ${business_name}`
                : "Event location photo"
            }
          />
        </figure>
      )}
      {/* Phone number at the bottom of the card below the image if eists */}
      {business_phone && (
        <p className="card__field">
          <span className="card__field-label">Phone:</span>
          <span>{business_phone}</span>
        </p>
      )}
    </>
  );
};

export default EventLocationItem;
