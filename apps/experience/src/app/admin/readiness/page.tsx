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
 */

import { PortalShell } from '../../../components/portal/PortalShell';
import { StatusBadge } from '../../../components/portal/PortalStatusBadges';
import { ADMIN_NAV_ITEMS } from '../../../lib/portal-routes';

type CheckStatus = 'PASS' | 'FAIL' | 'PENDING' | 'CONDITIONAL_GO';

const READINESS_CHECKS: { category: string; check: string; status: CheckStatus; note: string }[] = [
  { category: 'Auth & RBAC', check: 'PSL_ADMIN role enforced on all admin routes', status: 'PASS', note: '@Roles guard, 36 tests' },
  { category: 'Auth & RBAC', check: 'RBAC smoke test (8/0 pass/fail)', status: 'PASS', note: 'Sprint 24 confirmed' },
  { category: 'Safety Flags', check: 'PSL season remains inactive', status: 'PASS', note: 'Not activated' },
  { category: 'Safety Flags', check: 'Wallet remains sandbox-only', status: 'PASS', note: 'SiliconEnterpriseSandboxWalletAdapter' },
  { category: 'Safety Flags', check: 'GTS is points-only', status: 'PASS', note: 'No real-money' },
  { category: 'Safety Flags', check: 'Fantasy is points-only', status: 'PASS', note: 'No real-money' },
  { category: 'Safety Flags', check: 'Sponsor rewards are non-financial', status: 'PASS', note: 'Points/badges/digital only' },
  { category: 'Data', check: 'No production ingestion enabled', status: 'PASS', note: 'NO_PRODUCTION_INGESTION' },
  { category: 'Data', check: 'No scheduled ingestion active', status: 'PASS', note: 'NO_SCHEDULED_INGESTION' },
  { category: 'Data', check: 'Fixture source status', status: 'PENDING', note: 'SOURCE_EMPTY — PSL fixtures not available yet' },
  { category: 'Provider', check: 'Live data provider key', status: 'PENDING', note: 'API-Football key required from owner' },
  { category: 'Infrastructure', check: 'EC2 staging deployed', status: 'PASS', note: 'i-0a5f16539c9626f90 running' },
  { category: 'Infrastructure', check: 'DB seeded (WC 2026 active, PSL inactive)', status: 'PASS', note: 'Sprint 20 confirmed' },
  { category: 'CI', check: 'All 7 CI checks green', status: 'PASS', note: 'Vercel + GitHub Actions' },
  { category: 'Activation Gates', check: 'PSL season activation', status: 'PENDING', note: 'Requires owner authorisation' },
  { category: 'Activation Gates', check: 'Wallet production activation', status: 'PENDING', note: 'Requires owner authorisation' },
];

const STATUS_VARIANT: Record<CheckStatus, 'active' | 'inactive' | 'warning' | 'info'> = {
  PASS: 'active',
  FAIL: 'inactive',
  PENDING: 'warning',
  CONDITIONAL_GO: 'info',
};

const passCount = READINESS_CHECKS.filter((c) => c.status === 'PASS').length;
const pendingCount = READINESS_CHECKS.filter((c) => c.status === 'PENDING').length;

export default function AdminReadinessPage() {
  return (
    <PortalShell portalName="Admin Portal" navItems={ADMIN_NAV_ITEMS}>
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Launch Readiness</h1>
          <p className="text-slate-400 text-sm">
            Beta readiness checklist. {passCount}/{READINESS_CHECKS.length} checks passed. {pendingCount} pending owner action.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-green-400">{passCount}</p>
            <p className="text-xs text-green-400 mt-1">Passed</p>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-yellow-400">{pendingCount}</p>
            <p className="text-xs text-yellow-400 mt-1">Pending Owner</p>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-red-400">0</p>
            <p className="text-xs text-red-400 mt-1">Failed</p>
          </div>
        </div>

        {['Auth & RBAC', 'Safety Flags', 'Data', 'Provider', 'Infrastructure', 'CI', 'Activation Gates'].map((category) => {
          const checks = READINESS_CHECKS.filter((c) => c.category === category);
          return (
            <div key={category} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-800">
                <p className="text-sm font-semibold text-slate-200">{category}</p>
              </div>
              {checks.map((check, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-3 border-b border-slate-800/50 last:border-0">
                  <StatusBadge label={check.status} variant={STATUS_VARIANT[check.status]} />
                  <div className="flex-1">
                    <p className="text-sm text-slate-200">{check.check}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{check.note}</p>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </PortalShell>
  );
}
