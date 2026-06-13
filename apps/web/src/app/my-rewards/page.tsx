'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getBetaToken } from '@/lib/auth-client';
import { fanListRewards, fanRedeemReward } from '@/lib/campaign-rewards-client';

interface FanReward {
  id: string;
  status: string;
  claimedAt: string | null;
  redeemedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  rewardDefinition?: { name: string; rewardType: string; pointValue: number | null };
}

const STATUS_COLOURS: Record<string, string> = {
  ISSUED: 'bg-blue-100 text-blue-700',
  CLAIMED: 'bg-yellow-100 text-yellow-700',
  REDEEMED: 'bg-green-100 text-green-700',
  EXPIRED: 'bg-gray-100 text-gray-400',
  PROVIDER_PENDING: 'bg-orange-100 text-orange-700',
  REVOKED: 'bg-red-100 text-red-600',
};

export default function MyRewardsPage() {
  const [rewards, setRewards] = useState<FanReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [redeeming, setRedeeming] = useState<string | null>(null);

  useEffect(() => {
    fanListRewards(getBetaToken())
      .then((data: { rewards: FanReward[] }) => setRewards(data.rewards ?? data))
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  async function handleRedeem(id: string) {
    setRedeeming(id);
    setError(null);
    try {
      const res = await fanRedeemReward(getBetaToken(), id);
      setRewards(rs => rs.map(r => r.id === id ? { ...r, status: res.status ?? 'REDEEMED', redeemedAt: new Date().toISOString() } : r));
    } catch (e: unknown) { setError(String(e)); }
    finally { setRedeeming(null); }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Rewards</h1>
        <p className="text-gray-500 mt-1">Campaign rewards earned from your participation</p>
        <p className="text-xs text-gray-400 mt-1">
          Fan Value points are non-cash loyalty points. They are not money, betting credits, or a withdrawable balance.
          Wallet services are provided by an external wallet provider. PSL One does not hold customer funds directly.
          Wallet integration is operating in sandbox mode. No real financial transactions are processed.
        </p>
      </div>

      {loading && <p className="text-gray-500">Loading your rewards…</p>}
      {error && <p className="text-red-600 bg-red-50 rounded p-3">{error}</p>}

      <div className="space-y-3">
        {rewards.map(r => (
          <div key={r.id} className="border rounded-lg p-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-gray-900">{r.rewardDefinition?.name ?? 'Reward'}</span>
                <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded">{r.rewardDefinition?.rewardType ?? '—'}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${STATUS_COLOURS[r.status] ?? 'bg-gray-100 text-gray-600'}`}>{r.status}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {r.rewardDefinition?.pointValue != null ? `${r.rewardDefinition.pointValue} FV pts` : '—'}
                {r.expiresAt ? ` · Expires ${r.expiresAt.slice(0, 10)}` : ''}
              </p>
            </div>
            {r.status === 'CLAIMED' && (
              <button onClick={() => handleRedeem(r.id)} disabled={redeeming === r.id} className="text-sm bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700 disabled:opacity-50">
                {redeeming === r.id ? 'Redeeming…' : 'Redeem'}
              </button>
            )}
          </div>
        ))}
      </div>

      {!loading && rewards.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed rounded-lg text-gray-400">
          <p>No rewards yet</p>
          <Link href="/campaigns" className="mt-2 inline-block text-indigo-600 text-sm hover:underline">Browse campaigns to earn rewards</Link>
        </div>
      )}
    </div>
  );
}
