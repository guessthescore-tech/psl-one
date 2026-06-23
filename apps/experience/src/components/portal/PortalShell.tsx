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
 * PortalShell — left sidebar + topbar wrapper layout for all PSL One portals.
 */

import type { ReactNode } from 'react';
import { PortalSidebar } from './PortalSidebar';
import { PortalTopbar } from './PortalTopbar';
import type { NavItem } from '../../lib/portal-routes';

interface PortalShellProps {
  portalName: string;
  navItems: NavItem[];
  children: ReactNode;
}

export function PortalShell({ portalName, navItems, children }: PortalShellProps) {
  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Sidebar */}
      <PortalSidebar portalName={portalName} navItems={navItems} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <PortalTopbar portalName={portalName} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
