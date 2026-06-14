'use client';

import { useEffect, useState } from 'react';
import { fanGetAllocation } from '@/lib/social-prediction-client';
import { getBetaToken } from '@/lib/auth-client';

export default function AllocationPage() {
  const [allocation, setAllocation] = useState<Record<string, unknown> | null>(null);
  const [gameweekId, setGameweekId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!gameweekId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fanGetAllocation(getBetaToken(), gameweekId);
      setAllocation(data);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">My Points Allocation</h1>
      <p className="text-sm text-gray-500 mb-6">
        PSL One social prediction challenges use system-issued gameplay points only. Gameplay points cannot be
        purchased, transferred, withdrawn or exchanged for money.
      </p>

      <div className="flex gap-2 mb-6">
        <input
          className="border rounded px-3 py-1.5 text-sm flex-1"
          placeholder="Gameweek ID"
          value={gameweekId}
          onChange={e => setGameweekId(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm"
          onClick={load}
          disabled={!gameweekId}
        >
          Load
        </button>
      </div>

      {loading && <p className="text-gray-500 text-sm">Loading...</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}

      {allocation && (
        <div className="border rounded-lg p-5 bg-white shadow-sm space-y-3">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-green-50 rounded p-3">
              <p className="text-xs text-gray-500">Total Allocation</p>
              <p className="text-xl font-bold text-green-700">{String(allocation['totalAllocation'])}</p>
              <p className="text-xs text-gray-400">pts</p>
            </div>
            <div className="bg-yellow-50 rounded p-3">
              <p className="text-xs text-gray-500">Used</p>
              <p className="text-xl font-bold text-yellow-700">{String(allocation['usedAllocation'])}</p>
              <p className="text-xs text-gray-400">pts</p>
            </div>
            <div className="bg-blue-50 rounded p-3">
              <p className="text-xs text-gray-500">Remaining</p>
              <p className="text-xl font-bold text-blue-700">{String(allocation['remainingAllocation'])}</p>
              <p className="text-xs text-gray-400">pts</p>
            </div>
          </div>
          <div className="text-sm text-gray-600 space-y-1 border-t pt-3">
            <p>Max concurrent challenges: <strong>{String(allocation['maxConcurrentChallenges'])}</strong></p>
            <p>Max commitment per prediction: <strong>{String(allocation['maxCommitmentPctPerPrediction'])}%</strong></p>
            <p>Max confidence multiplier: <strong>{String(allocation['maxConfidenceMultiplier'])}×</strong></p>
          </div>
        </div>
      )}

      <div className="mt-6 text-xs text-gray-400 border-t pt-3">
        Fan Value is a separate non-financial loyalty score and is not used to fund prediction challenges.
      </div>
    </main>
  );
}
