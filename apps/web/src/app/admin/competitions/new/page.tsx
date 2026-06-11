'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCompetition } from '@/lib/admin-client';

const FORMATS = ['LEAGUE', 'CUP', 'TOURNAMENT', 'HYBRID'];

function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function NewCompetitionPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [format, setFormat] = useState('LEAGUE');
  const [teamCount, setTeamCount] = useState('');
  const [hasGroups, setHasGroups] = useState(false);
  const [hasKnockouts, setHasKnockouts] = useState(false);
  const [hasHomeAway, setHasHomeAway] = useState(true);
  const [usesNeutralVenues, setUsesNeutralVenues] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function handleNameChange(v: string) {
    setName(v);
    setSlug(toSlug(v));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const comp = await createCompetition({
        name, slug, format,
        hasGroups, hasKnockouts, hasHomeAway, usesNeutralVenues,
        ...(teamCount ? { teamCount: parseInt(teamCount, 10) } : {}),
      });
      router.push(`/admin/competitions/${comp.id}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error');
      setSaving(false);
    }
  }

  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">New Competition</h1>

      {error && <p className="text-red-600 bg-red-50 p-3 rounded mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
            className="w-full border rounded px-3 py-2 text-sm"
            placeholder="PSL Premiership"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Slug</label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
            className="w-full border rounded px-3 py-2 text-sm font-mono"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Format</label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
          >
            {FORMATS.map((f) => <option key={f}>{f}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Team Count (optional)</label>
          <input
            type="number"
            value={teamCount}
            onChange={(e) => setTeamCount(e.target.value)}
            min={2}
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>

        <fieldset className="border rounded p-3 space-y-2">
          <legend className="text-sm font-medium px-1">Flags</legend>
          {([
            ['hasGroups', 'Has Groups', hasGroups, setHasGroups],
            ['hasKnockouts', 'Has Knockouts', hasKnockouts, setHasKnockouts],
            ['hasHomeAway', 'Home & Away', hasHomeAway, setHasHomeAway],
            ['usesNeutralVenues', 'Neutral Venues', usesNeutralVenues, setUsesNeutralVenues],
          ] as const).map(([key, label, val, setter]) => (
            <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={val}
                onChange={(e) => (setter as (v: boolean) => void)(e.target.checked)}
              />
              {label}
            </label>
          ))}
        </fieldset>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm disabled:opacity-50"
          >
            {saving ? 'Creating...' : 'Create Competition'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/competitions')}
            className="px-4 py-2 border rounded text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </main>
  );
}
