'use client';
/**
 * SPONSOR_REWARDS_NON_FINANCIAL - no cash payouts
 * NO_REAL_MONEY
 */

import { PortalShell } from '../../../components/portal/PortalShell';
import { StatusBadge } from '../../../components/portal/PortalStatusBadges';
import { SPONSOR_NAV_ITEMS } from '../../../lib/portal-routes';

const MOCK_ACTIVATIONS = [
  { id: 'act1', campaign: 'WC 2026 Fan Activation', type: 'GOAL_SCORED', fans: 342, ts: '2026-07-07T20:34:00Z' },
  { id: 'act2', campaign: 'WC 2026 Fan Activation', type: 'PREDICTION_STREAK', fans: 128, ts: '2026-07-06T18:00:00Z' },
  { id: 'act3', campaign: 'WC 2026 Fan Activation', type: 'MATCH_START', fans: 2400, ts: '2026-07-05T15:00:00Z' },
];

export default function SponsorActivationsPage() {
  return (
    <PortalShell portalName="Sponsor Portal" navItems={SPONSOR_NAV_ITEMS}>
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Activations</h1>
          <p className="text-slate-400 text-sm">Campaign activation triggers and fan responses. Rewards are non-financial.</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Trigger</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Campaign</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Fans Reached</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_ACTIVATIONS.map((a) => (
                <tr key={a.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                  <td className="px-4 py-3 text-slate-300 font-mono text-xs">{a.type}</td>
                  <td className="px-4 py-3 text-slate-400">{a.campaign}</td>
                  <td className="px-4 py-3 text-slate-300 font-mono">{a.fans.toLocaleString()}</td>
                  <td className="px-4 py-3"><StatusBadge label="DELIVERED" variant="active" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-600">SPONSOR_REWARDS_NON_FINANCIAL — no cash payouts on any activation.</p>
      </div>
    </PortalShell>
  );
}
