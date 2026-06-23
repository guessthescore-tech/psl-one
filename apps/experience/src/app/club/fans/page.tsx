'use client';
/**
 * PSL_INACTIVE - do not activate PSL season
 * GTS_POINTS_ONLY - no real-money
 * NO_REAL_MONEY
 */

import { PortalShell } from '../../../components/portal/PortalShell';
import { PortalMetricCard } from '../../../components/portal/PortalMetricCard';
import { CLUB_NAV_ITEMS } from '../../../lib/portal-routes';

const MOCK_FANS = [
  { id: 'f1', displayName: 'fan_tshwane_01', joinedAt: '2026-06-10', points: 312 },
  { id: 'f2', displayName: 'jozi_pride_fc', joinedAt: '2026-06-11', points: 289 },
  { id: 'f3', displayName: 'soweto_fan', joinedAt: '2026-06-12', points: 244 },
];

export default function ClubFansPage() {
  return (
    <PortalShell portalName="Club Portal" navItems={CLUB_NAV_ITEMS}>
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Fans</h1>
          <p className="text-slate-400 text-sm">Fans registered to your club. Points are PSL points only — no financial value.</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <PortalMetricCard label="Registered Fans" value={MOCK_FANS.length} />
          <PortalMetricCard label="Active This Week" value={3} />
          <PortalMetricCard label="Points Type" value="Points Only" description="GTS_POINTS_ONLY — no cash" />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Fan</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Joined</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">PSL Points</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_FANS.map((fan) => (
                <tr key={fan.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                  <td className="px-4 py-3 text-slate-200">{fan.displayName}</td>
                  <td className="px-4 py-3 text-slate-400">{fan.joinedAt}</td>
                  <td className="px-4 py-3 text-purple-400 font-mono">{fan.points} pts</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-600">Points have no financial value and cannot be redeemed for cash.</p>
      </div>
    </PortalShell>
  );
}
