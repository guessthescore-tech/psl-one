'use client';
/**
 * SPONSOR_REWARDS_NON_FINANCIAL - no cash payouts. Campaign rewards must
 *   be non-financial: points, badges, or digital experiences only.
 * NO_REAL_MONEY
 */

import { useState } from 'react';
import { PortalShell } from '../../../../components/portal/PortalShell';
import { SPONSOR_NAV_ITEMS } from '../../../../lib/portal-routes';

const REWARD_OPTIONS = [
  { id: 'points', label: 'Points Bonus (PSL Points — no financial value)', safe: true },
  { id: 'badge', label: 'Digital Badge', safe: true },
  { id: 'experience', label: 'Digital Experience', safe: true },
];

export default function SponsorCampaignNewPage() {
  const [name, setName] = useState('');
  const [selectedRewards, setSelectedRewards] = useState<string[]>([]);

  function toggleReward(id: string) {
    setSelectedRewards((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  }

  return (
    <PortalShell portalName="Sponsor Portal" navItems={SPONSOR_NAV_ITEMS}>
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">New Campaign</h1>
          <p className="text-slate-400 text-sm">Create a sponsor campaign. All rewards must be non-financial.</p>
        </div>

        <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 text-sm text-blue-300">
          SPONSOR_REWARDS_NON_FINANCIAL — You may only offer points, badges, or digital experiences as rewards.
          Cash payouts, prize money, or vouchers are not permitted.
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
          <div>
            <label htmlFor="camp-name" className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Campaign Name</label>
            <input
              id="camp-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. WC 2026 Fan Activation"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-slate-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Start Date</label>
            <input type="date" className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-slate-500 text-sm" aria-label="Start date" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">End Date</label>
            <input type="date" className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-slate-500 text-sm" aria-label="End date" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
              Rewards (Non-Financial Only)
            </label>
            <div className="space-y-2">
              {REWARD_OPTIONS.map((reward) => (
                <label key={reward.id} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedRewards.includes(reward.id)}
                    onChange={() => toggleReward(reward.id)}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500"
                  />
                  <span className="text-sm text-slate-300">{reward.label}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors min-h-[44px]"
          >
            Create Campaign (Requires SPONSOR_ADMIN)
          </button>
        </div>
      </div>
    </PortalShell>
  );
}
