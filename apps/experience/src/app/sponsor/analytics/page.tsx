'use client';
/**
 * SPONSOR_REWARDS_NON_FINANCIAL - no cash payouts
 * NO_REAL_MONEY
 */

import { PortalShell } from '../../../components/portal/PortalShell';
import { PortalMetricCard } from '../../../components/portal/PortalMetricCard';
import { SPONSOR_NAV_ITEMS } from '../../../lib/portal-routes';

export default function SponsorAnalyticsPage() {
  return (
    <PortalShell portalName="Sponsor Portal" navItems={SPONSOR_NAV_ITEMS}>
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Analytics</h1>
          <p className="text-slate-400 text-sm">Campaign performance and audience engagement insights.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <PortalMetricCard label="Total Impressions" value="12.4K" trend="up" trendLabel="+8% this week" />
          <PortalMetricCard label="Engagements" value="3.2K" trend="up" trendLabel="+12% this week" />
          <PortalMetricCard label="Engagement Rate" value="25.8%" trend="up" trendLabel="vs 20% avg" />
          <PortalMetricCard label="Activations" value={3} description="Campaign triggers fired" />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-slate-200 mb-4">Campaign Performance (Beta Context — WC 2026)</h2>
          <div className="space-y-3">
            {[
              { label: 'WC 2026 Fan Activation', pct: 78 },
              { label: 'Prediction Streak Campaign', pct: 45 },
              { label: 'Fantasy Points Drive', pct: 62 },
            ].map((c) => (
              <div key={c.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">{c.label}</span>
                  <span className="text-slate-400">{c.pct}%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${c.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-slate-600">
          All engagement metrics reflect beta activity. SPONSOR_REWARDS_NON_FINANCIAL — no cash return-on-investment metrics.
        </p>
      </div>
    </PortalShell>
  );
}
