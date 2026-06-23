'use client';
/**
 * PSL_INACTIVE - do not activate PSL season
 * NO_REAL_MONEY
 */

import { PortalShell } from '../../../components/portal/PortalShell';
import { PortalEmptyState } from '../../../components/portal/PortalEmptyState';
import { CLUB_NAV_ITEMS } from '../../../lib/portal-routes';

export default function ClubResultsPage() {
  return (
    <PortalShell portalName="Club Portal" navItems={CLUB_NAV_ITEMS}>
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Results</h1>
          <p className="text-slate-400 text-sm">Match results for your club. PSL season inactive.</p>
        </div>
        <PortalEmptyState
          title="No Results Available"
          description="Match results will appear once the PSL season is activated and matches are played. PSL remains inactive."
        />
      </div>
    </PortalShell>
  );
}
