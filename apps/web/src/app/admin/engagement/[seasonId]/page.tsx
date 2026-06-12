'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getEngagementOverview } from '@/lib/admin-engagement-client';

interface EngagementOverview {
  seasonId: string;
  seasonName: string;
  seasonSlug: string;
  isActive: boolean;
  fanValue: { totalPoints: number; totalEntries: number; uniqueUsers: number; nonFinancial: boolean };
  fantasy: { totalNetPoints: number; totalGameweekScores: number; uniqueUsers: number; pointsOnly: boolean };
  predictions: { totalEntries: number; pointsOnly: boolean; note: string };
  achievements: { totalUnlocked: number; scope: string; note: string };
  legacyUnscoped: { count: number; note: string };
  safetyConfirmations: Record<string, boolean>;
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs font-medium text-gray-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

const SUB_PAGES = [
  { label: 'Leaderboards', href: 'leaderboards' },
  { label: 'Fan Value', href: 'fan-value' },
  { label: 'Fantasy', href: 'fantasy' },
  { label: 'Predictions', href: 'predictions' },
  { label: 'Achievements', href: 'achievements' },
  { label: 'Unscoped Ledger', href: 'unscoped-ledger' },
  { label: 'Scope Audit', href: 'season-scope-audit' },
  { label: 'Activation Impact', href: 'activation-impact' },
];

export default function AdminEngagementOverviewPage() {
  const { seasonId } = useParams<{ seasonId: string }>();
  const [data, setData] = useState<EngagementOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getEngagementOverview(seasonId)
      .then((d) => setData(d as EngagementOverview))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed'))
      .finally(() => setLoading(false));
  }, [seasonId]);

  return (
    <main className="max-w-3xl mx-auto p-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-2">
        <Link href="/admin" className="text-xs text-gray-400 hover:text-gray-600">Admin</Link>
        <span className="text-gray-300 text-xs">/</span>
        <Link href="/admin/engagement" className="text-xs text-gray-400 hover:text-gray-600">Engagement</Link>
        <span className="text-gray-300 text-xs">/</span>
        <span className="text-xs text-gray-600">{data?.seasonName ?? seasonId}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{data?.seasonName ?? seasonId}</h1>
          {data?.seasonSlug && <p className="text-xs text-gray-400 mt-0.5">{data.seasonSlug}</p>}
        </div>
        {data?.isActive && (
          <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
            Active Season
          </span>
        )}
      </div>

      {/* Sub-page nav */}
      <div className="flex gap-2 flex-wrap mb-6">
        {SUB_PAGES.map((p) => (
          <Link
            key={p.href}
            href={`/admin/engagement/${seasonId}/${p.href}`}
            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-xs font-medium transition-colors"
          >
            {p.label}
          </Link>
        ))}
      </div>

      {loading && <p className="text-sm text-gray-400">Loading…</p>}
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {data && !loading && (
        <div className="space-y-6">

          {/* Economy notes */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-amber-800">Fan Value — Non-Financial</p>
              <p className="text-xs text-amber-700 mt-1">No cash value. Cannot be withdrawn, deposited, or traded. Points-only engagement currency.</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-blue-800">Gameplay — Points Only</p>
              <p className="text-xs text-blue-700 mt-1">Fantasy and Guess the Score are free-to-play, points-only. No paid entry, no wagering, no stakes.</p>
            </div>
          </div>

          {/* Stat grid */}
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Season Engagement Summary</h2>
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                label="Fan Value Points"
                value={data.fanValue.totalPoints.toLocaleString()}
                sub={`${data.fanValue.uniqueUsers} fans · ${data.fanValue.totalEntries} entries · non-financial`}
              />
              <StatCard
                label="Fantasy Net Points"
                value={data.fantasy.totalNetPoints.toLocaleString()}
                sub={`${data.fantasy.uniqueUsers} managers · ${data.fantasy.totalGameweekScores} GW scores · points-only`}
              />
              <StatCard
                label="Predictions Entered"
                value={data.predictions.totalEntries.toLocaleString()}
                sub="Points-only · season derived from fixture"
              />
              <StatCard
                label="Achievements Unlocked"
                value={data.achievements.totalUnlocked.toLocaleString()}
                sub={`Scope: ${data.achievements.scope} · cross-season by design`}
              />
            </div>
          </div>

          {/* Legacy unscoped */}
          {data.legacyUnscoped.count > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-yellow-800">
                    {data.legacyUnscoped.count} Unscoped Legacy Entries
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">{data.legacyUnscoped.note}</p>
                </div>
                <Link
                  href={`/admin/engagement/${seasonId}/unscoped-ledger`}
                  className="text-xs text-yellow-700 underline shrink-0 ml-4"
                >
                  Review →
                </Link>
              </div>
            </div>
          )}
          {data.legacyUnscoped.count === 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-green-700">No unscoped legacy entries — season scope is clean.</p>
            </div>
          )}

          {/* World Cup / PSL separation */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Season Data Isolation</h2>
            <ul className="space-y-2 text-xs text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold mt-0.5">✓</span>
                <span><strong>World Cup history preserved.</strong> WC fan value, fantasy scores, and predictions remain accessible via <code className="bg-gray-100 px-1 rounded">?seasonSlug=fifa-world-cup-2026</code>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold mt-0.5">✓</span>
                <span><strong>PSL leaderboard starts clean.</strong> Season-scoped queries filter strictly by <code className="bg-gray-100 px-1 rounded">seasonId</code> — WC and PSL data do not mix.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold mt-0.5">✓</span>
                <span><strong>No destructive backfill.</strong> Legacy unscoped entries are preserved and visible to admin only.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold mt-0.5">ℹ</span>
                <span><strong>Prediction scope.</strong> PredictionPointsLedger has no seasonId column — season derived from <code className="bg-gray-100 px-1 rounded">fixture.seasonId</code> at query time.</span>
              </li>
            </ul>
          </div>

          {/* Safety confirmations */}
          <div className="border border-green-200 bg-green-50 rounded-lg p-4">
            <h2 className="text-xs font-semibold text-green-800 mb-3">Safety Confirmations</h2>
            <div className="grid grid-cols-2 gap-1.5">
              {Object.entries(data.safetyConfirmations).map(([k, v]) => (
                <div key={k} className="flex items-center gap-2 text-xs text-green-700">
                  <span className="font-bold">{v ? '✓' : '✗'}</span>
                  <span>{k.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cross-module links */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Related Admin Areas</h2>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/admin/seasons" className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 underline">
                Season Switching
              </Link>
              <Link href="/admin/operations/launch-readiness" className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 underline">
                Launch Readiness
              </Link>
              <Link href="/admin/fantasy" className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 underline">
                Fantasy Calibration
              </Link>
              <Link href="/admin/predictions" className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 underline">
                Prediction Rules
              </Link>
              <Link href={`/admin/engagement/${seasonId}/season-scope-audit`} className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 underline">
                Scope Audit
              </Link>
              <Link href={`/admin/engagement/${seasonId}/activation-impact`} className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 underline">
                Activation Impact
              </Link>
            </div>
          </div>

        </div>
      )}
    </main>
  );
}
