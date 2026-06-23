'use client';
/**
 * PSL_INACTIVE - do not activate PSL season
 * NO_REAL_MONEY
 */

import { PortalShell } from '../../../components/portal/PortalShell';
import { StatusBadge } from '../../../components/portal/PortalStatusBadges';
import { ADMIN_NAV_ITEMS } from '../../../lib/portal-routes';

const MOCK_SEASONS = [
  { id: 'wc-2026-s1', name: 'World Cup 2026', competition: 'FIFA World Cup 2026', status: 'ACTIVE', isActive: true, start: '2026-06-11', end: '2026-07-19' },
  { id: 'psl-2024-s1', name: 'PSL 2024/25', competition: 'PSL 2024/25', status: 'INACTIVE', isActive: false, start: '2024-08-01', end: '2025-05-31' },
];

export default function AdminSeasonsPage() {
  return (
    <PortalShell portalName="Admin Portal" navItems={ADMIN_NAV_ITEMS}>
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Seasons</h1>
          <p className="text-slate-400 text-sm">
            Season activation requires owner authorisation. PSL remains inactive.
          </p>
        </div>

        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 text-sm text-red-400">
          PSL_INACTIVE — Do not activate PSL 2024/25 without explicit owner authorisation. WC 2026 is the active beta season.
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Season</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Competition</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Start</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">End</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_SEASONS.map((s) => (
                <tr key={s.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3 text-slate-200 font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-slate-400">{s.competition}</td>
                  <td className="px-4 py-3 text-slate-400">{s.start}</td>
                  <td className="px-4 py-3 text-slate-400">{s.end}</td>
                  <td className="px-4 py-3">
                    <StatusBadge label={s.status} variant={s.isActive ? 'active' : 'inactive'} />
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
