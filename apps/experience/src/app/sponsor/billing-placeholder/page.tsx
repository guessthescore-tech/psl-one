'use client';
/**
 * WALLET_SANDBOX_ONLY - no production wallet
 * SPONSOR_REWARDS_NON_FINANCIAL - no cash payouts
 * NO_REAL_MONEY
 *
 * Billing placeholder — sandbox only. No real transactions.
 */

import { PortalShell } from '../../../components/portal/PortalShell';
import { StatusBadge } from '../../../components/portal/PortalStatusBadges';
import { SPONSOR_NAV_ITEMS } from '../../../lib/portal-routes';

export default function SponsorBillingPlaceholderPage() {
  return (
    <PortalShell portalName="Sponsor Portal" navItems={SPONSOR_NAV_ITEMS}>
      <div className="max-w-2xl space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Billing</h1>
            <p className="text-slate-400 text-sm">Billing and invoicing for your PSL One sponsorship package.</p>
          </div>
          <StatusBadge label="SANDBOX MODE" variant="sandbox" />
        </div>

        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-5">
          <h2 className="text-sm font-bold text-yellow-300 mb-2">WALLET_SANDBOX_ONLY</h2>
          <p className="text-sm text-slate-400">
            The PSL One wallet is currently in sandbox mode. No real financial transactions are processed.
            Billing integration with a production payment provider is pending owner authorisation.
            No real money is collected, transferred, or held.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-slate-200">Placeholder Billing Summary</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-slate-800">
              <span className="text-sm text-slate-400">Current Package</span>
              <span className="text-sm text-slate-200">Beta Sponsor (Sandbox)</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-800">
              <span className="text-sm text-slate-400">Payment Status</span>
              <StatusBadge label="SANDBOX — No Real Payment" variant="sandbox" />
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-slate-400">Next Invoice</span>
              <span className="text-sm text-slate-500">Pending production activation</span>
            </div>
          </div>
          <p className="text-xs text-slate-600 mt-4">
            Contact your PSL One account manager for commercial billing details once production mode is authorised.
          </p>
        </div>
      </div>
    </PortalShell>
  );
}
