'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getBetaToken } from '@/lib/auth-client';
import { adminListRewardDefinitions } from '@/lib/campaign-rewards-client';

interface RewardDefinition {
  id: string;
  name: string;
  rewardType: string;
  pointValue: number | null;
  inventoryLimit: number | null;
  inventoryIssued: number;
  status: string;
  campaignId: string | null;
}

export default function AdminRewardDefinitionsPage() {
  const [definitions, setDefinitions] = useState<RewardDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminListRewardDefinitions(getBetaToken())
      .then((data: { definitions: RewardDefinition[] }) => setDefinitions(data.definitions ?? data))
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reward Definitions</h1>
          <p className="text-gray-500 mt-1">All reward definitions across campaigns</p>
        </div>
        <Link href="/admin/campaigns" className="text-sm text-gray-600 border px-3 py-2 rounded hover:bg-gray-50">
          View Campaigns
        </Link>
      </div>

      <p className="text-xs text-gray-400 mb-4 bg-gray-50 rounded p-3">
        Fan Value points are non-cash loyalty points. They are not money, betting credits, or a withdrawable balance.
        Wallet credit rewards are provider-pending sandbox only. No real value is transferred.
      </p>

      {loading && <p className="text-gray-500">Loading…</p>}
      {error && <p className="text-red-600 bg-red-50 rounded p-3">{error}</p>}

      <div className="border rounded-lg divide-y">
        {definitions.map(d => (
          <div key={d.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-gray-900">{d.name}</span>
                <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded">{d.rewardType}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${d.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{d.status}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {d.pointValue != null ? `${d.pointValue} pts` : '—'}
                {d.inventoryLimit != null ? ` · ${d.inventoryIssued}/${d.inventoryLimit} issued` : ' · unlimited'}
                {d.campaignId ? ` · campaign: ${d.campaignId.slice(0, 8)}…` : ''}
              </p>
            </div>
            {d.campaignId && (
              <Link href={`/admin/campaigns/${d.campaignId}/rewards`} className="text-sm text-blue-600 hover:underline">View Campaign</Link>
            )}
          </div>
        ))}
      </div>

      {!loading && definitions.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed rounded-lg text-gray-400 mt-4">
          <p>No reward definitions yet</p>
          <p className="text-sm mt-1">Add definitions from within a campaign.</p>
        </div>
      )}
    </div>
  );
}
