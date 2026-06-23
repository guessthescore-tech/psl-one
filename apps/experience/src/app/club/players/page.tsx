'use client';
/**
 * PSL_INACTIVE - do not activate PSL season
 * NO_REAL_MONEY
 */

import { PortalShell } from '../../../components/portal/PortalShell';
import { PortalEmptyState } from '../../../components/portal/PortalEmptyState';
import { CLUB_NAV_ITEMS } from '../../../lib/portal-routes';

export default function ClubPlayersPage() {
  return (
    <PortalShell portalName="Club Portal" navItems={CLUB_NAV_ITEMS}>
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Players</h1>
          <p className="text-slate-400 text-sm">Individual player profiles and stats for your club.</p>
        </div>
        <PortalEmptyState
          title="Players Pending PSL Activation"
          description="Player data will populate once the PSL season is activated. 96 provisional players are seeded in the system."
          action={{ label: 'View Squad Import', onClick: () => {} }}
        />
      </div>
    </PortalShell>
  );
}
