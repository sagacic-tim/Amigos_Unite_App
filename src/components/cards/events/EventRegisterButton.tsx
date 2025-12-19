// src/components/cards/events/EventRegisterButton.tsx
import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import useAuthStatus from "@/hooks/useAuthStatus";
import { EventService } from "@/services/EventService";
import type { Event, EventAmigoConnector } from "@/types/events";

type Props = {
  event: Event;
  /** If parent already knows the current user's connector for this event, pass it here */
  myConnector?: EventAmigoConnector | null;
  /** Notify parent after registration/leave so it can refresh local state */
  onChange?: (connector: EventAmigoConnector | null) => void;
  /** Disable actions if necessary (e.g., while refetching) */
  disabled?: boolean;
};

const EventRegisterButton: React.FC<Props> = ({
  event,
  myConnector,
  onChange,
  disabled,
}) => {
  const { isLoggedIn, amigo, checking } = useAuthStatus();
  const [busy, setBusy] = useState(false);
  const location = useLocation();

  const eventClosed =
    event.status === "completed" || event.status === "canceled";

  const isDisabled = !!disabled || busy || eventClosed || checking;

  const openLoginModalWithReturn = () => {
    try {
      // Persist a return path so the login flow can redirect back
      sessionStorage.setItem("returnTo", location.pathname + location.search);
    } catch {
      // no-op if storage is blocked
    }
    document.dispatchEvent(new CustomEvent("auth:login"));
  };

  const register = async () => {
    // If we somehow got here without an amigo object, treat as not logged in
    if (!amigo) {
      openLoginModalWithReturn();
      return;
    }

    setBusy(true);
    try {
      // POST /api/v1/events/:event_id/event_amigo_connectors
      const conn = await EventService.registerForEvent(event.id, amigo.id);
      onChange?.(conn);
    } finally {
      setBusy(false);
    }
  };

  const leave = async () => {
    if (!myConnector) return;

    setBusy(true);
    try {
      // DELETE /api/v1/events/:id/leave (your existing endpoint)
      await EventService.leave(event.id);
      onChange?.(null);
    } finally {
      setBusy(false);
    }
  };

  // ─────────────────────────────────────
  // Render branches
  // ─────────────────────────────────────

  if (!isLoggedIn) {
    return (
      <button
        type="button"
        onClick={openLoginModalWithReturn}
        disabled={isDisabled}
        className="btn btn--primary"
        aria-disabled={isDisabled}
      >
        {checking ? "Checking…" : "Login to Register"}
      </button>
    );
  }

  // Not yet registered for this event (from the caller's perspective)
  if (!myConnector) {
    return (
      <button
        type="button"
        onClick={register}
        disabled={isDisabled}
        className="btn btn--primary"
        aria-disabled={isDisabled}
      >
        {busy ? "Registering…" : "Register for this Event"}
      </button>
    );
  }

  // Already registered; allow leaving
  return (
    <button
      type="button"
      onClick={leave}
      disabled={isDisabled}
      className="btn btn--secondary"
      aria-disabled={isDisabled}
    >
      {busy ? "Leaving…" : "Leave Event"}
    </button>
  );
};

export default EventRegisterButton;
