'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { profileClient, type FanProfile } from '@/lib/profile-client';
import { footballClient, type Team } from '@/lib/football-client';

export default function EditProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<FanProfile | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    Promise.all([
      profileClient.getProfile(),
      footballClient.getActiveSeason().then((s) => footballClient.listTeams({ seasonSlug: s.slug })),
    ])
      .then(([p, t]) => { setProfile(p); setTeams(t); })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setSaving(true);

    const fd = new FormData(e.currentTarget);
    const preferredTeamId = fd.get('preferredTeamId') as string;

    try {
      const patch: import('@/lib/profile-client').UpdateProfileInput = {};
      const displayName = fd.get('displayName') as string;
      const city = fd.get('city') as string;
      const country = fd.get('country') as string;
      if (displayName) patch.displayName = displayName;
      if (city) patch.city = city;
      if (country) patch.country = country;
      patch.preferredTeamId = preferredTeamId || null;
      const updated = await profileClient.updateProfile(patch);
      setProfile(updated);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-psl-navy flex items-center justify-center">
        <p className="text-white text-sm">Loading…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-psl-navy">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <nav className="text-gray-400 text-sm mb-6">
          <Link href="/profile" className="hover:text-white transition">Profile</Link>
          <span className="mx-2">›</span>
          <span className="text-white">Edit</span>
        </nav>

        <h1 className="text-2xl font-bold text-white mb-6">Edit Profile</h1>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded px-4 py-3 mb-4 text-sm">
            Profile saved.
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded px-4 py-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg px-6 py-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Display name</label>
            <input
              name="displayName"
              type="text"
              defaultValue={profile?.displayName ?? ''}
              maxLength={100}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-psl-navy"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input
              name="city"
              type="text"
              defaultValue={profile?.city ?? ''}
              maxLength={100}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-psl-navy"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <input
              name="country"
              type="text"
              defaultValue={profile?.country ?? ''}
              maxLength={100}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-psl-navy"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preferred team</label>
            <select
              name="preferredTeamId"
              defaultValue={profile?.preferredTeamId ?? ''}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-psl-navy"
            >
              <option value="">— No preference —</option>
              {teams.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-psl-navy text-white font-semibold py-2 rounded hover:bg-opacity-90 disabled:opacity-50 transition"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </div>
    </main>
  );
}
