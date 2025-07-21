// src\components\utils\ProfileContent.tsx
"use client";
import { useState } from "react";

// --- Profile editing forms ---
function ProfileInfoForm({ user, onCancel, onSave }) {
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    await onSave({ name, phone });
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <input
          className="w-full rounded border px-3 py-2 bg-zinc-50 dark:bg-zinc-800"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Phone</label>
        <input
          className="w-full rounded border px-3 py-2 bg-zinc-50 dark:bg-zinc-800"
          value={phone}
          onChange={e => setPhone(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-2 rounded bg-zinc-200 dark:bg-zinc-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-3 py-2 rounded bg-primary text-white hover:bg-primary/90"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}

function ChangePasswordForm({ onCancel, onSave }) {
  const [current, setCurrent] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (newPw !== confirm) {
      setError("New passwords do not match.");
      return;
    }
    setSaving(true);
    await onSave({ current, newPw });
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium mb-1">Current Password</label>
        <input
          type="password"
          className="w-full rounded border px-3 py-2 bg-zinc-50 dark:bg-zinc-800"
          value={current}
          onChange={e => setCurrent(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">New Password</label>
        <input
          type="password"
          className="w-full rounded border px-3 py-2 bg-zinc-50 dark:bg-zinc-800"
          value={newPw}
          onChange={e => setNewPw(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Confirm New Password</label>
        <input
          type="password"
          className="w-full rounded border px-3 py-2 bg-zinc-50 dark:bg-zinc-800"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          required
        />
      </div>
      {error && <p className="text-red-500 text-xs">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-2 rounded bg-zinc-200 dark:bg-zinc-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-3 py-2 rounded bg-primary text-white hover:bg-primary/90"
        >
          {saving ? "Saving..." : "Change Password"}
        </button>
      </div>
    </form>
  );
}

function PreferencesForm({ preferences, onCancel, onSave }) {
  const [location, setLocation] = useState(preferences.location);
  const [budget, setBudget] = useState(preferences.budget);

  async function handleSubmit(e) {
    e.preventDefault();
    await onSave({ location, budget });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium mb-1">Preferred Location</label>
        <input
          className="w-full rounded border px-3 py-2 bg-zinc-50 dark:bg-zinc-800"
          value={location}
          onChange={e => setLocatio
