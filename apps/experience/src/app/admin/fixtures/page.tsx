'use client';
/**
 * PSL_INACTIVE - do not activate PSL season
 * NO_PRODUCTION_INGESTION
 * NO_SCHEDULED_INGESTION
 * NO_REAL_MONEY
 */

import { PortalShell } from '../../../components/portal/PortalShell';
import { StatusBadge } from '../../../components/portal/PortalStatusBadges';
import { PortalMetricCard } from '../../../components/portal/PortalMetricCard';
import { ADMIN_NAV_ITEMS } from '../../../lib/portal-routes';

const FIXTURE_SUMMARY = { total: 104, published: 104, unpublished: 0, ingestSource: 'SOURCE_EMPTY' };

const MOCK_FIXTURES = [
  { id: 'f1', home: 'Argentina', away: 'France', status: 'SCHEDULED', published: true, kickoff: '2026-07-19 18:00' },
  { id: 'f2', home: 'Brazil', away: 'England', status: 'SCHEDULED', published: true, kickoff: '2026-07-17 15:00' },
  { id: 'f3', home: 'Spain', away: 'Germany', status: 'FINISHED', published: true, kickoff: '2026-07-14 20:00' },
];

export default function AdminFixturesPage() {
  return (
    <PortalShell portalName="Admin Portal" navItems={ADMIN_NAV_ITEMS}>
      <div className="max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Fixtures</h1>
          <p className="text-slate-400 text-sm">
            Fixture management. No production ingestion. No scheduled ingestion. PSL inactive.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <PortalMetricCard label="Total Fixtures" value={FIXTURE_SUMMARY.total} />
          <PortalMetricCard label="Published" value={FIXTURE_SUMMARY.published} trend="up" trendLabel="All published" />
          <PortalMetricCard label="Unpublished" value={FIXTURE_SUMMARY.unpublished} />
          <PortalMetricCard label="Ingest Source" value="Source Empty" description="NO_PRODUCTION_INGESTION" />
        </div>

        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4 text-sm text-yellow-400">
          Ingestion source is empty — PSL fixtures not yet available from provider. No scheduled ingestion is active.
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-200">Recent Fixtures (WC 2026 Beta)</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Match</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Kickoff</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Published</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_FIXTURES.map((f) => (
                <tr key={f.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3 text-slate-200">{f.home} vs {f.away}</td>
                  <td className="px-4 py-3 text-slate-400">{f.kickoff}</td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      label={f.status}
                      variant={f.status === 'FINISHED' ? 'info' : 'warning'}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge label={f.published ? 'Published' : 'Draft'} variant={f.published ? 'active' : 'warning'} />
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
