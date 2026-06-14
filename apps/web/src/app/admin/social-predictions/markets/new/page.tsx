'use client';

import { useState } from 'react';
import { adminCreateMarketConfig } from '@/lib/admin-social-prediction-client';
import { getBetaToken } from '@/lib/auth-client';

const MARKET_TYPES = ['MATCH_RESULT', 'BOTH_TEAMS_SCORE', 'FIRST_SCORER', 'CORRECT_SCORE', 'TOTAL_GOALS', 'HALF_TIME_RESULT'];

export default function NewMarketConfigPage() {
  const [form, setForm] = useState({
    marketType: 'MATCH_RESULT',
    label: '',
    description: '',
    baseOpportunity: 100,
    pointsReturnRate: 1.0,
    allowedMultipliers: '1.0,1.5,2.0',
    minCommitmentPct: 5,
    maxCommitmentPct: 100,
    seasonId: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function set(k: string, v: string | number) {
    setForm(f => ({ ...f, [k]: v }));
  }

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const multipliers = form.allowedMultipliers.split(',').map(n => parseFloat(n.trim())).filter(n => !isNaN(n));
      await adminCreateMarketConfig(getBetaToken(), {
        marketType: form.marketType,
        label: form.label,
        ...(form.description ? { description: form.description } : {}),
        baseOpportunity: form.baseOpportunity,
        pointsReturnRate: form.pointsReturnRate,
        allowedMultipliers: multipliers,
        minCommitmentPct: form.minCommitmentPct,
        maxCommitmentPct: form.maxCommitmentPct,
        seasonId: form.seasonId,
      });
      setResult('Market config created.');
    } catch (e) {
      setError(String(e));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-bold mb-5">New Market Config</h1>

      <div className="space-y-4">
        <div>
          <label className="text-xs text-gray-500 block mb-1">Market Type</label>
          <select
            className="border rounded px-3 py-1.5 text-sm w-full"
            value={form.marketType}
            onChange={e => set('marketType', e.target.value)}
          >
            {MARKET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Label</label>
          <input className="border rounded px-3 py-1.5 text-sm w-full" value={form.label} onChange={e => set('label', e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Season ID</label>
          <input className="border rounded px-3 py-1.5 text-sm w-full" value={form.seasonId} onChange={e => set('seasonId', e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Base Opportunity (pts)</label>
            <input type="number" className="border rounded px-3 py-1.5 text-sm w-full" value={form.baseOpportunity} onChange={e => set('baseOpportunity', Number(e.target.value))} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Points Return Rate</label>
            <input type="number" step="0.1" className="border rounded px-3 py-1.5 text-sm w-full" value={form.pointsReturnRate} onChange={e => set('pointsReturnRate', Number(e.target.value))} />
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Allowed Multipliers (comma-separated)</label>
          <input className="border rounded px-3 py-1.5 text-sm w-full" value={form.allowedMultipliers} onChange={e => set('allowedMultipliers', e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Min Commitment %</label>
            <input type="number" className="border rounded px-3 py-1.5 text-sm w-full" value={form.minCommitmentPct} onChange={e => set('minCommitmentPct', Number(e.target.value))} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Max Commitment %</label>
            <input type="number" className="border rounded px-3 py-1.5 text-sm w-full" value={form.maxCommitmentPct} onChange={e => set('maxCommitmentPct', Number(e.target.value))} />
          </div>
        </div>

        <button
          onClick={submit}
          disabled={submitting || !form.label || !form.seasonId}
          className="w-full bg-blue-600 text-white py-2 rounded text-sm disabled:opacity-50"
        >
          {submitting ? 'Creating...' : 'Create Market Config'}
        </button>
      </div>

      {result && <p className="mt-4 text-green-700 text-sm bg-green-50 border border-green-200 rounded p-3">{result}</p>}
      {error && <p className="mt-4 text-red-600 text-sm">{error}</p>}
    </main>
  );
}
