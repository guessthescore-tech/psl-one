'use client';
/**
 * PSL_INACTIVE - do not activate PSL season. Club portal does not expose league activation.
 * NO_REAL_MONEY
 * SPONSOR_REWARDS_NON_FINANCIAL - no cash payouts
 */

import { PortalShell } from '../../../components/portal/PortalShell';
import { StatusBadge } from '../../../components/portal/PortalStatusBadges';
import { PortalMetricCard } from '../../../components/portal/PortalMetricCard';
import { CLUB_NAV_ITEMS } from '../../../lib/portal-routes';

// Club portal does not expose league activation controls.
// PSL season activation is an admin-only operation.

export default function ClubOverviewPage() {
  return (
    <PortalShell portalName="Club Portal" navItems={CLUB_NAV_ITEMS}>
      <div className="max-w-4xl space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Club Overview</h1>
            <p className="text-slate-400 text-sm">Manage your club's presence, squad, and fan engagement on PSL One.</p>
          </div>
          <StatusBadge label="PSL INACTIVE" variant="inactive" />
        </div>

        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4 text-sm text-yellow-300">
          PSL season is currently inactive. Club features are in beta mode. World Cup 2026 is the active competition context.
          The club portal does not expose league activation controls — those are admin-only.
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <PortalMetricCard label="Squad Size" value="—" description="Pending PSL activation" />
          <PortalMetricCard label="Registered Fans" value="—" description="Live count via API" />
          <PortalMetricCard label="Active Campaigns" value={0} />
          <PortalMetricCard label="Points System" value="Non-Financial" description="Rewards are non-financial only" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-slate-200 mb-3">Quick Actions</h2>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2"><span className="text-green-400">→</span> View squad</li>
              <li className="flex items-center gap-2"><span className="text-green-400">→</span> Manage content</li>
              <li className="flex items-center gap-2"><span className="text-green-400">→</span> View fan analytics</li>
              <li className="flex items-center gap-2"><span className="text-green-400">→</span> Manage campaigns</li>
            </ul>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-slate-200 mb-3">Platform Status</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Season</span>
                <StatusBadge label="INACTIVE" variant="inactive" />
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
        </div>
      </div>
    </PortalShell>
  );
}
