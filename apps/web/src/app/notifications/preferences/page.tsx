'use client';

import { useEffect, useState } from 'react';
import { getPreferences, updatePreferences } from '@/lib/notifications-client';
import { getBetaToken } from '@/lib/auth-client';


const PREF_LABELS: Record<string, string> = {
  inAppEnabled: 'In-app notifications',
  fantasyEnabled: 'Fantasy',
  predictionsEnabled: 'Predictions',
  challengesEnabled: 'Challenges',
  achievementsEnabled: 'Achievements',
  rewardsEnabled: 'Rewards',
  systemEnabled: 'System',
  marketingEnabled: 'Marketing',
};

type Prefs = Record<string, boolean>;

export default function NotificationPreferencesPage() {
  const [prefs, setPrefs] = useState<Prefs | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getPreferences(getBetaToken())
      .then(setPrefs)
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    if (!prefs) return;
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const updated = await updatePreferences(getBetaToken(), prefs);
      setPrefs(updated);
      setSaved(true);
    } catch (e) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  }

  function toggle(key: string) {
    setPrefs(p => p ? { ...p, [key]: !p[key] } : p);
  }

  if (loading) return <p className="p-8">Loading...</p>;

  return (
    <main className="p-8 max-w-lg mx-auto">
      <a href="/notifications" className="text-sm text-blue-600 hover:underline mb-4 inline-block">
        ← Inbox
      </a>
      <h1 className="text-2xl font-bold mb-6">Notification Preferences</h1>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      {saved && <p className="text-green-600 mb-4">Preferences saved.</p>}
      {prefs && (
        <div className="border rounded p-4 space-y-4">
          {Object.keys(PREF_LABELS).map(key => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm font-medium">{PREF_LABELS[key]}</span>
              <button
                onClick={() => toggle(key)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  prefs[key] ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    prefs[key] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save preferences'}
          </button>
        </div>
      )}
    </main>
  );
}
