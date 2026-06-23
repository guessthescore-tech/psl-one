'use client';
/**
 * PSL_INACTIVE - do not activate PSL season
 * NO_PRODUCTION_INGESTION
 * NO_REAL_MONEY
 */

import { PortalShell } from '../../../components/portal/PortalShell';
import { PortalEmptyState } from '../../../components/portal/PortalEmptyState';
import { CLUB_NAV_ITEMS } from '../../../lib/portal-routes';

export default function ClubFixturesPage() {
  return (
    <PortalShell portalName="Club Portal" navItems={CLUB_NAV_ITEMS}>
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Fixtures</h1>
          <p className="text-slate-400 text-sm">
            Upcoming fixtures for your club. PSL fixtures pending season activation. No production ingestion active.
          </p>
        </div>
        <PortalEmptyState
          title="No PSL Fixtures Available"
          description="PSL fixture data will appear here once the season is activated and fixtures are published. Ingestion source is currently empty."
          action={{ label: 'Check Status', onClick: () => {} }}
        />
      </div>
    </PortalShell>
  );
}
