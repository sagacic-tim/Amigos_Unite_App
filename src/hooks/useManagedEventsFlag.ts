// src/hooks/useManagedEventsFlag.ts
import { useEffect, useState } from "react";
// import { EventService } from "@/services/EventService"; // wire up later

export function useManagedEventsFlag(isLoggedIn: boolean) {
  const [hasManaged, setHasManaged] = useState(false);

  useEffect(() => {
    let alive = true;
    if (!isLoggedIn) { setHasManaged(false); return; }

    // TODO: replace with a real, cheap API:
    // EventService.list({ managed_by: 'me', limit: 1 })
    //   .then(events => alive && setHasManaged((events?.length ?? 0) > 0))
    //   .catch(() => alive && setHasManaged(false));

    // Temporary behavior: hide "Manage My Events" until API is in place.
    setHasManaged(false);

    return () => { alive = false; };
  }, [isLoggedIn]);

  return hasManaged;
}
