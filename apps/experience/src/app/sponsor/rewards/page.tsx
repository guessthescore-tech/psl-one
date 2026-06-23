'use client';
/**
 * SPONSOR_REWARDS_NON_FINANCIAL - Sponsor rewards are non-financial only.
 *   All rewards are points, badges, or digital experiences.
 *   No cash payouts. No prize money. No vouchers with monetary value.
 * NO_REAL_MONEY
 */

import { PortalShell } from '../../../components/portal/PortalShell';
import { StatusBadge } from '../../../components/portal/PortalStatusBadges';
import { SPONSOR_NAV_ITEMS } from '../../../lib/portal-routes';

// SPONSOR_REWARDS_NON_FINANCIAL: All reward types must be non-financial
const REWARD_TYPES = [
  { id: 'r1', name: 'Prediction Streak Badge', type: 'badge', value: 'Badge', isFinancial: false },
  { id: 'r2', name: 'WC 2026 Fan Points', type: 'points', value: '50 PSL Points', isFinancial: false },
  { id: 'r3', name: 'Club Digital Kit', type: 'experience', value: 'Digital Asset', isFinancial: false },
  { id: 'r4', name: 'Fantasy Champion Badge', type: 'badge', value: 'Badge', isFinancial: false },
];

export default function SponsorRewardsPage() {
  return (
    <PortalShell portalName="Sponsor Portal" navItems={SPONSOR_NAV_ITEMS}>
      <div className="max-w-3xl space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Rewards</h1>
            <p className="text-slate-400 text-sm">
              All sponsor rewards on PSL One are non-financial: points, badges, and digital experiences only.
              No cash payouts are permitted.
            </p>
          </div>
          <StatusBadge label="NON-FINANCIAL ONLY" variant="info" />
        </div>

        {/* Non-financial declaration — required on every sponsor rewards surface */}
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-5">
          <h2 className="text-sm font-bold text-blue-300 mb-2">SPONSOR_REWARDS_NON_FINANCIAL Declaration</h2>
          <ul className="text-sm text-slate-400 space-y-1 list-disc list-inside">
            <li>All rewards are non-financial (points, badges, digital experiences).</li>
            <li>No cash payouts to fans or clubs.</li>
            <li>No prize money of any kind.</li>
            <li>No vouchers or gift cards with monetary value.</li>
            <li>PSL points have no financial value and cannot be redeemed for cash.</li>
            <li>This system is not gambling, betting, or wagering.</li>
            <li>Wallet remains sandbox-only — no real transactions.</li>
          </ul>
        </div>

        <div className="space-y-3">
          {REWARD_TYPES.map((reward) => (
            <div key={reward.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-200">{reward.name}</p>
                <p className="text-xs text-slate-500 capitalize mt-0.5">{reward.type} — {reward.value}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <StatusBadge label="NON-FINANCIAL" variant="info" />
                {!reward.isFinancial && (
                  <StatusBadge label="SAFE" variant="active" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PortalShell>
  );
}
