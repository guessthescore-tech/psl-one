'use client';
/**
 * PSL_INACTIVE - do not activate PSL season
 * GTS_POINTS_ONLY - no real-money
 * FANTASY_POINTS_ONLY - no real-money
 * NO_REAL_MONEY
 */

import { PortalShell } from '../../../components/portal/PortalShell';
import { PortalMetricCard } from '../../../components/portal/PortalMetricCard';
import { ADMIN_NAV_ITEMS } from '../../../lib/portal-routes';

const MOCK_LEADERS = [
  { rank: 1, name: 'fan_mbeki_01', gtsPoints: 342, fantasyPoints: 819, club: 'Argentina' },
  { rank: 2, name: 'sa_football_za', gtsPoints: 315, fantasyPoints: 788, club: 'France' },
  { rank: 3, name: 'psl_predicts', gtsPoints: 298, fantasyPoints: 756, club: 'Brazil' },
  { rank: 4, name: 'wc_wizard', gtsPoints: 277, fantasyPoints: 731, club: 'England' },
  { rank: 5, name: 'tshwane_fan', gtsPoints: 251, fantasyPoints: 702, club: 'Argentina' },
];

export default function AdminLeaderboardsPage() {
  return (
    <PortalShell portalName="Admin Portal" navItems={ADMIN_NAV_ITEMS}>
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Leaderboards</h1>
          <p className="text-slate-400 text-sm">GTS and Fantasy leaderboards — points only, no real money.</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <PortalMetricCard label="Total Fans" value="—" description="Live count via API" />
          <PortalMetricCard label="GTS Entries" value="—" description="Points only" />
          <PortalMetricCard label="Fantasy Teams" value="—" description="Points only" />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800">
            <p className="text-sm font-semibold text-slate-200">Overall Leaderboard — Points Only (No Real Money)</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Fan</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">GTS Points</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Fantasy Pts</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Club</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_LEADERS.map((l) => (
                <tr key={l.rank} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                  <td className="px-4 py-3 text-slate-400 font-mono">{l.rank}</td>
                  <td className="px-4 py-3 text-slate-200 font-medium">{l.name}</td>
                  <td className="px-4 py-3 text-slate-300 font-mono">{l.gtsPoints}</td>
                  <td className="px-4 py-3 text-slate-300 font-mono">{l.fantasyPoints}</td>
                  <td className="px-4 py-3 text-slate-400">{l.club}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-600">All leaderboard positions represent PSL points only — no financial value or prize money.</p>
      </div>
    </PortalShell>
  );
}
