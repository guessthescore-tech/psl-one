'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getBetaToken } from '@/lib/auth-client';
import { listPublicCampaigns } from '@/lib/campaigns-client';

interface Campaign {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  campaignActions: { id: string; actionType: string; label: string; pointValue: number }[];
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listPublicCampaigns(getBetaToken())
      .then((data: { campaigns: Campaign[] }) => setCampaigns(data.campaigns ?? data))
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Fan Campaigns</h1>
        <p className="text-gray-500 mt-1">Participate in sponsor campaigns and earn Fan Value points</p>
        <p className="text-xs text-gray-400 mt-1">Fan Value points are non-cash loyalty points. They are not money, betting credits, or a withdrawable balance.</p>
      </div>

      {loading && <p className="text-gray-500">Loading campaigns…</p>}
      {error && <p className="text-red-600 bg-red-50 rounded p-3">{error}</p>}

      <div className="grid gap-4">
        {campaigns.map(c => {
          const totalPoints = c.campaignActions.reduce((s, a) => s + (a.pointValue ?? 0), 0);
          return (
            <Link key={c.id} href={`/campaigns/${c.slug}`} className="border rounded-lg p-5 hover:shadow-md transition-shadow block">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h2 className="font-semibold text-gray-900">{c.name}</h2>
                  {c.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{c.description}</p>}
                  <p className="text-xs text-gray-400 mt-2">
                    {c.campaignActions.length} action{c.campaignActions.length !== 1 ? 's' : ''}
                    {c.endDate ? ` · Ends ${c.endDate.slice(0, 10)}` : ''}
                  </p>
                </div>
                {totalPoints > 0 && (
                  <div className="text-right">
                    <div className="text-lg font-bold text-indigo-600">{totalPoints}</div>
                    <div className="text-xs text-gray-400">FV pts</div>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {!loading && campaigns.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed rounded-lg text-gray-400">
          <p>No active campaigns right now</p>
          <p className="text-sm mt-1">Check back soon for upcoming sponsor campaigns.</p>
        </div>
      )}
    </div>
  );
}
