// src/components/Authentication/ResendConfirmation.tsx
import { useState } from "react";

export default function ResendConfirmation() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    const res = await fetch(`${import.meta.env.VITE_API_ORIGIN}/api/v1/confirmations`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({ email })
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      if (data.status === "already_confirmed") {
        setMsg("This account is already confirmed. You can log in.");
      } else {
        setMsg("If that email exists and is unconfirmed, we just sent a new confirmation.");
      }
    } else {
      setMsg(data?.errors?.join(", ") || "Unable to resend confirmation.");
    }
  };

  return (
    <form onSubmit={submit} className="form-grid">
      <label className="form-grid label">
        Email:
        <input
          type="email"
          className="form-grid__fields"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
      </label>
      <button className="button button--primary" type="submit">Resend confirmation</button>
      {msg && <p>{msg}</p>}
    </form>
  );
}
