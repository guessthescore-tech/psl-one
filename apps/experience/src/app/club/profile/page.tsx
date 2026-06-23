'use client';
/**
 * PSL_INACTIVE - do not activate PSL season
 * NO_REAL_MONEY
 */

import { PortalShell } from '../../../components/portal/PortalShell';
import { CLUB_NAV_ITEMS } from '../../../lib/portal-routes';

export default function ClubProfilePage() {
  return (
    <PortalShell portalName="Club Portal" navItems={CLUB_NAV_ITEMS}>
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Club Profile</h1>
          <p className="text-slate-400 text-sm">Manage your club's public profile on PSL One.</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Club Name</label>
            <input
              type="text"
              placeholder="Club name"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-slate-500 text-sm"
              aria-label="Club name"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Short Name / Code</label>
            <input
              type="text"
              placeholder="e.g. KC"
              maxLength={5}
              className="w-32 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-slate-500 text-sm font-mono"
              aria-label="Short name"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">City</label>
            <input
              type="text"
              placeholder="e.g. Johannesburg"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-slate-500 text-sm"
              aria-label="City"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Stadium</label>
            <input
              type="text"
              placeholder="e.g. FNB Stadium"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-slate-500 text-sm"
              aria-label="Stadium"
            />
          </div>
          <button
            type="button"
            className="w-full py-2.5 bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold rounded-lg transition-colors min-h-[44px]"
          >
            Save Profile (Requires CLUB_ADMIN)
          </button>
        </div>
      </div>
    </PortalShell>
  );
}
