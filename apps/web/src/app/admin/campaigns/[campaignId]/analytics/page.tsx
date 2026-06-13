'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getBetaToken } from '@/lib/auth-client';
import { adminGetCampaignAnalytics, adminRecalculateCampaignAnalytics } from '@/lib/campaign-analytics-client';

interface CampaignAnalytics {
  campaignId: string;
  totalParticipants: number;
  totalActionCompletions: number;
  totalRewardsIssued: number;
  totalFanValuePoints: number;
  totalMediaViews: number;
  totalMediaCompletions: number;
  participantsByStatus: Record<string, number>;
  actionCompletionsByStatus: Record<string, number>;
  rewardsByType: Record<string, number>;
}

export default function AdminCampaignAnalyticsPage() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const [analytics, setAnalytics] = useState<CampaignAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recalculating, setRecalculating] = useState(false);

  useEffect(() => {
    adminGetCampaignAnalytics(getBetaToken(), campaignId)
      .then(setAnalytics)
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [campaignId]);

  async function handleRecalculate() {
    setRecalculating(true);
    setError(null);
    try {
      const res = await adminRecalculateCampaignAnalytics(getBetaToken(), campaignId);
      setAnalytics(res.analytics ?? res);
    } catch (e: unknown) { setError(String(e)); }
    finally { setRecalculating(false); }
  }

  if (loading) return <div className="p-6 text-gray-500">Loading…</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-4">
        <Link href={`/admin/campaigns/${campaignId}`} className="text-sm text-gray-500 hover:underline">← Campaign</Link>
      </div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">Campaign Analytics</h1>
        <button onClick={handleRecalculate} disabled={recalculating} className="text-sm bg-gray-100 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-200 disabled:opacity-50">
          {recalculating ? 'Recalculating…' : 'Recalculate'}
        </button>
      </div>

      {error && <p className="text-red-600 bg-red-50 rounded p-3 mb-4">{error}</p>}

      {analytics ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Participants', value: analytics.totalParticipants },
              { label: 'Action Completions', value: analytics.totalActionCompletions },
              { label: 'Rewards Issued', value: analytics.totalRewardsIssued },
              { label: 'FV Points Awarded', value: analytics.totalFanValuePoints },
              { label: 'Media Views', value: analytics.totalMediaViews },
              { label: 'Media Completions', value: analytics.totalMediaCompletions },
            ].map(({ label, value }) => (
              <div key={label} className="border rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">{value}</div>
                <div className="text-xs text-gray-500 mt-1">{label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h2 className="font-semibold text-gray-900 mb-3 text-sm">Participants by Status</h2>
              <div className="space-y-1">
                {Object.entries(analytics.participantsByStatus).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm">
                    <span className="text-gray-600">{k}</span><span className="font-medium">{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <h2 className="font-semibold text-gray-900 mb-3 text-sm">Rewards by Type</h2>
              <div className="space-y-1">
                {Object.entries(analytics.rewardsByType).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm">
                    <span className="text-gray-600">{k}</span><span className="font-medium">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-400 mt-4">Analytics are aggregate-only. No individual fan data is exposed. Fan Value points are non-cash loyalty points.</p>
        </>
      ) : (
        <div className="text-center py-12 border-2 border-dashed rounded-lg text-gray-400">
          <p>No analytics data yet</p>
          <button onClick={handleRecalculate} className="mt-2 text-blue-600 text-sm hover:underline">Run first calculation</button>
        </div>
      )}
    </div>
  );
}
