'use client';
/**
 * SPONSOR_REWARDS_NON_FINANCIAL - no cash payouts
 * NO_REAL_MONEY
 */

import Link from 'next/link';
import { PortalShell } from '../../../components/portal/PortalShell';
import { StatusBadge } from '../../../components/portal/PortalStatusBadges';
import { SPONSOR_NAV_ITEMS, SPONSOR_ROUTES } from '../../../lib/portal-routes';

const MOCK_CAMPAIGNS = [
  { id: 'c1', name: 'WC 2026 Fan Activation', status: 'active', start: '2026-06-15', end: '2026-07-19', impressions: 12400, rewards: 'Points + Badge' },
  { id: 'c2', name: 'PSL Season Opener', status: 'draft', start: '—', end: '—', impressions: 0, rewards: 'Digital Badge' },
];

export default function SponsorCampaignsPage() {
  return (
    <PortalShell portalName="Sponsor Portal" navItems={SPONSOR_NAV_ITEMS}>
      <div className="max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Campaigns</h1>
            <p className="text-slate-400 text-sm">All sponsor campaigns. Rewards are non-financial — points, badges, digital experiences only.</p>
          </div>
          <Link
            href={SPONSOR_ROUTES.CAMPAIGNS_NEW}
            className="px-4 py-2 text-sm font-semibold bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors min-h-[44px] flex items-center"
          >
            + New Campaign
          </Link>
        </div>

        <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-3 text-sm text-blue-300">
          SPONSOR_REWARDS_NON_FINANCIAL — All campaign rewards are non-financial. No cash payouts.
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Campaign</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Period</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Impressions</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Rewards</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_CAMPAIGNS.map((c) => (
                <tr key={c.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                  <td className="px-4 py-3 text-slate-200 font-medium">{c.name}</td>
                  <td className="px-4 py-3">
                    <StatusBadge label={c.status} variant={c.status === 'active' ? 'active' : 'warning'} />
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{c.start} → {c.end}</td>
                  <td className="px-4 py-3 text-slate-300 font-mono">{c.impressions.toLocaleString()}</td>
                  <td className="px-4 py-3 text-blue-400 text-xs font-semibold">{c.rewards}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PortalShell>
  );
}
