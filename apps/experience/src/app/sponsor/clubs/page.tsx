'use client';
/**
 * PSL_INACTIVE - do not activate PSL season
 * SPONSOR_REWARDS_NON_FINANCIAL - no cash payouts
 * NO_REAL_MONEY
 */

import { PortalShell } from '../../../components/portal/PortalShell';
import { StatusBadge } from '../../../components/portal/PortalStatusBadges';
import { SPONSOR_NAV_ITEMS } from '../../../lib/portal-routes';

const MOCK_CLUBS = [
  { id: 'kc', name: 'Kaizer Chiefs', status: 'INACTIVE', fans: 0 },
  { id: 'op', name: 'Orlando Pirates', status: 'INACTIVE', fans: 0 },
  { id: 'ms', name: 'Mamelodi Sundowns', status: 'INACTIVE', fans: 0 },
];

export default function SponsorClubsPage() {
  return (
    <PortalShell portalName="Sponsor Portal" navItems={SPONSOR_NAV_ITEMS}>
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Club Partnerships</h1>
          <p className="text-slate-400 text-sm">PSL clubs available for sponsorship activation. PSL season inactive — clubs pending activation.</p>
        </div>

        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3 text-sm text-red-400">
          PSL_INACTIVE — All PSL clubs are currently inactive. Club sponsorship activations will be available once the PSL season is activated by the league administrator.
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Club</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Season Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Fan Base</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_CLUBS.map((c) => (
                <tr key={c.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                  <td className="px-4 py-3 text-slate-200 font-medium">{c.name}</td>
                  <td className="px-4 py-3"><StatusBadge label="PSL INACTIVE" variant="inactive" /></td>
                  <td className="px-4 py-3 text-slate-500">Pending activation</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PortalShell>
  );
}
