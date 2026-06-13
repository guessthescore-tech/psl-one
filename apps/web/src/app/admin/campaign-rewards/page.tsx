'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getBetaToken } from '@/lib/auth-client';
import { adminListFanRewards } from '@/lib/campaign-rewards-client';

interface FanReward {
  id: string;
  fanUserId: string;
  rewardDefinitionId: string;
  status: string;
  claimedAt: string | null;
  redeemedAt: string | null;
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

export default function AdminCampaignRewardsPage() {
  const [rewards, setRewards] = useState<FanReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminListFanRewards(getBetaToken())
      .then((data: { rewards: FanReward[] }) => setRewards(data.rewards ?? data))
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaign Rewards Issued</h1>
          <p className="text-gray-500 mt-1">All fan rewards issued via campaigns</p>
        </div>
        <Link href="/admin/reward-definitions" className="text-sm border px-3 py-2 rounded text-gray-600 hover:bg-gray-50">
          Reward Definitions
        </Link>
      </div>

      <p className="text-xs text-gray-400 mb-4 bg-gray-50 rounded p-3">
        Fan Value points are non-cash loyalty points. They are not money, betting credits, or a withdrawable balance.
        PROVIDER_PENDING wallet credits are sandbox-only — no real value is transferred.
        Wallet services are provided by an external wallet provider. PSL One does not hold customer funds directly.
      </p>

      {loading && <p className="text-gray-500">Loading rewards…</p>}
      {error && <p className="text-red-600 bg-red-50 rounded p-3">{error}</p>}

      <div className="overflow-x-auto">
        <table className="w-full text-sm border rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3 font-medium text-gray-600">Fan</th>
              <th className="text-left p-3 font-medium text-gray-600">Reward</th>
              <th className="text-left p-3 font-medium text-gray-600">Type</th>
              <th className="text-left p-3 font-medium text-gray-600">Status</th>
              <th className="text-left p-3 font-medium text-gray-600">Claimed</th>
              <th className="text-left p-3 font-medium text-gray-600">Redeemed</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rewards.map(r => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="p-3 font-mono text-xs text-gray-500">{r.fanUserId.slice(0, 8)}…</td>
                <td className="p-3">{r.rewardDefinition?.name ?? r.rewardDefinitionId.slice(0, 8)}</td>
                <td className="p-3 text-gray-500 text-xs">{r.rewardDefinition?.rewardType ?? '—'}</td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-0.5 rounded ${STATUS_COLOURS[r.status] ?? 'bg-gray-100 text-gray-600'}`}>{r.status}</span>
                </td>
                <td className="p-3 text-gray-500">{r.claimedAt ? r.claimedAt.slice(0, 10) : '—'}</td>
                <td className="p-3 text-gray-500">{r.redeemedAt ? r.redeemedAt.slice(0, 10) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!loading && rewards.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed rounded-lg text-gray-400 mt-4">
          <p>No fan rewards issued yet</p>
        </div>
      )}
    </div>
  );
}
