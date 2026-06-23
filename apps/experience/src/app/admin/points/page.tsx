'use client';
/**
 * FANTASY_POINTS_ONLY - no real-money fantasy
 * GTS_POINTS_ONLY - no real-money guess the score
 * NO_REAL_MONEY
 */

import Link from 'next/link';
import { PortalShell } from '../../../components/portal/PortalShell';
import { PortalMetricCard } from '../../../components/portal/PortalMetricCard';
import { ADMIN_NAV_ITEMS, ADMIN_ROUTES } from '../../../lib/portal-routes';

export default function AdminPointsPage() {
  return (
    <PortalShell portalName="Admin Portal" navItems={ADMIN_NAV_ITEMS}>
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Points Overview</h1>
          <p className="text-slate-400 text-sm">
            All points systems are points-only. No real money. No gambling.
          </p>
        </div>

        <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4 text-sm text-purple-300">
          Points only — GTS awards PSL points. Fantasy awards PSL points. Sponsor rewards are non-financial.
          No real money. No financial value attached to any points system.
        </div>

        <div className="grid grid-cols-2 gap-4">
          <PortalMetricCard
            label="GTS Points System"
            value="Points Only"
            description="5 pts exact score, 2 pts correct result, 3 pts goal diff"
          />
          <PortalMetricCard
            label="Fantasy Points System"
            value="Points Only"
            description="Goals, assists, clean sheets, captain multiplier"
          />
          <PortalMetricCard
            label="Streak Bonus"
            value="Active"
            trend="up"
            trendLabel="1.5× multiplier"
          />
          <PortalMetricCard
            label="Captain Multiplier"
            value="2×"
            description="Fantasy captain point multiplier"
          />
        </div>

        <div className="flex gap-3">
          <Link
            href={ADMIN_ROUTES.RULES_GTS}
            className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl text-center transition-colors"
          >
            GTS Rules →
          </Link>
          <Link
            href={ADMIN_ROUTES.RULES_FANTASY}
            className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl text-center transition-colors"
          >
            Fantasy Rules →
          </Link>
          <Link
            href={ADMIN_ROUTES.POINTS_SIMULATION}
            className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl text-center transition-colors"
          >
            Simulation →
          </Link>
        </div>
      </div>
    </PortalShell>
  );
}
