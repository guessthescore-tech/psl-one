'use client';
/**
 * PSL_INACTIVE - do not activate PSL season
 * NO_REAL_MONEY
 */

import { PortalShell } from '../../../components/portal/PortalShell';
import { PortalMetricCard } from '../../../components/portal/PortalMetricCard';
import { CLUB_NAV_ITEMS } from '../../../lib/portal-routes';

export default function ClubAnalyticsPage() {
  return (
    <PortalShell portalName="Club Portal" navItems={CLUB_NAV_ITEMS}>
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Analytics</h1>
          <p className="text-slate-400 text-sm">Fan engagement and performance analytics for your club.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <PortalMetricCard label="Total Fans" value="—" description="Live count via API" />
          <PortalMetricCard label="Predictions" value="—" description="GTS entries" />
          <PortalMetricCard label="Fantasy Picks" value="—" description="Players picked" />
          <PortalMetricCard label="Avg Engagement" value="—" description="This week" />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <p className="text-sm text-slate-400 text-center py-8">
            Analytics data will populate once the PSL season is activated and fan activity begins.
            PSL remains inactive — WC 2026 is the active beta context.
          </p>
        </div>
      </div>
    </PortalShell>
  );
}
