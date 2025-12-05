
// src/pages/Amigos/components/AmigoEditForm.tsx
import { useState } from 'react';
import type { Amigo } from '@/types/amigos/AmigoTypes';
import { updateAmigo } from '@/services/AmigoService';

export default function AmigoEditForm({
  amigo,
  onSaved,
  onCancel,
}: {
  amigo: Amigo;
  onSaved: (amigo: Amigo) => void;
  onCancel: () => void;
}) {
  const [firstName, setFirstName] = useState(amigo.first_name ?? '');
  const [lastName, setLastName] = useState(amigo.last_name ?? '');
  const [userName, setUserName] = useState(amigo.user_name ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const updated = await updateAmigo(amigo.id, {
        first_name: firstName,
        last_name:  lastName,
        user_name:  userName,
      });
      onSaved(updated);
    } catch (err: any) {
      setError(err?.response?.data?.errors?.[0] || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={submit}>
      <h2>Edit your details</h2>
      {error && <p className="error">{error}</p>}

      <label>
        First name
        <input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
      </label>

      <label>
        Last name
        <input value={lastName} onChange={(e) => setLastName(e.target.value)} />
      </label>

      <label>
        Username
        <input value={userName} onChange={(e) => setUserName(e.target.value)} />
      </label>

      <div>
        <button className="button__primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button type="button" className="button__cancel" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
