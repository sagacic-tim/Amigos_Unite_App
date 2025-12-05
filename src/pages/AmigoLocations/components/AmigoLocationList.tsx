// src/pages/AmigoLocations/components/AmigoLocationList.tsx
import React, { useEffect, useState } from "react";
import AmigoLocationItem from "./AmigoLocationItem";
import type { AmigoLocation } from "@/types/amigos/AmigoLocationTypes";
import type { Amigo } from "@/types/amigos/AmigoTypes";
import privateApi from "@/services/api/privateApi";
import UniversalCard from "@/components/cards/UniversalCard";
import "@/assets/sass/components/_amigoLocations.scss";

interface AmigoWithLocation {
  amigo: Amigo;
  location: AmigoLocation | null;
}

const AmigoLocationList: React.FC = () => {
  const [amigosWithLocations, setAmigosWithLocations] = useState<AmigoWithLocation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAmigosWithLocations = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load amigos via privateApi
        const amigosRes = await privateApi.get<Amigo[]>("/api/v1/amigos");
        const amigos = amigosRes.data ?? [];

        const amigoLocations = await Promise.all(
          amigos.map(async (amigo: Amigo) => {
            try {
              const locRes = await privateApi.get<AmigoLocation[] | AmigoLocation | null>(
                `/api/v1/amigos/${amigo.id}/amigo_locations`,
              );
              const raw = locRes.data;

              let location: AmigoLocation | null = null;
              if (Array.isArray(raw)) {
                location = raw[0] ?? null;
              } else {
                location = raw as AmigoLocation | null;
              }

              return { amigo, location };
            } catch {
              return { amigo, location: null };
            }
          }),
        );

        setAmigosWithLocations(amigoLocations);
      } catch (err) {
        console.error("Error fetching amigo locations", err);
        setError("Error fetching amigo locations");
        setAmigosWithLocations([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchAmigosWithLocations();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error)   return <p>{error}</p>;

  if (!amigosWithLocations.length) {
    return <p>No amigos with locations found.</p>;
  }

  return (
    <div className="amigo-location-list">
      {amigosWithLocations.map(({ amigo, location }) => {
        const headingId = `amigo-location-heading-${amigo.id}-${location?.id ?? "none"}`;
        return (
          <UniversalCard
            key={location?.id ?? `amigo-${amigo.id}-no-location`}
            titleId={headingId}
          >
            <AmigoLocationItem
              location={location}
              amigo={amigo}
              headingId={headingId}
            />
          </UniversalCard>
        );
      })}
    </div>
  );
};

export default AmigoLocationList;
