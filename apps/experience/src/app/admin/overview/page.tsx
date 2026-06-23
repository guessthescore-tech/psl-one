'use client';
/**
 * PSL_INACTIVE - do not activate PSL season
 * WALLET_SANDBOX_ONLY - no production wallet
 * FANTASY_POINTS_ONLY - no real-money fantasy
 * GTS_POINTS_ONLY - no real-money guess the score
 * SPONSOR_REWARDS_NON_FINANCIAL - no cash payouts
 * NO_PRODUCTION_INGESTION
 * NO_SCHEDULED_INGESTION
 * NO_REAL_MONEY
 *
 * Admin Overview — platform status, constraints, and open owner gates.
 * PSL remains inactive. World Cup 2026 is the active beta context.
 */

import { PortalShell } from '../../../components/portal/PortalShell';
import { PortalStatusBadges, StatusBadge } from '../../../components/portal/PortalStatusBadges';
import { PortalMetricCard } from '../../../components/portal/PortalMetricCard';
import { ADMIN_NAV_ITEMS } from '../../../lib/portal-routes';

const OPEN_OWNER_GATES = [
  'PSL 2024/25 season activation — PENDING owner authorisation',
  'Wallet production activation — PENDING owner authorisation',
  'Live data provider key (API-Football PSL) — PENDING owner supply',
  'EC2 staging re-deployment after RBAC fix — CONDITIONAL_GO',
  'Parse.bot API key for PSL fixture ingestion — PENDING owner supply',
];

const PLATFORM_CHECKS = [
  { label: 'PSL Season',        value: 'INACTIVE',      variant: 'inactive' as const },
  { label: 'World Cup 2026',    value: 'ACTIVE (Beta)',  variant: 'active' as const },
  { label: 'Wallet',            value: 'SANDBOX',        variant: 'sandbox' as const },
  { label: 'Ingestion Source',  value: 'SOURCE_EMPTY',   variant: 'warning' as const },
  { label: 'Provider Health',   value: 'NoOpAdapter',    variant: 'info' as const },
  { label: 'RBAC Guards',       value: '36 tests PASS',  variant: 'active' as const },
];

export default function AdminOverviewPage() {
  return (
    <PortalShell portalName="Admin Portal" navItems={ADMIN_NAV_ITEMS}>
      <div className="max-w-5xl space-y-8">

        {/* Page heading */}
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Platform Overview</h1>
          <p className="text-slate-400 text-sm">
            League operations command centre for PSL One. All actions require PSL_ADMIN role.
          </p>
        </div>

        {/* Status badges */}
        <section aria-label="Platform status indicators">
          <PortalStatusBadges />
        </section>

        {/* Platform checks grid */}
        <section aria-labelledby="platform-checks-heading">
          <h2 id="platform-checks-heading" className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
            Platform Status
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {PLATFORM_CHECKS.map((check) => (
              <div key={check.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">{check.label}</p>
                <StatusBadge label={check.value} variant={check.variant} />
              </div>
            ))}
          </div>
        </section>

        {/* Metrics */}
        <section aria-labelledby="metrics-heading">
          <h2 id="metrics-heading" className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
            Points Systems (Points Only — No Real Money)
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <PortalMetricCard
              label="GTS Points Only"
              value="Points"
              description="Guess the Score — no financial value"
            />
            <PortalMetricCard
              label="Fantasy Points Only"
              value="Points"
              description="Fantasy football — no real-money"
            />
            <PortalMetricCard
              label="Wallet Mode"
              value="Sandbox"
              description="SiliconEnterprise sandbox adapter"
            />
            <PortalMetricCard
              label="Sponsor Rewards"
              value="Non-Financial"
              description="Points, badges, digital experiences only"
            />
          </div>
        </section>

        {/* Open owner gates */}
        <section aria-labelledby="owner-gates-heading">
          <h2 id="owner-gates-heading" className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
            Open Owner Gates ({OPEN_OWNER_GATES.length})
          </h2>
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            {OPEN_OWNER_GATES.map((gate, i) => (
              <div
                key={i}
                className="flex items-start gap-3 px-4 py-3 border-b border-slate-800/50 last:border-0"
              >
                <span className="text-yellow-500 mt-0.5 flex-shrink-0" aria-hidden>⚠</span>
                <p className="text-sm text-slate-300">{gate}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Safety notice */}
        <section
          className="bg-red-500/5 border border-red-500/20 rounded-xl p-4"
          aria-label="Activation safety notice"
        >
          <h2 className="text-sm font-semibold text-red-400 mb-2">Activation Safety Notice</h2>
          <ul className="text-sm text-slate-400 space-y-1 list-disc list-inside">
            <li>PSL remains inactive — do NOT activate without owner authorisation.</li>
            <li>World Cup 2026 remains active beta context.</li>
            <li>Wallet remains sandbox-only — no production wallet activation.</li>
            <li>Fantasy remains points-only — no real-money integration.</li>
            <li>Guess the Score remains points-only — no real-money integration.</li>
            <li>Sponsor rewards remain non-financial — points, badges, digital experiences only.</li>
            <li>No production fixture ingestion. No scheduled ingestion.</li>
          </ul>
        </section>

      </div>
    </PortalShell>
  );
}
