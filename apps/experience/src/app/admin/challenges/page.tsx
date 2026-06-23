'use client';
/**
 * GTS_POINTS_ONLY - no real-money
 * NO_REAL_MONEY
 */

import { PortalShell } from '../../../components/portal/PortalShell';
import { StatusBadge } from '../../../components/portal/PortalStatusBadges';
import { PortalMetricCard } from '../../../components/portal/PortalMetricCard';
import { ADMIN_NAV_ITEMS } from '../../../lib/portal-routes';

const MOCK_CHALLENGES = [
  { id: 'c1', challenger: 'fan_a', opponent: 'fan_b', fixture: 'ARG vs FRA', status: 'PENDING', stake: 'Points only' },
  { id: 'c2', challenger: 'fan_c', opponent: 'fan_d', fixture: 'BRA vs ENG', status: 'ACCEPTED', stake: 'Points only' },
  { id: 'c3', challenger: 'fan_e', opponent: 'fan_f', fixture: 'ESP vs GER', status: 'SETTLED', stake: 'Points only' },
];

export default function AdminChallengesPage() {
  return (
    <PortalShell portalName="Admin Portal" navItems={ADMIN_NAV_ITEMS}>
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Challenges</h1>
          <p className="text-slate-400 text-sm">Token challenges between fans — GTS points only, no real money.</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <PortalMetricCard label="Active Challenges" value={1} />
          <PortalMetricCard label="Total Challenges" value={3} />
          <PortalMetricCard label="Stake Type" value="Points Only" description="GTS_POINTS_ONLY" />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Challenger</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Opponent</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Fixture</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Stake</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_CHALLENGES.map((c) => (
                <tr key={c.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                  <td className="px-4 py-3 text-slate-200">{c.challenger}</td>
                  <td className="px-4 py-3 text-slate-400">{c.opponent}</td>
                  <td className="px-4 py-3 text-slate-400">{c.fixture}</td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      label={c.status}
                      variant={c.status === 'SETTLED' ? 'info' : c.status === 'ACCEPTED' ? 'active' : 'warning'}
                    />
                  </td>
                  <td className="px-4 py-3 text-purple-400 text-xs font-semibold">{c.stake}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-600">All challenges use GTS points tokens only — no real money, no gambling.</p>
      </div>
    </PortalShell>
  );
}
