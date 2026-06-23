'use client';
/**
 * SPONSOR_REWARDS_NON_FINANCIAL - no cash payouts
 * NO_REAL_MONEY
 */

import { PortalShell } from '../../../components/portal/PortalShell';
import { StatusBadge } from '../../../components/portal/PortalStatusBadges';
import { ADMIN_NAV_ITEMS } from '../../../lib/portal-routes';

const MOCK_SPONSORS = [
  { id: 's1', name: 'Castle Lager', industry: 'Beverages', status: 'active', campaigns: 2 },
  { id: 's2', name: 'DStv', industry: 'Media', status: 'active', campaigns: 1 },
  { id: 's3', name: 'MTN', industry: 'Telecoms', status: 'pending', campaigns: 1 },
  { id: 's4', name: 'Nedbank', industry: 'Finance', status: 'inactive', campaigns: 0 },
];

export default function AdminSponsorsPage() {
  return (
    <PortalShell portalName="Admin Portal" navItems={ADMIN_NAV_ITEMS}>
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Sponsors</h1>
          <p className="text-slate-400 text-sm">All sponsor partners. Rewards are non-financial — points, badges, digital experiences only.</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Sponsor</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Industry</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Campaigns</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_SPONSORS.map((s) => (
                <tr key={s.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                  <td className="px-4 py-3 text-slate-200 font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-slate-400">{s.industry}</td>
                  <td className="px-4 py-3">
                    <StatusBadge label={s.status} variant={s.status === 'active' ? 'active' : s.status === 'pending' ? 'warning' : 'inactive'} />
                  </td>
                  <td className="px-4 py-3 text-slate-400 font-mono">{s.campaigns}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-600">SPONSOR_REWARDS_NON_FINANCIAL — no cash payouts to sponsors or fans.</p>
      </div>
    </PortalShell>
  );
}
