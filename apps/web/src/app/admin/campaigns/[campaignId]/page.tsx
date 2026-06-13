'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getBetaToken } from '@/lib/auth-client';
import {
  adminGetCampaign,
  adminSubmitCampaignForApproval,
  adminApproveCampaign,
  adminPublishCampaign,
  adminPauseCampaign,
  adminResumeCampaign,
  adminCompleteCampaign,
  adminArchiveCampaign,
} from '@/lib/admin-campaigns-client';

interface Campaign {
  id: string;
  name: string;
  slug: string;
  status: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  maxParticipationsPerFan: number;
  createdAt: string;
}

const STATUS_COLOURS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-600',
  PENDING_APPROVAL: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-blue-100 text-blue-700',
  PUBLISHED: 'bg-green-100 text-green-700',
  PAUSED: 'bg-orange-100 text-orange-700',
  COMPLETED: 'bg-purple-100 text-purple-700',
  ARCHIVED: 'bg-gray-100 text-gray-400',
};

export default function AdminCampaignDetailPage() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState(false);

  useEffect(() => {
    adminGetCampaign(getBetaToken(), campaignId)
      .then(setCampaign)
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [campaignId]);

  async function transition(fn: () => Promise<Campaign>) {
    setActing(true);
    setError(null);
    try { setCampaign(await fn()); }
    catch (e: unknown) { setError(String(e)); }
    finally { setActing(false); }
  }

  const token = getBetaToken();

  if (loading) return <div className="p-6 text-gray-500">Loading…</div>;
  if (!campaign) return <div className="p-6 text-red-600">{error ?? 'Campaign not found'}</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-4">
        <Link href="/admin/campaigns" className="text-sm text-gray-500 hover:underline">← Campaigns</Link>
      </div>

      <div className="border rounded-lg p-6 mb-4">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{campaign.name}</h1>
            <p className="text-gray-500 text-sm font-mono">{campaign.slug}</p>
          </div>
          <span className={`text-xs px-2 py-1 rounded font-medium ${STATUS_COLOURS[campaign.status] ?? 'bg-gray-100 text-gray-600'}`}>
            {campaign.status}
          </span>
        </div>

        {error && <p className="text-red-600 bg-red-50 rounded p-3 text-sm mb-4">{error}</p>}

        {campaign.description && <p className="text-sm text-gray-700 mb-4">{campaign.description}</p>}

        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div><span className="text-gray-500">Start:</span> <strong>{campaign.startDate?.slice(0, 10) ?? '—'}</strong></div>
          <div><span className="text-gray-500">End:</span> <strong>{campaign.endDate?.slice(0, 10) ?? '—'}</strong></div>
          <div><span className="text-gray-500">Max participations:</span> <strong>{campaign.maxParticipationsPerFan}</strong></div>
        </div>

        <div className="flex gap-2 flex-wrap border-t pt-4">
          {campaign.status === 'DRAFT' && (
            <button onClick={() => transition(() => adminSubmitCampaignForApproval(token, campaignId))} disabled={acting}
              className="bg-yellow-500 text-white text-sm px-3 py-1.5 rounded hover:bg-yellow-600 disabled:opacity-50">
              Submit for Approval
            </button>
          )}
          {campaign.status === 'PENDING_APPROVAL' && (
            <button onClick={() => transition(() => adminApproveCampaign(token, campaignId))} disabled={acting}
              className="bg-blue-600 text-white text-sm px-3 py-1.5 rounded hover:bg-blue-700 disabled:opacity-50">
              Approve
            </button>
          )}
          {campaign.status === 'APPROVED' && (
            <button onClick={() => transition(() => adminPublishCampaign(token, campaignId))} disabled={acting}
              className="bg-green-600 text-white text-sm px-3 py-1.5 rounded hover:bg-green-700 disabled:opacity-50">
              Publish
            </button>
          )}
          {campaign.status === 'PUBLISHED' && (
            <button onClick={() => transition(() => adminPauseCampaign(token, campaignId))} disabled={acting}
              className="bg-orange-500 text-white text-sm px-3 py-1.5 rounded hover:bg-orange-600 disabled:opacity-50">
              Pause
            </button>
          )}
          {campaign.status === 'PAUSED' && (
            <button onClick={() => transition(() => adminResumeCampaign(token, campaignId))} disabled={acting}
              className="bg-green-600 text-white text-sm px-3 py-1.5 rounded hover:bg-green-700 disabled:opacity-50">
              Resume
            </button>
          )}
          {(campaign.status === 'PUBLISHED' || campaign.status === 'PAUSED') && (
            <button onClick={() => transition(() => adminCompleteCampaign(token, campaignId))} disabled={acting}
              className="bg-purple-600 text-white text-sm px-3 py-1.5 rounded hover:bg-purple-700 disabled:opacity-50">
              Complete
            </button>
          )}
          {campaign.status === 'COMPLETED' && (
            <button onClick={() => transition(() => adminArchiveCampaign(token, campaignId))} disabled={acting}
              className="bg-gray-500 text-white text-sm px-3 py-1.5 rounded hover:bg-gray-600 disabled:opacity-50">
              Archive
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Link href={`/admin/campaigns/${campaignId}/actions`} className="border rounded-lg p-4 text-center hover:bg-gray-50">
          <div className="font-semibold text-gray-900">Actions</div>
          <div className="text-xs text-gray-500 mt-1">Manage campaign actions</div>
        </Link>
        <Link href={`/admin/campaigns/${campaignId}/rewards`} className="border rounded-lg p-4 text-center hover:bg-gray-50">
          <div className="font-semibold text-gray-900">Rewards</div>
          <div className="text-xs text-gray-500 mt-1">Reward definitions</div>
        </Link>
        <Link href={`/admin/campaigns/${campaignId}/analytics`} className="border rounded-lg p-4 text-center hover:bg-gray-50">
          <div className="font-semibold text-gray-900">Analytics</div>
          <div className="text-xs text-gray-500 mt-1">Participation metrics</div>
        </Link>
      </div>
    </div>
  );
}
