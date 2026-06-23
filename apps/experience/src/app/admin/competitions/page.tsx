'use client';
/**
 * PSL_INACTIVE - do not activate PSL season
 * NO_REAL_MONEY
 */

import { PortalShell } from '../../../components/portal/PortalShell';
import { PortalStatusBadges, StatusBadge } from '../../../components/portal/PortalStatusBadges';
import { PortalEmptyState } from '../../../components/portal/PortalEmptyState';
import { ADMIN_NAV_ITEMS } from '../../../lib/portal-routes';

const MOCK_COMPETITIONS = [
  { id: 'wc-2026', name: 'FIFA World Cup 2026', country: 'International', status: 'ACTIVE', isActive: true },
  { id: 'psl-2024', name: 'PSL 2024/25', country: 'South Africa', status: 'INACTIVE', isActive: false },
  { id: 'nedbank-2024', name: 'Nedbank Cup 2024', country: 'South Africa', status: 'INACTIVE', isActive: false },
];

export default function AdminCompetitionsPage() {
  return (
    <PortalShell portalName="Admin Portal" navItems={ADMIN_NAV_ITEMS}>
      <div className="max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Competitions</h1>
            <p className="text-slate-400 text-sm">Manage competitions. PSL remains inactive.</p>
          </div>
          <PortalStatusBadges />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Country</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_COMPETITIONS.map((comp) => (
                <tr key={comp.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3 text-slate-200 font-medium">{comp.name}</td>
                  <td className="px-4 py-3 text-slate-400">{comp.country}</td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      label={comp.status}
                      variant={comp.isActive ? 'active' : 'inactive'}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-slate-600">
          PSL remains inactive. Only WC 2026 is the active beta context. Activation requires owner authorisation.
        </p>
      </div>
    </PortalShell>
  );
}
