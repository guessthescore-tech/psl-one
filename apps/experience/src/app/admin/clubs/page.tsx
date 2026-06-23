'use client';
/**
 * PSL_INACTIVE - do not activate PSL season
 * NO_REAL_MONEY
 */

import { PortalShell } from '../../../components/portal/PortalShell';
import { StatusBadge } from '../../../components/portal/PortalStatusBadges';
import { PortalMetricCard } from '../../../components/portal/PortalMetricCard';
import { ADMIN_NAV_ITEMS } from '../../../lib/portal-routes';

const MOCK_CLUBS = [
  { id: 'kc', name: 'Kaizer Chiefs', shortName: 'KC', city: 'Johannesburg', fans: 0, status: 'PSL_INACTIVE' },
  { id: 'op', name: 'Orlando Pirates', shortName: 'OP', city: 'Soweto', fans: 0, status: 'PSL_INACTIVE' },
  { id: 'sr', name: 'Supersport United', shortName: 'SS', city: 'Pretoria', fans: 0, status: 'PSL_INACTIVE' },
  { id: 'mam', name: 'Mamelodi Sundowns', shortName: 'MS', city: 'Pretoria', fans: 0, status: 'PSL_INACTIVE' },
];

export default function AdminClubsPage() {
  return (
    <PortalShell portalName="Admin Portal" navItems={ADMIN_NAV_ITEMS}>
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Clubs</h1>
          <p className="text-slate-400 text-sm">PSL clubs. All clubs are inactive — PSL season not yet activated.</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <PortalMetricCard label="Seeded Clubs" value={16} description="PSL clubs seeded" />
          <PortalMetricCard label="Active Clubs" value={0} description="PSL inactive" />
          <PortalMetricCard label="Season Status" value="INACTIVE" description="Pending owner authorisation" />
        </div>

        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3 text-sm text-red-400">
          PSL_INACTIVE — All clubs are inactive pending season activation by owner.
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Club</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Code</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">City</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_CLUBS.map((c) => (
                <tr key={c.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                  <td className="px-4 py-3 text-slate-200 font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-slate-400 font-mono">{c.shortName}</td>
                  <td className="px-4 py-3 text-slate-400">{c.city}</td>
                  <td className="px-4 py-3">
                    <StatusBadge label="INACTIVE" variant="inactive" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PortalShell>
  );
}
