'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getBetaToken } from '@/lib/auth-client';
import { getPublicCampaign, startCampaignParticipation, completeCampaignAction, getCampaignProgress } from '@/lib/campaigns-client';

interface CampaignAction {
  id: string;
  actionType: string;
  label: string;
  pointValue: number;
  isRequired: boolean;
  sortOrder: number;
}

interface Campaign {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  maxParticipationsPerFan: number;
  campaignActions: CampaignAction[];
}

interface Progress {
  participationId: string | null;
  status: string | null;
  completedActions: string[];
}

export default function CampaignDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState(false);

  const token = getBetaToken();

  useEffect(() => {
    const fetch = async () => {
      const c = await getPublicCampaign(token, slug);
      setCampaign(c);
      try {
        const p = await getCampaignProgress(token, c.id);
        setProgress(p);
      } catch {
        setProgress({ participationId: null, status: null, completedActions: [] });
      }
    };
    fetch().catch((e: unknown) => setError(String(e))).finally(() => setLoading(false));
  }, [slug, token]);

  async function handleJoin() {
    if (!campaign) return;
    setActing(true);
    setError(null);
    try {
      const p = await startCampaignParticipation(token, campaign.id);
      setProgress({ participationId: p.id, status: p.status, completedActions: [] });
    } catch (e: unknown) { setError(String(e)); }
    finally { setActing(false); }
  }

  async function handleCompleteAction(actionId: string) {
    if (!campaign) return;
    setActing(true);
    setError(null);
    try {
      const key = `action-${actionId}-${Date.now()}`;
      await completeCampaignAction(token, campaign.id, actionId, { idempotencyKey: key });
      setProgress(p => p ? { ...p, completedActions: [...(p.completedActions ?? []), actionId] } : p);
    } catch (e: unknown) { setError(String(e)); }
    finally { setActing(false); }
  }

  if (loading) return <div className="p-6 text-gray-500">Loading…</div>;
  if (!campaign) return <div className="p-6 text-red-600">{error ?? 'Campaign not found'}</div>;

  const isParticipating = !!progress?.participationId;
  const sortedActions = [...(campaign.campaignActions ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-4">
        <Link href="/campaigns" className="text-sm text-gray-500 hover:underline">← Campaigns</Link>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">{campaign.name}</h1>
      {campaign.description && <p className="text-gray-600 mb-4">{campaign.description}</p>}

      <p className="text-xs text-gray-400 mb-4">
        Fan Value points are non-cash loyalty points. They are not money, betting credits, or a withdrawable balance.
      </p>

      {error && <p className="text-red-600 bg-red-50 rounded p-3 mb-4">{error}</p>}

      {!isParticipating ? (
        <button onClick={handleJoin} disabled={acting} className="bg-indigo-600 text-white px-5 py-2 rounded hover:bg-indigo-700 disabled:opacity-50 mb-6">
          {acting ? 'Joining…' : 'Join Campaign'}
        </button>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded p-3 mb-6 text-sm text-green-700">
          You are participating · Status: {progress?.status ?? 'ACTIVE'}
        </div>
      )}

      <h2 className="font-semibold text-gray-900 mb-3">Actions</h2>
      <div className="space-y-3">
        {sortedActions.map(a => {
          const done = progress?.completedActions?.includes(a.id);
          return (
            <div key={a.id} className={`border rounded-lg p-4 flex items-center justify-between ${done ? 'bg-green-50 border-green-200' : ''}`}>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{a.label}</span>
                  {a.isRequired && <span className="text-xs text-red-500">Required</span>}
                  {a.pointValue > 0 && <span className="text-xs text-indigo-600 font-medium">+{a.pointValue} FV pts</span>}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{a.actionType}</p>
                {(a.actionType === 'SCAN_QR' || a.actionType === 'SHARE_CONTENT') && !done && (
                  <p className="text-xs text-gray-400">This action requires manual review.</p>
                )}
              </div>
              {isParticipating && !done && (
                <button onClick={() => handleCompleteAction(a.id)} disabled={acting} className="text-sm bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700 disabled:opacity-50">
                  Complete
                </button>
              )}
              {done && <span className="text-green-600 text-sm font-medium">Done</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
