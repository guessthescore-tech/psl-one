'use client';
/**
 * PSL_INACTIVE - do not activate PSL season
 * NO_REAL_MONEY
 */

import { PortalShell } from '../../../components/portal/PortalShell';
import { PortalEmptyState } from '../../../components/portal/PortalEmptyState';
import { CLUB_NAV_ITEMS } from '../../../lib/portal-routes';

export default function ClubSquadPage() {
  return (
    <PortalShell portalName="Club Portal" navItems={CLUB_NAV_ITEMS}>
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Squad</h1>
          <p className="text-slate-400 text-sm">Manage your registered squad. Squad data is pending PSL season activation.</p>
        </div>
        <PortalEmptyState
          title="Squad Pending PSL Activation"
          description="Squad data will be available once the PSL season is activated by the league administrator. PSL remains inactive."
          action={{ label: 'View Players', onClick: () => {} }}
        />
      </div>
    </PortalShell>
  );
}
