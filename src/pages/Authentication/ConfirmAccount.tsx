// src/pages/Authentication/ConfirmAccount.tsx
import { useEffect, useState } from "react";

export default function ConfirmAccount() {
  const [state, setState] = useState<"loading"|"ok"|"error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get("token");
    if (!token) {
      setState("error");
      setMessage("Missing confirmation token.");
      return;
    }

    fetch(`${import.meta.env.VITE_API_ORIGIN}/api/v1/confirmations?token=${encodeURIComponent(token)}`, {
      method: "GET",
      credentials: "include",
      headers: { "Accept": "application/json" }
    })
    .then(async (r) => {
      if (r.ok) {
        setState("ok");
        setMessage("Your email has been confirmed. You can log in now.");
      } else {
        const data = await r.json().catch(() => ({}));
        setState("error");
        setMessage(data?.errors?.join(", ") || "Confirmation failed.");
      }
    })
    .catch(() => {
      setState("error");
      setMessage("Network error confirming your account.");
    });
  }, []);

  return (
    <div className="auth-center">
      {state === "loading" && <p>Confirming your account…</p>}
      {state === "ok" && <p>{message}</p>}
      {state === "error" && <p className="form-error">{message}</p>}
    </div>
  );
}
