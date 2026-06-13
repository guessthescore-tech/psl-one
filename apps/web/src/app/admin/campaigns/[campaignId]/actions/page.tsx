'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getBetaToken } from '@/lib/auth-client';
import { adminGetCampaign, adminAddCampaignAction } from '@/lib/admin-campaigns-client';

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
  status: string;
  campaignActions: CampaignAction[];
}

const ACTION_TYPES = ['CLICK_CTA', 'WATCH_VIDEO', 'COMPLETE_QUIZ', 'SCAN_QR', 'SHARE_CONTENT', 'VISIT_STORE', 'FILL_FORM'];

export default function AdminCampaignActionsPage() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ actionType: 'CLICK_CTA', label: '', pointValue: '10', isRequired: 'true', sortOrder: '1' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminGetCampaign(getBetaToken(), campaignId)
      .then(setCampaign)
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [campaignId]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const updated = await adminAddCampaignAction(getBetaToken(), campaignId, {
        ...form,
        pointValue: Number(form.pointValue),
        isRequired: form.isRequired === 'true',
        sortOrder: Number(form.sortOrder),
      });
      setCampaign(updated);
    } catch (err: unknown) { setError(String(err)); }
    finally { setSaving(false); }
  }

  if (loading) return <div className="p-6 text-gray-500">Loading…</div>;
  if (!campaign) return <div className="p-6 text-red-600">{error ?? 'Campaign not found'}</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-4">
        <Link href={`/admin/campaigns/${campaignId}`} className="text-sm text-gray-500 hover:underline">← {campaign.name}</Link>
      </div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">Campaign Actions</h1>

      {error && <p className="text-red-600 bg-red-50 rounded p-3 mb-4">{error}</p>}

      <div className="border rounded-lg divide-y mb-6">
        {(campaign.campaignActions ?? []).map(a => (
          <div key={a.id} className="p-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{a.label}</span>
                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded">{a.actionType}</span>
                {a.isRequired && <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded">Required</span>}
              </div>
              <p className="text-xs text-gray-400 mt-1">{a.pointValue} pts · order {a.sortOrder}</p>
            </div>
          </div>
        ))}
        {(campaign.campaignActions ?? []).length === 0 && (
          <div className="p-8 text-center text-gray-400 text-sm">No actions yet</div>
        )}
      </div>

      {campaign.status === 'DRAFT' && (
        <div className="border rounded-lg p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Add Action</h2>
          <form onSubmit={handleAdd} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Action Type</label>
                <select className="w-full border rounded px-3 py-2 text-sm" value={form.actionType} onChange={e => setForm(f => ({ ...f, actionType: e.target.value }))}>
                  {ACTION_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Label *</label>
                <input className="w-full border rounded px-3 py-2 text-sm" value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Point Value</label>
                <input type="number" min={0} className="w-full border rounded px-3 py-2 text-sm" value={form.pointValue} onChange={e => setForm(f => ({ ...f, pointValue: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Sort Order</label>
                <input type="number" min={1} className="w-full border rounded px-3 py-2 text-sm" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: e.target.value }))} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isRequired" checked={form.isRequired === 'true'} onChange={e => setForm(f => ({ ...f, isRequired: String(e.target.checked) }))} />
              <label htmlFor="isRequired" className="text-sm text-gray-700">Required action</label>
            </div>
            <p className="text-xs text-gray-400">SCAN_QR and SHARE_CONTENT actions route to MANUAL_REVIEW status.</p>
            <button type="submit" disabled={saving} className="bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Adding…' : 'Add Action'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
