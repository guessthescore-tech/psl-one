'use client';
/**
 * PSL_INACTIVE - do not activate PSL season
 * NO_REAL_MONEY
 */

import { PortalShell } from '../../../components/portal/PortalShell';
import { CLUB_NAV_ITEMS } from '../../../lib/portal-routes';

export default function ClubSupportersPage() {
  return (
    <PortalShell portalName="Club Portal" navItems={CLUB_NAV_ITEMS}>
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Supporters</h1>
          <p className="text-slate-400 text-sm">Supporter groups and community engagement for your club.</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <p className="text-sm text-slate-400 text-center py-8">
            Supporter group data will populate once the PSL season is activated.
            Fan registrations, supporter clubs, and community groups will appear here.
            PSL remains inactive.
          </p>
        </div>
      </div>
    </PortalShell>
  );
}
