'use client';
/**
 * PSL_INACTIVE - do not activate PSL season
 * NO_REAL_MONEY
 * RBAC enforced at API layer — never bypass RBAC
 */

import { PortalShell } from '../../../components/portal/PortalShell';
import { ADMIN_NAV_ITEMS } from '../../../lib/portal-routes';

const ROLES = [
  { role: 'PSL_ADMIN', description: 'Full league operations access. Can manage seasons, fixtures, rules, users, and all admin routes.', routes: 'All /admin/* routes' },
  { role: 'CLUB_ADMIN', description: 'Club portal access. Can manage own club profile, squad, and content.', routes: '/club/* routes' },
  { role: 'SPONSOR_ADMIN', description: 'Sponsor portal access. Can manage campaigns, audiences, and assets.', routes: '/sponsor/* routes' },
  { role: 'FAN', description: 'Fan-facing routes. GTS predictions, fantasy, social feed, etc.', routes: 'Public + authenticated fan routes' },
];

export default function AdminRolesPage() {
  return (
    <PortalShell portalName="Admin Portal" navItems={ADMIN_NAV_ITEMS}>
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Role Management</h1>
          <p className="text-slate-400 text-sm">RBAC role definitions. Role checks are enforced at the API layer — never bypassed in frontend.</p>
        </div>

        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4 text-sm text-yellow-300">
          RBAC is enforced at the NestJS API layer via @Roles() guards. Frontend only reads role for UI hints. Never bypass RBAC.
        </div>

        <div className="space-y-3">
          {ROLES.map((r) => (
            <div key={r.role} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-start justify-between gap-4 mb-2">
                <p className="text-sm font-bold text-white font-mono">{r.role}</p>
                <p className="text-xs text-slate-500 text-right">{r.routes}</p>
              </div>
              <p className="text-sm text-slate-400">{r.description}</p>
            </div>
          ))}
        </div>
      </div>
    </PortalShell>
  );
}
