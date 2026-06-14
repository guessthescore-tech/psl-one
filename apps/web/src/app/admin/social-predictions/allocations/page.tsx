'use client';

import { useState } from 'react';
import { adminGrantAllocation, adminAdjustAllocation } from '@/lib/admin-social-prediction-client';
import { getBetaToken } from '@/lib/auth-client';

export default function AdminAllocationsPage() {
  const [grantForm, setGrantForm] = useState({ gameweekId: '', seasonId: '', totalAllocation: 500, maxConcurrent: 5, maxCommitPct: 50, maxMultiplier: 2.0 });
  const [adjustForm, setAdjustForm] = useState({ fanUserId: '', gameweekId: '', totalAllocation: 500, reason: '' });
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function grant() {
    try {
      await adminGrantAllocation(getBetaToken(), {
        gameweekId: grantForm.gameweekId,
        seasonId: grantForm.seasonId,
        totalAllocation: grantForm.totalAllocation,
        maxConcurrentChallenges: grantForm.maxConcurrent,
        maxCommitmentPctPerPrediction: grantForm.maxCommitPct,
        maxConfidenceMultiplier: grantForm.maxMultiplier,
      });
      setMsg('Points allocation granted to all active fans for this gameweek.');
    } catch (e) {
      setError(String(e));
    }
  }

  async function adjust() {
    if (!adjustForm.fanUserId || !adjustForm.gameweekId) { setMsg('Enter fan user ID and gameweek ID.'); return; }
    try {
      await adminAdjustAllocation(getBetaToken(), adjustForm.fanUserId, adjustForm.gameweekId, {
        totalAllocation: adjustForm.totalAllocation,
        adjustmentReason: adjustForm.reason,
      });
      setMsg('Allocation adjusted.');
    } catch (e) {
      setError(String(e));
    }
  }

  function setG(k: string, v: string | number) { setGrantForm(f => ({ ...f, [k]: v })); }
  function setA(k: string, v: string | number) { setAdjustForm(f => ({ ...f, [k]: v })); }

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">Points Allocations</h1>
        <p className="text-xs text-gray-500 mb-5">
          System-issued gameplay points only. Points cannot be purchased or exchanged for money.
          Fan Value is a separate non-financial loyalty score and is not used to fund prediction challenges.
        </p>
      </div>

      {msg && <p className="text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded p-2">{msg}</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="border rounded-lg p-5 bg-white shadow-sm">
        <h2 className="font-semibold text-lg mb-4">Grant Allocation (All Fans)</h2>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Gameweek ID</label>
            <input className="border rounded px-2 py-1.5 text-sm w-full" value={grantForm.gameweekId} onChange={e => setG('gameweekId', e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Season ID</label>
            <input className="border rounded px-2 py-1.5 text-sm w-full" value={grantForm.seasonId} onChange={e => setG('seasonId', e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Total Allocation (pts)</label>
            <input type="number" className="border rounded px-2 py-1.5 text-sm w-full" value={grantForm.totalAllocation} onChange={e => setG('totalAllocation', Number(e.target.value))} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Max Concurrent Challenges</label>
            <input type="number" className="border rounded px-2 py-1.5 text-sm w-full" value={grantForm.maxConcurrent} onChange={e => setG('maxConcurrent', Number(e.target.value))} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Max Commitment %</label>
            <input type="number" className="border rounded px-2 py-1.5 text-sm w-full" value={grantForm.maxCommitPct} onChange={e => setG('maxCommitPct', Number(e.target.value))} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Max Confidence Multiplier</label>
            <input type="number" step="0.5" className="border rounded px-2 py-1.5 text-sm w-full" value={grantForm.maxMultiplier} onChange={e => setG('maxMultiplier', Number(e.target.value))} />
          </div>
        </div>
        <button onClick={grant} disabled={!grantForm.gameweekId || !grantForm.seasonId} className="bg-blue-600 text-white px-4 py-2 rounded text-sm disabled:opacity-50">
          Grant to All Active Fans
        </button>
      </div>

      <div className="border rounded-lg p-5 bg-white shadow-sm">
        <h2 className="font-semibold text-lg mb-4">Adjust Individual Allocation</h2>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Fan User ID</label>
            <input className="border rounded px-2 py-1.5 text-sm w-full" value={adjustForm.fanUserId} onChange={e => setA('fanUserId', e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Gameweek ID</label>
            <input className="border rounded px-2 py-1.5 text-sm w-full" value={adjustForm.gameweekId} onChange={e => setA('gameweekId', e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">New Total Allocation (pts)</label>
            <input type="number" className="border rounded px-2 py-1.5 text-sm w-full" value={adjustForm.totalAllocation} onChange={e => setA('totalAllocation', Number(e.target.value))} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Adjustment Reason</label>
            <input className="border rounded px-2 py-1.5 text-sm w-full" value={adjustForm.reason} onChange={e => setA('reason', e.target.value)} />
          </div>
        </div>
        <button onClick={adjust} disabled={!adjustForm.fanUserId || !adjustForm.gameweekId} className="bg-gray-800 text-white px-4 py-2 rounded text-sm disabled:opacity-50">
          Adjust Allocation
        </button>
      </div>
    </main>
  );
}
