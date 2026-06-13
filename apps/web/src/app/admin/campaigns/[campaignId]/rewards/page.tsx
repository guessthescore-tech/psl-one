'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getBetaToken } from '@/lib/auth-client';
import { adminListRewardDefinitions, adminCreateRewardDefinition } from '@/lib/campaign-rewards-client';

interface RewardDefinition {
  id: string;
  name: string;
  rewardType: string;
  pointValue: number | null;
  inventoryLimit: number | null;
  inventoryIssued: number;
  status: string;
}

const REWARD_TYPES = ['FAN_VALUE_POINTS', 'DIGITAL_VOUCHER', 'PHYSICAL_PRIZE', 'WALLET_CREDIT_PENDING_PROVIDER', 'EXPERIENCE'];

export default function AdminCampaignRewardsPage() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const [definitions, setDefinitions] = useState<RewardDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', rewardType: 'FAN_VALUE_POINTS', pointValue: '50', inventoryLimit: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminListRewardDefinitions(getBetaToken())
      .then((data: { definitions: RewardDefinition[] }) => {
        const all = data.definitions ?? data;
        setDefinitions(all.filter((d: RewardDefinition & { campaignId?: string }) => !d.campaignId || d.campaignId === campaignId));
      })
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [campaignId]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await adminCreateRewardDefinition(getBetaToken(), {
        name: form.name,
        rewardType: form.rewardType,
        pointValue: form.pointValue ? Number(form.pointValue) : undefined,
        inventoryLimit: form.inventoryLimit ? Number(form.inventoryLimit) : undefined,
        campaignId,
      });
      setDefinitions(d => [...d, res]);
      setForm({ name: '', rewardType: 'FAN_VALUE_POINTS', pointValue: '50', inventoryLimit: '' });
    } catch (err: unknown) { setError(String(err)); }
    finally { setSaving(false); }
  }

  if (loading) return <div className="p-6 text-gray-500">Loading…</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-4">
        <Link href={`/admin/campaigns/${campaignId}`} className="text-sm text-gray-500 hover:underline">← Campaign</Link>
      </div>
      <h1 className="text-xl font-bold text-gray-900 mb-2">Reward Definitions</h1>
      <p className="text-xs text-gray-400 mb-4">Fan Value points are non-cash loyalty points. They are not money, betting credits, or a withdrawable balance.</p>

      {error && <p className="text-red-600 bg-red-50 rounded p-3 mb-4">{error}</p>}

      <div className="border rounded-lg divide-y mb-6">
        {definitions.map(d => (
          <div key={d.id} className="p-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{d.name}</span>
                <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded">{d.rewardType}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${d.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{d.status}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {d.pointValue != null ? `${d.pointValue} pts` : '—'}
                {d.inventoryLimit != null ? ` · ${d.inventoryIssued}/${d.inventoryLimit} issued` : ' · unlimited'}
              </p>
            </div>
          </div>
        ))}
        {definitions.length === 0 && (
          <div className="p-8 text-center text-gray-400 text-sm">No reward definitions yet</div>
        )}
      </div>

      <div className="border rounded-lg p-5">
        <h2 className="font-semibold text-gray-900 mb-3">Add Reward Definition</h2>
        <form onSubmit={handleAdd} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Name *</label>
            <input className="w-full border rounded px-3 py-2 text-sm" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Reward Type</label>
              <select className="w-full border rounded px-3 py-2 text-sm" value={form.rewardType} onChange={e => setForm(f => ({ ...f, rewardType: e.target.value }))}>
                {REWARD_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Point Value</label>
              <input type="number" min={0} className="w-full border rounded px-3 py-2 text-sm" value={form.pointValue} onChange={e => setForm(f => ({ ...f, pointValue: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Inventory Limit (blank = unlimited)</label>
            <input type="number" min={1} className="w-full border rounded px-3 py-2 text-sm" value={form.inventoryLimit} onChange={e => setForm(f => ({ ...f, inventoryLimit: e.target.value }))} />
          </div>
          {form.rewardType === 'WALLET_CREDIT_PENDING_PROVIDER' && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
              Wallet credit rewards are provider-pending. No real value is transferred. Wallet integration operates in sandbox mode only.
            </p>
          )}
          <button type="submit" disabled={saving} className="bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
            {saving ? 'Adding…' : 'Add Definition'}
          </button>
        </form>
      </div>
    </div>
  );
}
