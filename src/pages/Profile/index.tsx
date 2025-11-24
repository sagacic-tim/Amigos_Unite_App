// src/pages/Profile/index.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import { triggerAuthRequired } from "@/services/api/privateApi";
import ProfileForm from "@/components/forms/ProfileForm";
import styles from "./Profile.module.scss";

export default function Profile() {
  const { isLoggedIn, currentAmigo, refreshAuth } = useAuth();
  const navigate = useNavigate();

  // Auth guard
  useEffect(() => {
    if (!isLoggedIn) {
      triggerAuthRequired("Please log in to view this page.");
      navigate("/", { replace: true });
    }
  }, [isLoggedIn, navigate]);

  if (!isLoggedIn) return null;

  if (!currentAmigo?.id) {
    return (
      <div className="container container--page">
        <section className="section-content">
          <h1 className="page-title">Profile</h1>
          <p>Loading your profile…</p>
        </section>
      </div>
    );
  }

  return (
    <div className="container container--page">
      <section className={`section-content ${styles.page}`}>
        <h1 className={`page-title ${styles.header}`}>Amigo Profile</h1>

        <ProfileForm
          currentAmigo={currentAmigo}
          refreshAuth={refreshAuth}
          onCancel={() => navigate("/amigos")}
        />
      </section>
    </div>
  );
}
