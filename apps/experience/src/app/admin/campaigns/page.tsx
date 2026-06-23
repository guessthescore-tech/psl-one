'use client';
/**
 * SPONSOR_REWARDS_NON_FINANCIAL - no cash payouts
 * NO_REAL_MONEY
 */

import { PortalShell } from '../../../components/portal/PortalShell';
import { StatusBadge } from '../../../components/portal/PortalStatusBadges';
import { PortalMetricCard } from '../../../components/portal/PortalMetricCard';
import { ADMIN_NAV_ITEMS } from '../../../lib/portal-routes';

const MOCK_CAMPAIGNS = [
  { id: 'cam1', name: 'WC 2026 Fan Activation', sponsor: 'Castle Lager', status: 'ACTIVE', rewards: 'Points + Badge', reach: 12400 },
  { id: 'cam2', name: 'PSL Fan Challenge', sponsor: 'DStv', status: 'PENDING', rewards: 'Digital Badge', reach: 0 },
  { id: 'cam3', name: 'Goal of the Month', sponsor: 'MTN', status: 'DRAFT', rewards: 'Points', reach: 0 },
];

export default function AdminCampaignsPage() {
  return (
    <PortalShell portalName="Admin Portal" navItems={ADMIN_NAV_ITEMS}>
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Campaigns</h1>
          <p className="text-slate-400 text-sm">Sponsor campaigns — all rewards are non-financial (points, badges, digital experiences).</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <PortalMetricCard label="Active" value={1} />
          <PortalMetricCard label="Total Campaigns" value={3} />
          <PortalMetricCard label="Reward Type" value="Non-Financial" description="SPONSOR_REWARDS_NON_FINANCIAL" />
        </div>

        <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 text-sm text-blue-300">
          SPONSOR_REWARDS_NON_FINANCIAL — All campaign rewards are points, badges, or digital experiences. No cash payouts.
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Campaign</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Sponsor</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Rewards</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Reach</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_CAMPAIGNS.map((c) => (
                <tr key={c.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                  <td className="px-4 py-3 text-slate-200 font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-slate-400">{c.sponsor}</td>
                  <td className="px-4 py-3">
                    <StatusBadge label={c.status} variant={c.status === 'ACTIVE' ? 'active' : 'warning'} />
                  </td>
                  <td className="px-4 py-3 text-blue-400 text-xs font-semibold">{c.rewards}</td>
                  <td className="px-4 py-3 text-slate-400 font-mono">{c.reach.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PortalShell>
  );
}
