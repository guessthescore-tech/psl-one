'use client';
/**
 * PSL_INACTIVE - do not activate PSL season
 * NO_REAL_MONEY
 */

import { PortalShell } from '../../../components/portal/PortalShell';
import { CLUB_NAV_ITEMS } from '../../../lib/portal-routes';

export default function ClubSettingsPage() {
  return (
    <PortalShell portalName="Club Portal" navItems={CLUB_NAV_ITEMS}>
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Club Settings</h1>
          <p className="text-slate-400 text-sm">Configure club portal preferences and notification settings.</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-200">Email Notifications</p>
              <p className="text-xs text-slate-500">Receive alerts for fan activity and fixture updates</p>
            </div>
            <button
              type="button"
              className="w-10 h-6 rounded-full bg-green-600 transition-colors relative"
              role="switch"
              aria-checked="true"
            >
              <span className="block w-4 h-4 rounded-full bg-white mx-1 translate-x-4 transition-transform" />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-200">Match Day Reminders</p>
              <p className="text-xs text-slate-500">Notify fans of upcoming fixtures (pending PSL activation)</p>
            </div>
            <button
              type="button"
              className="w-10 h-6 rounded-full bg-slate-700 transition-colors relative"
              role="switch"
              aria-checked="false"
            >
              <span className="block w-4 h-4 rounded-full bg-white mx-1 transition-transform" />
            </button>
          </div>
        </div>
        <button
          type="button"
          className="w-full py-2.5 bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold rounded-lg transition-colors min-h-[44px]"
        >
          Save Settings
        </button>
      </div>
    </PortalShell>
  );
}
