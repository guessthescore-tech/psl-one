'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { rewardsClient, AdminRewardStats } from '../../../lib/rewards-client';

export default function AdminRewardsPage() {
  const [stats, setStats] = useState<AdminRewardStats | null>(null);
  const [error, setError] = useState('');
  const [evalUserId, setEvalUserId] = useState('');
  const [evalResult, setEvalResult] = useState('');
  const [evaluatingAll, setEvaluatingAll] = useState(false);
  const [evaluatingOne, setEvaluatingOne] = useState(false);

  useEffect(() => {
    rewardsClient.adminGetStats().then(setStats).catch(e => setError(e.message));
  }, []);

  async function handleEvalOne() {
    if (!evalUserId.trim()) return;
    setEvaluatingOne(true);
    setEvalResult('');
    try {
      const results = await rewardsClient.adminEvaluateFan(evalUserId.trim());
      const eligible = results.filter(r => r.status === 'ELIGIBLE').length;
      setEvalResult(`Evaluated ${results.length} definitions — ${eligible} eligible.`);
    } catch (e: unknown) {
      setEvalResult(e instanceof Error ? e.message : 'Evaluation failed');
    } finally {
      setEvaluatingOne(false);
    }
  }

  async function handleEvalAll() {
    setEvaluatingAll(true);
    setEvalResult('');
    try {
      const result = await rewardsClient.adminEvaluateAll();
      setEvalResult(`Evaluated ${result.evaluated} fans.`);
      const fresh = await rewardsClient.adminGetStats();
      setStats(fresh);
    } catch (e: unknown) {
      setEvalResult(e instanceof Error ? e.message : 'Evaluation failed');
    } finally {
      setEvaluatingAll(false);
    }
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Reward Readiness Admin</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage reward readiness definitions and evaluate fan eligibility.
          </p>
        </div>
        <Link href="/admin/rewards/definitions" className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
          Manage Definitions
        </Link>
      </div>

      {stats && (
        <div className="bg-green-50 border border-green-200 rounded p-3 mb-6 text-xs text-green-800">
          {stats.nonFinancialConfirmation}
        </div>
      )}

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {stats && (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="border rounded p-4 bg-white">
              <div className="text-2xl font-bold">{stats.totalDefinitions}</div>
              <div className="text-xs text-gray-500 mt-1">Total Definitions</div>
              <div className="text-xs text-gray-400">{stats.enabledDefinitions} enabled</div>
            </div>
            <div className="border rounded p-4 bg-white">
              <div className="text-2xl font-bold">{stats.totalEvaluations}</div>
              <div className="text-xs text-gray-500 mt-1">Total Evaluations</div>
            </div>
            <div className="border rounded p-4 bg-white">
              <div className="text-2xl font-bold text-green-600">{stats.eligibilityRate}%</div>
              <div className="text-xs text-gray-500 mt-1">Eligibility Rate</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="border rounded p-4 bg-green-50">
              <div className="text-xl font-bold text-green-600">{stats.eligibleCount}</div>
              <div className="text-xs text-green-600">Eligible</div>
            </div>
            <div className="border rounded p-4 bg-red-50">
              <div className="text-xl font-bold text-red-500">{stats.ineligibleCount}</div>
              <div className="text-xs text-red-500">Ineligible</div>
            </div>
            <div className="border rounded p-4 bg-gray-50">
              <div className="text-xl font-bold text-gray-400">{stats.pendingCount}</div>
              <div className="text-xs text-gray-400">Pending Evaluation</div>
            </div>
          </div>

          {stats.byCategory.length > 0 && (
            <div className="border rounded p-4 bg-white mb-6">
              <h2 className="text-sm font-semibold mb-3">By Category</h2>
              <div className="flex flex-wrap gap-2">
                {stats.byCategory.map(c => (
                  <span key={c.category} className="text-xs bg-gray-100 px-3 py-1 rounded-full">
                    {c.category} ({c.count})
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <div className="border rounded p-4 bg-white mb-4">
        <h2 className="text-sm font-semibold mb-3">Evaluate One Fan</h2>
        <div className="flex gap-2">
          <input
            className="flex-1 border rounded px-3 py-2 text-sm"
            placeholder="User ID"
            value={evalUserId}
            onChange={e => setEvalUserId(e.target.value)}
          />
          <button
            onClick={handleEvalOne}
            disabled={evaluatingOne || !evalUserId.trim()}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {evaluatingOne ? 'Evaluating…' : 'Evaluate'}
          </button>
        </div>
        {evalResult && <p className="text-sm text-gray-700 mt-2">{evalResult}</p>}
      </div>

      <div className="border rounded p-4 bg-white">
        <h2 className="text-sm font-semibold mb-2">Evaluate All Fans</h2>
        <p className="text-xs text-gray-500 mb-3">
          Re-evaluates eligibility for all active fans against all enabled reward definitions.
        </p>
        <button
          onClick={handleEvalAll}
          disabled={evaluatingAll}
          className="px-4 py-2 bg-orange-600 text-white text-sm rounded hover:bg-orange-700 disabled:opacity-50"
        >
          {evaluatingAll ? 'Evaluating All Fans…' : 'Evaluate All Fans'}
        </button>
      </div>
    </main>
  );
}
