'use client';

import { useState, useEffect, useCallback } from 'react';
import { FantasyShell } from '@/components/fantasy/shared/FantasyShell';
import { FantasyLoadingState } from '@/components/fantasy/shared/FantasyLoadingState';
import { getDataMode } from '@/lib/data';
import { isAuthenticated } from '@/lib/auth';
import { apiFetch, apiPatch } from '@/lib/api';

// ── Types ─────────────────────────────────────────────────────────────────────

interface NotificationPreferences {
  fantasyDeadlineReminder: boolean;
  gameweekResults: boolean;
  predictionResults: boolean;
  challengeReceived: boolean;
  leagueUpdates: boolean;
  systemAnnouncements: boolean;
  marketingUpdates: boolean;
}

const DESIGN_DEFAULTS: NotificationPreferences = {
  fantasyDeadlineReminder: true,
  gameweekResults: true,
  predictionResults: true,
  challengeReceived: true,
  leagueUpdates: true,
  systemAnnouncements: true,
  marketingUpdates: false,
};

// ── Toggle row ─────────────────────────────────────────────────────────────────

function ToggleRow({
  label,
  description,
  value,
  onChange,
  saving,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
  saving: boolean;
}) {
  return (
    <div className="flex items-start gap-4 py-3 border-b border-white/8 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-body-sm font-medium text-white">{label}</p>
        <p className="text-label-xs text-white/40 mt-0.5">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={value}
        aria-label={label}
        disabled={saving}
        onClick={() => onChange(!value)}
        className={`relative flex-shrink-0 w-12 h-6 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold disabled:opacity-60 ${
          value ? 'bg-exp-gold' : 'bg-white/15'
        }`}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            value ? 'translate-x-6' : 'translate-x-0'
          }`}
          aria-hidden
        />
      </button>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function NotificationsPreferencesPage() {
  const mode = getDataMode();
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPrefs = useCallback(async () => {
    if (mode === 'DESIGN_REVIEW_DATA') {
      setPrefs(DESIGN_DEFAULTS);
      setLoading(false);
      return;
    }

    if (!isAuthenticated()) {
      setPrefs(DESIGN_DEFAULTS);
      setLoading(false);
      return;
    }

    try {
      const data = await apiFetch<NotificationPreferences>('/notifications/preferences');
      setPrefs(data);
    } catch {
      setPrefs(DESIGN_DEFAULTS);
    } finally {
      setLoading(false);
    }
  }, [mode]);

  useEffect(() => { void loadPrefs(); }, [loadPrefs]);

  async function handleToggle(key: keyof NotificationPreferences, value: boolean) {
    if (!prefs) return;
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);

    if (mode === 'DESIGN_REVIEW_DATA') {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await apiPatch<NotificationPreferences>('/notifications/preferences', { [key]: value });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError('Could not save preference. Please try again.');
      setPrefs(prefs);
    } finally {
      setSaving(false);
    }
  }

  return (
    <FantasyShell
      title="Notifications"
      subtitle="Choose what you want to hear about"
      back={{ href: '/account', label: 'Account' }}
      hideFantasyTabs
    >
      {loading || !prefs ? (
        <FantasyLoadingState />
      ) : (
        <div className="max-w-lg">
          {saved && (
            <div className="mb-4 px-4 py-2.5 bg-exp-green/15 border border-exp-green/25 rounded-card-sm text-body-sm text-exp-green">
              Preferences saved
            </div>
          )}
          {error && (
            <div className="mb-4 px-4 py-2.5 bg-red-500/10 border border-red-500/25 rounded-card-sm text-body-sm text-red-400">
              {error}
            </div>
          )}

          {/* Game notifications */}
          <div className="mb-6">
            <h2 className="text-label-sm text-white/40 uppercase tracking-wider mb-3">Game updates</h2>
            <div className="bg-white/5 border border-white/10 rounded-card px-4">
              <ToggleRow
                label="Fantasy deadline reminder"
                description="Get notified before your fantasy team deadline"
                value={prefs.fantasyDeadlineReminder}
                onChange={v => void handleToggle('fantasyDeadlineReminder', v)}
                saving={saving}
              />
              <ToggleRow
                label="Gameweek results"
                description="Know your points when a gameweek settles"
                value={prefs.gameweekResults}
                onChange={v => void handleToggle('gameweekResults', v)}
                saving={saving}
              />
              <ToggleRow
                label="Prediction results"
                description="Find out how your score predictions did"
                value={prefs.predictionResults}
                onChange={v => void handleToggle('predictionResults', v)}
                saving={saving}
              />
              <ToggleRow
                label="Challenge received"
                description="When another fan challenges you to a prediction"
                value={prefs.challengeReceived}
                onChange={v => void handleToggle('challengeReceived', v)}
                saving={saving}
              />
              <ToggleRow
                label="League updates"
                description="Changes in your private leagues"
                value={prefs.leagueUpdates}
                onChange={v => void handleToggle('leagueUpdates', v)}
                saving={saving}
              />
            </div>
          </div>

          {/* System notifications */}
          <div className="mb-6">
            <h2 className="text-label-sm text-white/40 uppercase tracking-wider mb-3">Platform</h2>
            <div className="bg-white/5 border border-white/10 rounded-card px-4">
              <ToggleRow
                label="System announcements"
                description="Important updates about PSL One"
                value={prefs.systemAnnouncements}
                onChange={v => void handleToggle('systemAnnouncements', v)}
                saving={saving}
              />
              <ToggleRow
                label="Marketing and promotions"
                description="News, campaigns and sponsor offers"
                value={prefs.marketingUpdates}
                onChange={v => void handleToggle('marketingUpdates', v)}
                saving={saving}
              />
            </div>
          </div>

          <p className="text-label-xs text-white/30">
            Notification preferences are stored on your PSL One account and apply across all devices.
            You can unsubscribe from all notifications at any time.
          </p>
        </div>
      )}
    </FantasyShell>
  );
}
