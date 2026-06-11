'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { profileClient, type NotificationPreferences } from '@/lib/profile-client';

type PrefKey = keyof Pick<
  NotificationPreferences,
  'matchReminders' | 'teamNews' | 'fantasyUpdates' | 'rewardsUpdates'
>;

const PREF_LABELS: Record<PrefKey, { label: string; description: string }> = {
  matchReminders: {
    label: 'Match reminders',
    description: 'Get notified before your favourite team kicks off',
  },
  teamNews: {
    label: 'Team news',
    description: 'Squad updates, injuries, and transfer rumours',
  },
  fantasyUpdates: {
    label: 'Fantasy updates',
    description: 'Weekly picks, deadline alerts, and scoring summaries',
  },
  rewardsUpdates: {
    label: 'Rewards & offers',
    description: 'Exclusive deals and points balance alerts',
  },
};

const PREF_KEYS: PrefKey[] = ['matchReminders', 'teamNews', 'fantasyUpdates', 'rewardsUpdates'];

function Toggle({
  checked,
  saving,
  onChange,
}: {
  checked: boolean;
  saving: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={saving}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${
        checked ? 'bg-psl-navy' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

export default function PreferencesPage() {
  const router = useRouter();
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [saving, setSaving] = useState<PrefKey | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    profileClient.getPreferences()
      .then(setPrefs)
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  async function toggle(key: PrefKey, value: boolean) {
    if (!prefs || saving) return;
    setSaving(key);
    try {
      const updated = await profileClient.updatePreferences({ [key]: value });
      setPrefs(updated);
    } catch {
      // revert optimistic — just re-fetch
      profileClient.getPreferences().then(setPrefs).catch(() => {});
    } finally {
      setSaving(null);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-psl-navy flex items-center justify-center">
        <p className="text-white text-sm">Loading…</p>
      </main>
    );
  }

  if (!prefs) return null;

  return (
    <main className="min-h-screen bg-psl-navy">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <nav className="text-gray-400 text-sm mb-6">
          <Link href="/profile" className="hover:text-white transition">Profile</Link>
          <span className="mx-2">›</span>
          <span className="text-white">Preferences</span>
        </nav>

        <h1 className="text-2xl font-bold text-white mb-2">Notification Preferences</h1>
        <p className="text-gray-400 text-sm mb-6">Changes save automatically.</p>

        <div className="bg-white rounded-lg divide-y divide-gray-100">
          {PREF_KEYS.map(key => {
            const meta = PREF_LABELS[key];
            return (
              <div key={key} className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-psl-navy">{meta.label}</p>
                  <p className="text-xs text-gray-400">{meta.description}</p>
                </div>
                <Toggle
                  checked={prefs[key]}
                  saving={saving === key}
                  onChange={v => toggle(key, v)}
                />
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
