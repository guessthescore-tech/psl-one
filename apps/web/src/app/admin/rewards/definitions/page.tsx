'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  rewardsClient,
  RewardDefinition,
  RewardReadinessCategory,
  REWARD_CATEGORY_LABELS,
} from '../../../../lib/rewards-client';

const CATEGORIES: RewardReadinessCategory[] = [
  'FANTASY', 'PREDICTIONS', 'CHALLENGES', 'SPONSOR_READY', 'FAN_VALUE', 'LOYALTY', 'PLATFORM',
];

export default function AdminRewardDefinitionsPage() {
  const [defs, setDefs] = useState<RewardDefinition[]>([]);
  const [error, setError] = useState('');
  const [toggling, setToggling] = useState<string | null>(null);

  // Create form state
  const [creating, setCreating] = useState(false);
  const [formSlug, setFormSlug] = useState('');
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCategory, setFormCategory] = useState<RewardReadinessCategory>('PLATFORM');
  const [formMinPoints, setFormMinPoints] = useState('');
  const [formRequiresFantasy, setFormRequiresFantasy] = useState(false);
  const [formRequiresPrediction, setFormRequiresPrediction] = useState(false);
  const [formRequiresChallenge, setFormRequiresChallenge] = useState(false);
  const [formUnlockHint, setFormUnlockHint] = useState('');
  const [formSponsor, setFormSponsor] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  useEffect(() => {
    rewardsClient.adminGetDefinitions().then(setDefs).catch(e => setError(e.message));
  }, []);

  async function handleToggle(id: string) {
    setToggling(id);
    try {
      const updated = await rewardsClient.adminToggleDefinition(id);
      setDefs(prev => prev.map(d => d.id === id ? updated : d));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Toggle failed');
    } finally {
      setToggling(null);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      const newDef = await rewardsClient.adminCreateDefinition({
        slug: formSlug,
        name: formName,
        description: formDesc,
        category: formCategory,
        minFanValuePoints: formMinPoints ? parseInt(formMinPoints, 10) : null,
        requiresFantasyTeam: formRequiresFantasy,
        requiresPredictionActivity: formRequiresPrediction,
        requiresChallengeActivity: formRequiresChallenge,
        unlockHint: formUnlockHint || null,
        sponsorName: formSponsor || null,
      });
      setDefs(prev => [...prev, newDef]);
      setCreating(false);
      setFormSlug(''); setFormName(''); setFormDesc(''); setFormMinPoints('');
      setFormUnlockHint(''); setFormSponsor('');
      setFormRequiresFantasy(false); setFormRequiresPrediction(false); setFormRequiresChallenge(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Create failed');
    } finally {
      setFormSubmitting(false);
    }
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Reward Definitions</h1>
          <Link href="/admin/rewards" className="text-sm text-blue-600 hover:underline">← Admin Overview</Link>
        </div>
        <button
          onClick={() => setCreating(v => !v)}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          {creating ? 'Cancel' : 'New Definition'}
        </button>
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {creating && (
        <form onSubmit={handleCreate} className="border rounded p-4 bg-white mb-6 space-y-3">
          <h2 className="text-sm font-semibold mb-2">Create Reward Readiness Definition</h2>
          <div className="bg-amber-50 border border-amber-200 rounded p-2 text-xs text-amber-700">
            No redemption flow will be created. This definition configures future eligibility readiness only.
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input className="border rounded px-3 py-2 text-sm" placeholder="Slug (unique)" value={formSlug} onChange={e => setFormSlug(e.target.value)} required />
            <input className="border rounded px-3 py-2 text-sm" placeholder="Name" value={formName} onChange={e => setFormName(e.target.value)} required />
          </div>
          <textarea className="w-full border rounded px-3 py-2 text-sm" placeholder="Description" rows={2} value={formDesc} onChange={e => setFormDesc(e.target.value)} required />
          <div className="grid grid-cols-2 gap-3">
            <select className="border rounded px-3 py-2 text-sm" value={formCategory} onChange={e => setFormCategory(e.target.value as RewardReadinessCategory)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{REWARD_CATEGORY_LABELS[c]}</option>)}
            </select>
            <input className="border rounded px-3 py-2 text-sm" placeholder="Min Fan Value Points (optional)" type="number" value={formMinPoints} onChange={e => setFormMinPoints(e.target.value)} />
          </div>
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-1"><input type="checkbox" checked={formRequiresFantasy} onChange={e => setFormRequiresFantasy(e.target.checked)} /> Requires Fantasy Team</label>
            <label className="flex items-center gap-1"><input type="checkbox" checked={formRequiresPrediction} onChange={e => setFormRequiresPrediction(e.target.checked)} /> Requires Prediction Activity</label>
            <label className="flex items-center gap-1"><input type="checkbox" checked={formRequiresChallenge} onChange={e => setFormRequiresChallenge(e.target.checked)} /> Requires Challenge Activity</label>
          </div>
          <input className="w-full border rounded px-3 py-2 text-sm" placeholder="Unlock hint (optional)" value={formUnlockHint} onChange={e => setFormUnlockHint(e.target.value)} />
          <input className="w-full border rounded px-3 py-2 text-sm" placeholder="Sponsor name (optional)" value={formSponsor} onChange={e => setFormSponsor(e.target.value)} />
          <button type="submit" disabled={formSubmitting} className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50">
            {formSubmitting ? 'Creating…' : 'Create Definition'}
          </button>
        </form>
      )}

      {defs.length === 0 && !creating && <p className="text-gray-400 text-sm">No definitions yet.</p>}

      <div className="space-y-3">
        {defs.map(def => (
          <div key={def.id} className={`border rounded p-4 bg-white ${!def.isEnabled ? 'opacity-60' : ''}`}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{def.name}</span>
                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{REWARD_CATEGORY_LABELS[def.category]}</span>
                {!def.isEnabled && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">Disabled</span>}
              </div>
              <div className="flex gap-2">
                <Link href={`/admin/rewards/definitions/${def.id}`} className="text-xs text-blue-600 hover:underline">
                  Eligible Fans
                </Link>
                <button
                  onClick={() => handleToggle(def.id)}
                  disabled={toggling === def.id}
                  className={`text-xs px-3 py-1 rounded ${def.isEnabled ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-green-100 text-green-600 hover:bg-green-200'} disabled:opacity-50`}
                >
                  {toggling === def.id ? '…' : def.isEnabled ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-2">{def.description}</p>
            <div className="flex flex-wrap gap-2 text-xs text-gray-500">
              {def.minFanValuePoints != null && <span className="bg-blue-50 px-2 py-0.5 rounded">{def.minFanValuePoints}+ FV points</span>}
              {def.requiresFantasyTeam && <span className="bg-yellow-50 px-2 py-0.5 rounded">Fantasy Team</span>}
              {def.requiresPredictionActivity && <span className="bg-purple-50 px-2 py-0.5 rounded">Predictions</span>}
              {def.requiresChallengeActivity && <span className="bg-orange-50 px-2 py-0.5 rounded">Challenges</span>}
              {def.requiredAchievementSlugs.length > 0 && <span className="bg-green-50 px-2 py-0.5 rounded">{def.requiredAchievementSlugs.length} achievement(s)</span>}
              {def.sponsorName && <span className="bg-indigo-50 px-2 py-0.5 rounded">Sponsor: {def.sponsorName}</span>}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
