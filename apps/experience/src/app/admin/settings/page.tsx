'use client';
/**
 * PSL_INACTIVE - do not activate PSL season
 * WALLET_SANDBOX_ONLY - no production wallet
 * NO_REAL_MONEY
 */

import { PortalShell } from '../../../components/portal/PortalShell';
import { StatusBadge } from '../../../components/portal/PortalStatusBadges';
import { ADMIN_NAV_ITEMS } from '../../../lib/portal-routes';

const SETTINGS_GROUPS = [
  {
    group: 'Platform Constraints',
    items: [
      { key: 'PSL_INACTIVE', value: 'true', editable: false, note: 'Requires owner authorisation to change' },
      { key: 'WALLET_SANDBOX_ONLY', value: 'true', editable: false, note: 'No production wallet activation' },
      { key: 'FANTASY_POINTS_ONLY', value: 'true', editable: false, note: 'No real-money fantasy' },
      { key: 'GTS_POINTS_ONLY', value: 'true', editable: false, note: 'No real-money GTS' },
      { key: 'SPONSOR_REWARDS_NON_FINANCIAL', value: 'true', editable: false, note: 'No cash payouts' },
      { key: 'NO_PRODUCTION_INGESTION', value: 'true', editable: false, note: 'No ingestion in production' },
      { key: 'NO_SCHEDULED_INGESTION', value: 'true', editable: false, note: 'No scheduler active' },
    ],
  },
  {
    group: 'Provider Settings',
    items: [
      { key: 'DATA_PROVIDER', value: 'NoOpAdapter', editable: false, note: 'API key required to activate' },
      { key: 'LIVE_DATA_ENABLED', value: 'false', editable: false, note: 'Pending live key' },
    ],
  },
];

export default function AdminSettingsPage() {
  return (
    <PortalShell portalName="Admin Portal" navItems={ADMIN_NAV_ITEMS}>
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Platform Settings</h1>
          <p className="text-slate-400 text-sm">Read-only view of platform constraint flags. Changes require owner authorisation and backend config.</p>
        </div>

        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 text-sm text-red-400">
          These settings are enforced at the backend level. Modifying them requires owner authorisation and NestJS config changes — not frontend edits.
        </div>

        {SETTINGS_GROUPS.map((group) => (
          <div key={group.group} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800">
              <p className="text-sm font-semibold text-slate-200">{group.group}</p>
            </div>
            {group.items.map((item) => (
              <div key={item.key} className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50 last:border-0">
                <div>
                  <p className="text-xs font-mono font-bold text-slate-300">{item.key}</p>
                  <p className="text-xs text-slate-600 mt-0.5">{item.note}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge
                    label={item.value}
                    variant={item.value === 'true' ? 'active' : item.value === 'false' ? 'inactive' : 'info'}
                  />
                  {!item.editable && (
                    <span className="text-xs text-slate-600">locked</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </PortalShell>
  );
}
