'use client';
/**
 * PSL_INACTIVE - do not activate PSL season
 * NO_REAL_MONEY
 */

import { PortalShell } from '../../../components/portal/PortalShell';
import { StatusBadge } from '../../../components/portal/PortalStatusBadges';
import { PortalMetricCard } from '../../../components/portal/PortalMetricCard';
import { ADMIN_NAV_ITEMS } from '../../../lib/portal-routes';

const MOCK_USERS = [
  { id: 'u1', email: 'admin@pslone.co.za', role: 'PSL_ADMIN', createdAt: '2026-01-01' },
  { id: 'u2', email: 'fan01@example.com', role: 'FAN', createdAt: '2026-06-10' },
  { id: 'u3', email: 'club@kaizer.co.za', role: 'CLUB_ADMIN', createdAt: '2026-06-05' },
  { id: 'u4', email: 'sponsor@castle.co.za', role: 'SPONSOR_ADMIN', createdAt: '2026-06-08' },
];

const ROLE_VARIANT: Record<string, 'active' | 'info' | 'warning' | 'inactive'> = {
  PSL_ADMIN: 'active',
  FAN: 'info',
  CLUB_ADMIN: 'warning',
  SPONSOR_ADMIN: 'warning',
};

export default function AdminUsersPage() {
  return (
    <PortalShell portalName="Admin Portal" navItems={ADMIN_NAV_ITEMS}>
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Users</h1>
          <p className="text-slate-400 text-sm">User management. RBAC enforced at API layer. PSL_ADMIN role required for admin actions.</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <PortalMetricCard label="Total Users" value={MOCK_USERS.length} />
          <PortalMetricCard label="PSL Admins" value={1} />
          <PortalMetricCard label="Fan Accounts" value={1} description="Beta testers" />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Created</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_USERS.map((u) => (
                <tr key={u.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                  <td className="px-4 py-3 text-slate-200">{u.email}</td>
                  <td className="px-4 py-3">
                    <StatusBadge label={u.role} variant={ROLE_VARIANT[u.role] ?? 'info'} />
                  </td>
                  <td className="px-4 py-3 text-slate-400">{u.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PortalShell>
  );
}
