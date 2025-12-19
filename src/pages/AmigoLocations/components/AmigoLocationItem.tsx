// src/pages/AmigoLocations/components/AmigoLocationItem.tsx
import React from "react";
import type { AmigoLocation } from "@/types/amigos/AmigoLocationTypes";
import type { Amigo } from "@/types/amigos/AmigoTypes";

interface AmigoLocationItemProps {
  location: AmigoLocation | null;
  amigo: Amigo;
  /** Optional heading id so wrapper card/modal can reference it */
  headingId?: string;
}

// Pretty-print keys: "postal_code" → "Postal Code"
const formatString = (key: string): string =>
  key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const AmigoLocationItem: React.FC<AmigoLocationItemProps> = ({
  location,
  amigo,
  headingId,
}) => {
  const firstName = amigo.first_name || "Unknown";
  const lastName  = amigo.last_name  || "Unknown";
  const computedHeadingId =
    headingId ?? `amigo-location-heading-${amigo.id}`;

  // No location → message block
  if (!location) {
    return (
      <>
        <h3 className="card__title" id={computedHeadingId}>
          Address(es) for {firstName} {lastName}
        </h3>
        <ul className="card__fields">
          <li className="card__field">
            <span className="card__field-label">Amigo Id:</span>
            {amigo.id}
          </li>
          <li className="card__field prose">
            Message: No Address Information Found.
          </li>
        </ul>
      </>
    );
  }

  // Filter to simple, displayable fields
  const locationFields = Object.entries(location).filter(
    ([key, value]) =>
      value !== null &&
      value !== undefined &&
      key !== "id" &&
      key !== "amigo" &&
      key !== "amigo_id" &&
      typeof value !== "object",
  );

  return (
    <>
      <h3 className="card__title" id={computedHeadingId}>
        Address for {firstName} {lastName}
      </h3>

      <ul className="card__fields">
        <li className="card__field">
          <span className="card__field-label">Amigo Id:</span>
          {amigo.id}
        </li>

        {locationFields.length > 0 ? (
          locationFields.map(([key, value]) => (
            <li key={key} className="card__field prose">
              <span className="card__field-label">{formatString(key)}:</span>
              {String(value)}
            </li>
          ))
        ) : (
          <li className="card__field prose">
            Message: No address information found.
          </li>
        )}
      </ul>
    </>
  );
};

export default AmigoLocationItem;
