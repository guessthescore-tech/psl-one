'use client';
/**
 * PSL_INACTIVE - do not activate PSL season
 * NO_REAL_MONEY
 * Audit logs are never bypassed.
 */

import { PortalShell } from '../../../components/portal/PortalShell';
import { PortalMetricCard } from '../../../components/portal/PortalMetricCard';
import { ADMIN_NAV_ITEMS } from '../../../lib/portal-routes';

const MOCK_AUDIT = [
  { id: 'a1', user: 'admin@pslone.co.za', action: 'LOGIN', resource: 'auth', ts: '2026-06-23T10:00:00Z' },
  { id: 'a2', user: 'admin@pslone.co.za', action: 'FIXTURE_LIST', resource: 'fixture', ts: '2026-06-23T10:02:00Z' },
  { id: 'a3', user: 'admin@pslone.co.za', action: 'GTS_RULES_VIEW', resource: 'rules', ts: '2026-06-23T10:03:00Z' },
  { id: 'a4', user: 'fan01@example.com', action: 'PREDICTION_SUBMIT', resource: 'prediction', ts: '2026-06-23T09:55:00Z' },
  { id: 'a5', user: 'fan01@example.com', action: 'FANTASY_TEAM_SAVE', resource: 'fantasy', ts: '2026-06-23T09:58:00Z' },
];

export default function AdminAuditPage() {
  return (
    <PortalShell portalName="Admin Portal" navItems={ADMIN_NAV_ITEMS}>
      <div className="max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Audit Log</h1>
          <p className="text-slate-400 text-sm">All admin and fan actions are logged. Audit logs are never bypassed.</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <PortalMetricCard label="Entries Today" value={MOCK_AUDIT.length} />
          <PortalMetricCard label="Admin Actions" value={3} />
          <PortalMetricCard label="Fan Actions" value={2} />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Timestamp</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">User</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Action</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Resource</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_AUDIT.map((entry) => (
                <tr key={entry.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 font-mono text-xs">
                  <td className="px-4 py-3 text-slate-500">{entry.ts}</td>
                  <td className="px-4 py-3 text-slate-300">{entry.user}</td>
                  <td className="px-4 py-3 text-yellow-400">{entry.action}</td>
                  <td className="px-4 py-3 text-slate-400">{entry.resource}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PortalShell>
  );
}
