'use client';
/**
 * SPONSOR_REWARDS_NON_FINANCIAL - no cash payouts
 * NO_REAL_MONEY
 */

import { PortalShell } from '../../../components/portal/PortalShell';
import { PortalEmptyState } from '../../../components/portal/PortalEmptyState';
import { CLUB_NAV_ITEMS } from '../../../lib/portal-routes';

export default function ClubCampaignsPage() {
  return (
    <PortalShell portalName="Club Portal" navItems={CLUB_NAV_ITEMS}>
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Campaigns</h1>
          <p className="text-slate-400 text-sm">Sponsor campaigns for your club. All rewards are non-financial — points, badges, digital experiences.</p>
        </div>
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 text-sm text-blue-300">
          SPONSOR_REWARDS_NON_FINANCIAL — Campaign rewards are points, badges, or digital experiences only. No cash payouts.
        </div>
        <PortalEmptyState
          title="No Active Campaigns"
          description="No sponsor campaigns are currently active for your club. Contact your account manager to set up campaigns."
          action={{ label: 'Contact Sponsor Manager', onClick: () => {} }}
        />
      </div>
    </PortalShell>
  );
}
