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

const EventRegisterButton: React.FC<Props> = ({ event, myConnector, onChange, disabled }) => {
  const { isLoggedIn } = useAuthStatus();
  const [busy, setBusy] = useState(false);
  const location = useLocation();

  const eventClosed = event.status === "completed" || event.status === "canceled";
  const isDisabled = disabled || busy || eventClosed;

  const openLoginModalWithReturn = () => {
    try {
      // Persist a return path so the login flow can redirect back
      sessionStorage.setItem("returnTo", location.pathname + location.search);
    } catch { /* no-op if storage blocked */ }
    document.dispatchEvent(new CustomEvent("auth:login"));
  };

  const register = async () => {
    setBusy(true);
    try {
      const conn = await EventService.registerSelf(event.id);
      onChange?.(conn);
    } finally {
      setBusy(false);
    }
  };

  const leave = async () => {
    if (!myConnector) return;
    setBusy(true);
    try {
      await EventService.leave(event.id, myConnector.id);
      onChange?.(null);
    } finally {
      setBusy(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <button
        type="button"
        onClick={openLoginModalWithReturn}
        disabled={isDisabled}
        className="btn btn--primary"
        aria-disabled={isDisabled}
      >
        Login to Register
      </button>
    );
  }

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

  // Already registered; allow leaving (you can render status elsewhere)
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
