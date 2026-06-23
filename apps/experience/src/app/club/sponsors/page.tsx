'use client';
/**
 * SPONSOR_REWARDS_NON_FINANCIAL - no cash payouts
 * NO_REAL_MONEY
 */

import { PortalShell } from '../../../components/portal/PortalShell';
import { StatusBadge } from '../../../components/portal/PortalStatusBadges';
import { CLUB_NAV_ITEMS } from '../../../lib/portal-routes';

const MOCK_SPONSORS = [
  { id: 's1', name: 'Castle Lager', type: 'Main Sponsor', status: 'active' },
  { id: 's2', name: 'DStv', type: 'Media Partner', status: 'active' },
];

export default function ClubSponsorsPage() {
  return (
    <PortalShell portalName="Club Portal" navItems={CLUB_NAV_ITEMS}>
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Sponsors</h1>
          <p className="text-slate-400 text-sm">Sponsor partnerships for your club. Rewards are non-financial only.</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Sponsor</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_SPONSORS.map((s) => (
                <tr key={s.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                  <td className="px-4 py-3 text-slate-200 font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-slate-400">{s.type}</td>
                  <td className="px-4 py-3"><StatusBadge label={s.status} variant="active" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-600">SPONSOR_REWARDS_NON_FINANCIAL — no cash payouts.</p>
      </div>
    </PortalShell>
  );
}
