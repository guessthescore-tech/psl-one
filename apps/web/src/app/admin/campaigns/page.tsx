'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getBetaToken } from '@/lib/auth-client';
import { adminListCampaigns } from '@/lib/admin-campaigns-client';

interface Campaign {
  id: string;
  name: string;
  slug: string;
  status: string;
  sponsorId: string | null;
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

function AdminCampaignsInner() {
  const searchParams = useSearchParams();
  const sponsorId = searchParams.get('sponsorId') ?? undefined;
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminListCampaigns(getBetaToken(), ...(sponsorId ? [{ sponsorId }] : []))
      .then((data: { campaigns: Campaign[] }) => setCampaigns(data.campaigns ?? data))
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [sponsorId]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
          <p className="text-gray-500 mt-1">Manage sponsor campaign lifecycle — DRAFT through ARCHIVED</p>
        </div>
        <Link href="/admin/campaigns/new" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-medium">
          + New Campaign
        </Link>
      </div>

      {loading && <p className="text-gray-500">Loading campaigns…</p>}
      {error && <p className="text-red-600 bg-red-50 rounded p-3">{error}</p>}

      <div className="grid gap-3">
        {campaigns.map(c => (
          <div key={c.id} className="border rounded-lg p-4 flex items-center justify-between hover:bg-gray-50">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-gray-900">{c.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${STATUS_COLOURS[c.status] ?? 'bg-gray-100 text-gray-600'}`}>{c.status}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {c.slug}
                {c.startDate ? ` · ${c.startDate.slice(0, 10)}` : ''}
                {c.endDate ? ` → ${c.endDate.slice(0, 10)}` : ''}
              </p>
            </div>
            <div className="flex gap-2">
              <Link href={`/admin/campaigns/${c.id}/analytics`} className="text-sm bg-gray-100 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-200">
                Analytics
              </Link>
              <Link href={`/admin/campaigns/${c.id}`} className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700">
                Manage
              </Link>
            </div>
          </div>
        ))}
      </div>

      {!loading && campaigns.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed rounded-lg text-gray-400 mt-4">
          <p>No campaigns found</p>
          <Link href="/admin/campaigns/new" className="mt-2 inline-block text-blue-600 text-sm hover:underline">Create first campaign</Link>
        </div>
      )}
    </div>
  );
}

export default function AdminCampaignsPage() {
  return (
    <Suspense fallback={<p className="p-4 text-sm text-gray-400">Loading…</p>}>
      <AdminCampaignsInner />
    </Suspense>
  );
}
