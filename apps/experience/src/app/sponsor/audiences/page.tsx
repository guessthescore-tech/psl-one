'use client';
/**
 * SPONSOR_REWARDS_NON_FINANCIAL - no cash payouts
 * NO_REAL_MONEY
 */

import { PortalShell } from '../../../components/portal/PortalShell';
import { PortalMetricCard } from '../../../components/portal/PortalMetricCard';
import { SPONSOR_NAV_ITEMS } from '../../../lib/portal-routes';

const MOCK_AUDIENCES = [
  { id: 'a1', name: 'Active GTS Players', size: 4200, criteria: ['Placed 3+ predictions', 'Active last 7 days'] },
  { id: 'a2', name: 'Fantasy Team Managers', size: 2800, criteria: ['Has fantasy team', 'Made transfer this week'] },
  { id: 'a3', name: 'Kaizer Chiefs Fans', size: 1900, criteria: ['KC fan registration', 'SA location'] },
  { id: 'a4', name: 'High-Engagement Fans', size: 800, criteria: ['Top 5% by points', 'Daily active'] },
];

export default function SponsorAudiencesPage() {
  return (
    <PortalShell portalName="Sponsor Portal" navItems={SPONSOR_NAV_ITEMS}>
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Audiences</h1>
          <p className="text-slate-400 text-sm">Target fan segments for your campaigns. Data is anonymised for privacy.</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <PortalMetricCard label="Total Audiences" value={MOCK_AUDIENCES.length} />
          <PortalMetricCard label="Total Reach" value="9.7K" description="Beta context" />
          <PortalMetricCard label="Data Privacy" value="POPIA" description="Anonymised fan data" />
        </div>

        <div className="space-y-3">
          {MOCK_AUDIENCES.map((a) => (
            <div key={a.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between gap-4 mb-2">
                <p className="text-sm font-semibold text-slate-200">{a.name}</p>
                <p className="text-sm font-mono text-slate-300">{a.size.toLocaleString()} fans</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {a.criteria.map((c, i) => (
                  <span key={i} className="px-2 py-0.5 bg-slate-800 rounded text-xs text-slate-400">{c}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PortalShell>
  );
}
