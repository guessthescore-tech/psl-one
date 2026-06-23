'use client';
/**
 * PSL_INACTIVE - do not activate PSL season
 * NO_REAL_MONEY
 */

import { PortalShell } from '../../../components/portal/PortalShell';
import { PortalMetricCard } from '../../../components/portal/PortalMetricCard';
import { ADMIN_NAV_ITEMS } from '../../../lib/portal-routes';

const MOCK_TEAMS = [
  { id: 't1', name: 'Argentina', shortName: 'ARG', country: 'Argentina', playerCount: 26 },
  { id: 't2', name: 'France', shortName: 'FRA', country: 'France', playerCount: 26 },
  { id: 't3', name: 'Brazil', shortName: 'BRA', country: 'Brazil', playerCount: 26 },
  { id: 't4', name: 'England', shortName: 'ENG', country: 'England', playerCount: 26 },
  { id: 't5', name: 'Kaizer Chiefs', shortName: 'KC', country: 'South Africa', playerCount: 0 },
  { id: 't6', name: 'Orlando Pirates', shortName: 'OP', country: 'South Africa', playerCount: 0 },
];

export default function AdminTeamsPage() {
  return (
    <PortalShell portalName="Admin Portal" navItems={ADMIN_NAV_ITEMS}>
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Teams</h1>
          <p className="text-slate-400 text-sm">All registered teams. PSL teams are inactive pending season activation.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <PortalMetricCard label="Total Teams" value={MOCK_TEAMS.length} />
          <PortalMetricCard label="WC 2026 Teams" value={4} trend="flat" trendLabel="Beta context" />
          <PortalMetricCard label="PSL Teams" value={16} description="PSL inactive — 16 clubs seeded" />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Code</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Country</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Players</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_TEAMS.map((team) => (
                <tr key={team.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3 text-slate-200 font-medium">{team.name}</td>
                  <td className="px-4 py-3 text-slate-400 font-mono">{team.shortName}</td>
                  <td className="px-4 py-3 text-slate-400">{team.country}</td>
                  <td className="px-4 py-3 text-slate-400">{team.playerCount || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PortalShell>
  );
}
