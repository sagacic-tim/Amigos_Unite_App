// src/hooks/useManagedEventsFlag.ts
import { useEffect, useState } from "react";
// import { EventService } from "@/services/EventService"; // wire up later

export function useManagedEventsFlag(isLoggedIn: boolean) {
  const [hasManaged, setHasManaged] = useState(false);

  useEffect(() => {
    let alive = true;

    if (!isLoggedIn) {
      setHasManaged(false);
      return;
    }

    // EventService.list({ managed_by: "me", limit: 1 })
    //   .then(events => alive && setHasManaged((events?.length ?? 0) > 0))
    //   .catch(() => alive && setHasManaged(false));

    // Temporary behavior: assume a logged-in amigo *may* have managed events
    // so that the "Manage My Events" menu entry is available.
    if (alive) setHasManaged(true);

    return () => {
      alive = false;
    };
  }, [isLoggedIn]);

  return hasManaged;
}
