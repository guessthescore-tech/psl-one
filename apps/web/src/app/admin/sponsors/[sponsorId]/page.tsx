'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getBetaToken } from '@/lib/auth-client';
import { adminGetSponsor, adminUpdateSponsor } from '@/lib/sponsors-client';
import { adminGetSponsorAnalytics } from '@/lib/campaign-analytics-client';

interface Sponsor {
  id: string;
  name: string;
  slug: string;
  sector: string;
  status: string;
  logoUrl: string | null;
  websiteUrl: string | null;
  primaryContactName: string | null;
  primaryContactEmail: string | null;
  notes: string | null;
  createdAt: string;
}

interface SponsorAnalytics {
  sponsorId: string;
  totalCampaigns: number;
  totalParticipants: number;
  totalRewardsIssued: number;
  totalFanValuePoints: number;
}

export default function AdminSponsorDetailPage() {
  const { sponsorId } = useParams<{ sponsorId: string }>();
  const [sponsor, setSponsor] = useState<Sponsor | null>(null);
  const [analytics, setAnalytics] = useState<SponsorAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = getBetaToken();
    Promise.all([
      adminGetSponsor(token, sponsorId),
      adminGetSponsorAnalytics(token, sponsorId).catch(() => null),
    ]).then(([s, a]) => {
      setSponsor(s);
      setEditStatus(s.status);
      setAnalytics(a);
    }).catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [sponsorId]);

  async function handleStatusUpdate() {
    setSaving(true);
    setError(null);
    try {
      const updated = await adminUpdateSponsor(getBetaToken(), sponsorId, { status: editStatus });
      setSponsor(updated);
    } catch (e: unknown) { setError(String(e)); }
    finally { setSaving(false); }
  }

  if (loading) return <div className="p-6 text-gray-500">Loading…</div>;
  if (!sponsor) return <div className="p-6 text-red-600">{error ?? 'Sponsor not found'}</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-4">
        <Link href="/admin/sponsors" className="text-sm text-gray-500 hover:underline">← Sponsors</Link>
      </div>

      <div className="border rounded-lg p-6 mb-4">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{sponsor.name}</h1>
            <p className="text-gray-500 text-sm font-mono">{sponsor.slug}</p>
          </div>
          <div className="flex gap-2">
            <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded">{sponsor.sector}</span>
            <span className={`text-xs px-2 py-1 rounded ${sponsor.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
              {sponsor.status}
            </span>
          </div>
        </div>

        {error && <p className="text-red-600 bg-red-50 rounded p-3 text-sm mb-4">{error}</p>}

        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div><span className="text-gray-500">Website:</span> <a href={sponsor.websiteUrl ?? '#'} className="text-blue-600 hover:underline">{sponsor.websiteUrl ?? '—'}</a></div>
          <div><span className="text-gray-500">Contact:</span> <strong>{sponsor.primaryContactName ?? '—'}</strong></div>
          <div><span className="text-gray-500">Email:</span> <span>{sponsor.primaryContactEmail ?? '—'}</span></div>
        </div>

        {sponsor.notes && <p className="text-sm text-gray-600 mb-4 bg-gray-50 rounded p-3">{sponsor.notes}</p>}

        <div className="flex items-center gap-3 pt-2 border-t">
          <select className="border rounded px-3 py-1.5 text-sm" value={editStatus} onChange={e => setEditStatus(e.target.value)}>
            {['PROSPECT', 'ACTIVE', 'INACTIVE', 'SUSPENDED'].map(s => <option key={s}>{s}</option>)}
          </select>
          <button onClick={handleStatusUpdate} disabled={saving || editStatus === sponsor.status} className="bg-blue-600 text-white text-sm px-3 py-1.5 rounded hover:bg-blue-700 disabled:opacity-50">
            {saving ? 'Saving…' : 'Update Status'}
          </button>
          <Link href={`/admin/campaigns?sponsorId=${sponsorId}`} className="text-sm text-blue-600 hover:underline">View Campaigns</Link>
        </div>
      </div>

      {analytics && (
        <div className="border rounded-lg p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Analytics Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div><div className="text-2xl font-bold text-gray-900">{analytics.totalCampaigns}</div><div className="text-xs text-gray-500">Campaigns</div></div>
            <div><div className="text-2xl font-bold text-gray-900">{analytics.totalParticipants}</div><div className="text-xs text-gray-500">Participants</div></div>
            <div><div className="text-2xl font-bold text-gray-900">{analytics.totalRewardsIssued}</div><div className="text-xs text-gray-500">Rewards Issued</div></div>
            <div><div className="text-2xl font-bold text-gray-900">{analytics.totalFanValuePoints}</div><div className="text-xs text-gray-500">FV Points Awarded</div></div>
          </div>
          <p className="text-xs text-gray-400 mt-3">Fan Value points are non-cash loyalty points. They are not money, betting credits, or a withdrawable balance.</p>
        </div>
      )}
    </div>
  );
}
