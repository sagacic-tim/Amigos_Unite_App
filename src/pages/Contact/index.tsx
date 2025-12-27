// src/pages/Contact/index.tsx
import { useState, useRef } from "react";
import logo from "@/assets/images/home_page/amigos-unite-logo-128.png";
import styles from "./Contact.module.scss";

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  // simple honeypot
  website?: string;
};

function getCookie(name: string) {
  // Optional CSRF helper; safe if you skip CSRF in the controller.
  const match = document.cookie.match(
    new RegExp(
      "(?:^|; )" +
        name.replace(/([$?*|{}\\\]^])/g, "\\$1") +
        "=([^;]*)",
    ),
  );
  return match ? decodeURIComponent(match[1]) : null;
}

export default function ContactPage() {
  const [form, setForm] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
    website: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function validate(): string | null {
    if (!form.firstName.trim()) return "First name is required.";
    if (!form.lastName.trim()) return "Last name is required.";
    if (!form.email.trim()) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      return "Please enter a valid email.";
    }
    return null;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Honeypot: if filled, treat as spam and quietly succeed
    if (form.website && form.website.trim() !== "") {
      setSuccess("Thanks! Your message has been sent."); // pretend success for bots
      formRef.current?.reset();
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        message: "",
        website: "",
      });
      return;
    }

    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    setSubmitting(true);
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || "";
      const url = `${apiBase}/api/v1/contact_messages`;

      // If your API enforces CSRF, include token (else, the controller can use null_session).
      const csrf = getCookie("CSRF-TOKEN");

      const res = await fetch(url, {
        method: "POST",
        credentials: "include", // include cookies/session
        headers: {
          "Content-Type": "application/json",
          ...(csrf ? { "X-CSRF-Token": csrf } : {}),
        },
        body: JSON.stringify({
          contact_message: {
            first_name: form.firstName,
            last_name: form.lastName,
            email: form.email,
            message: form.message,
          },
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(
          `API ${res.status}: ${text || "Failed to send message"}`,
        );
      }

      setSuccess("Thanks! Your message has been sent."); // ✅ green banner
      formRef.current?.reset();
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        message: "",
        website: "",
      });
    } catch (err: unknown) {
      // Keep console logging for debugging; narrow if we ever want to surface details
      console.error("Contact submit failed:", err);

      // Optionally, if you ever want to inspect the error:
      // if (err instanceof Error) {
      //   console.error(err.message);
      // }

      setError("Sorry—there was a problem sending your message.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className={`page-container page-container--single ${styles.pageContainer}`}
    >
      <main className="container container--center page-container__inner">
        {/* Logo */}
        <section className="section">
          <div className="container container--center container--800">
            <img
              src={logo}
              alt="Amigos Unite logo"
              style={{
                display: "block",
                marginInline: "auto",
                maxWidth: 320,
              }}
            />
          </div>
        </section>

        {/* Title */}
        <section className="section">
          <h1 className="page-title">Contact Amigos Unite</h1>
        </section>

        {/* Form */}
        <section className="section--narrow">
          <form
            ref={formRef}
            className="form-grid form-grid--one-column"
            onSubmit={handleSubmit}
            noValidate
          >
            {/* Status region at the very top */}
            <div
              role="status"
              aria-live="polite"
              style={{ marginBottom: "0.5rem" }}
            >
              {success && <div className="form-success">{success}</div>}
              {error && <div className="form-error">{error}</div>}
            </div>

            <h2 className="form-grid__title">Send us a message</h2>

            {/* Honeypot (hidden from users) */}
            <div
              style={{ position: "absolute", left: "-9999px" }}
              aria-hidden="true"
            >
              <label htmlFor="website">Website</label>
              <input
                id="website"
                name="website"
                type="text"
                autoComplete="off"
                tabIndex={-1}
                value={form.website}
                onChange={handleChange}
              />
            </div>

            <div className="form-grid__fields">
              <fieldset>
                <label htmlFor="firstName">
                  <span>First Name</span>
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={form.firstName}
                  onChange={handleChange}
                  autoComplete="given-name"
                />
              </fieldset>

              <fieldset>
                <label htmlFor="lastName">
                  <span>Last Name</span>
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={form.lastName}
                  onChange={handleChange}
                  autoComplete="family-name"
                />
              </fieldset>

              <fieldset>
                <label htmlFor="email">
                  <span>Email</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  inputMode="email"
                />
              </fieldset>

              <fieldset className="textarea">
                <label htmlFor="message">
                  <span>Message (optional)</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={6}
                />
              </fieldset>
            </div>

            <div className="form-grid__actions">
              <button
                className="button button--primary"
                type="submit"
                disabled={submitting}
              >
                {submitting ? "Sending…" : "Send Message"}
              </button>
              <button
                className="button button--secondary"
                type="button"
                onClick={() =>
                  setForm({
                    firstName: "",
                    lastName: "",
                    email: "",
                    message: "",
                    website: "",
                  })
                }
                disabled={submitting}
              >
                Clear
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
