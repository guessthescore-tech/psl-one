'use client';
/**
 * SPONSOR_REWARDS_NON_FINANCIAL - no cash payouts. Sponsor rewards are
 *   points, badges, and digital experiences only. No cash payouts.
 * PSL_INACTIVE - do not activate PSL season
 * WALLET_SANDBOX_ONLY - no production wallet
 * NO_REAL_MONEY
 */

import { PortalShell } from '../../../components/portal/PortalShell';
import { StatusBadge } from '../../../components/portal/PortalStatusBadges';
import { PortalMetricCard } from '../../../components/portal/PortalMetricCard';
import { SPONSOR_NAV_ITEMS } from '../../../lib/portal-routes';

export default function SponsorOverviewPage() {
  return (
    <PortalShell portalName="Sponsor Portal" navItems={SPONSOR_NAV_ITEMS}>
      <div className="max-w-4xl space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Sponsor Overview</h1>
            <p className="text-slate-400 text-sm">
              Campaign performance, audience reach, and fan engagement for your sponsorship on PSL One.
            </p>
          </div>
          <StatusBadge label="NON-FINANCIAL REWARDS" variant="info" />
        </div>

        <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
          <p className="text-sm font-semibold text-blue-300 mb-1">SPONSOR_REWARDS_NON_FINANCIAL</p>
          <p className="text-sm text-slate-400">
            All sponsor rewards on PSL One are non-financial: points, badges, and digital experiences only.
            No cash payouts. No prize money. No gambling or wagering.
            Wallet remains sandbox-only. PSL season inactive — WC 2026 is the active beta context.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <PortalMetricCard label="Active Campaigns" value={1} trend="up" trendLabel="1 live" />
          <PortalMetricCard label="Total Impressions" value="12.4K" description="Beta context" />
          <PortalMetricCard label="Engagements" value="3.2K" trend="up" trendLabel="+12% this week" />
          <PortalMetricCard label="Reward Type" value="Non-Financial" description="Points & badges only" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-slate-200 mb-3">Platform Status</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">PSL Season</span>
                <StatusBadge label="INACTIVE" variant="inactive" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Active Context</span>
                <StatusBadge label="WC 2026" variant="active" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Wallet</span>
                <StatusBadge label="SANDBOX" variant="sandbox" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Rewards</span>
                <StatusBadge label="NON-FINANCIAL" variant="info" />
              </div>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-slate-200 mb-3">Quick Actions</h2>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2"><span className="text-blue-400">→</span> Launch new campaign</li>
              <li className="flex items-center gap-2"><span className="text-blue-400">→</span> View audience insights</li>
              <li className="flex items-center gap-2"><span className="text-blue-400">→</span> Manage activations</li>
              <li className="flex items-center gap-2"><span className="text-blue-400">→</span> Download analytics</li>
            </ul>
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
