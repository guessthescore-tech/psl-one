'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getBetaOverview } from '@/lib/beta-feedback-client';

interface Overview {
  betaStatus: string;
  totalKnownIssues: number;
  highPriorityCount: number;
  uxChecklistPasses: number;
  uxChecklistWarnings: number;
  uxChecklistFails: number;
  releaseReadiness: string;
  completedStories: number;
  apiTestCount: number;
  webPageCount: number;
  recommendedNextActions: string[];
  safetyStatus: string;
  generatedAt: string;
}

const READINESS_COLOURS: Record<string, string> = {
  WORLD_CUP_BETA_READY_PSL_PENDING: 'bg-blue-100 text-blue-800',
  BETA_READY: 'bg-green-100 text-green-800',
  BLOCKED: 'bg-red-100 text-red-800',
};

const SUB_PAGES = [
  { href: 'beta-feedback/known-issues', label: 'Known Issues', description: 'Structured issue list with severity and sprint mapping' },
  { href: 'beta-feedback/ux-checklist', label: 'UX Checklist', description: 'Fan and admin journey readiness by area' },
  { href: 'beta-feedback/release-notes', label: 'Release Notes', description: 'Story-by-story delivery summary with safety boundaries' },
];

const RELATED = [
  { href: '/admin/operations/launch-readiness', label: 'Launch Readiness' },
  { href: '/admin/operations/capability-review', label: 'Capability Review' },
  { href: '/admin/operations/module-readiness', label: 'Module Readiness' },
  { href: '/admin/engagement', label: 'Engagement Metrics' },
  { href: '/admin/player-stats', label: 'Player Stats' },
];

export default function AdminBetaFeedbackPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getBetaOverview()
      .then((d) => setData(d as Overview))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="max-w-4xl mx-auto p-4">
      <div className="flex items-center gap-2 mb-1 text-xs text-gray-400">
        <Link href="/admin/operations" className="hover:text-gray-600">Operations</Link>
        <span>/</span>
        <span className="text-gray-600">Beta Feedback</span>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">Beta Feedback & Readiness</h1>
        <Link href="/admin" className="text-sm text-blue-600 underline">Admin</Link>
      </div>

      <p className="text-xs text-gray-500 mb-6">
        Sprint 2 beta readiness overview. No production commercial integrations enabled. Fantasy and Guess the Score are points-only.
      </p>

      {loading && <p className="text-sm text-gray-400">Loading…</p>}
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {data && !loading && (
        <div className="space-y-6">
          {/* Status Banner */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <span className={`px-2 py-1 rounded text-xs font-semibold ${READINESS_COLOURS[data.releaseReadiness] ?? 'bg-gray-100 text-gray-700'}`}>
                {data.releaseReadiness.replace(/_/g, ' ')}
              </span>
              <span className="text-xs text-gray-400">{data.betaStatus}</span>
              <span className="text-xs text-green-600 font-medium">Safety: {data.safetyStatus}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Known Issues', value: data.totalKnownIssues, sub: `${data.highPriorityCount} high` },
                { label: 'UX Passes', value: data.uxChecklistPasses, sub: `${data.uxChecklistWarnings} warn` },
                { label: 'Stories Done', value: data.completedStories, sub: 'STORY-26–35' },
                { label: 'API Tests', value: data.apiTestCount.toLocaleString(), sub: `${data.webPageCount} pages` },
              ].map((c) => (
                <div key={c.label} className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-gray-900">{c.value}</p>
                  <p className="text-xs text-gray-500">{c.label}</p>
                  <p className="text-xs text-gray-400">{c.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sub-pages */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {SUB_PAGES.map((p) => (
              <Link
                key={p.href}
                href={`/admin/${p.href}`}
                className="block bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300"
              >
                <p className="font-semibold text-sm text-gray-900">{p.label}</p>
                <p className="text-xs text-gray-500 mt-1">{p.description}</p>
              </Link>
            ))}
          </div>

          {/* Recommended Actions */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h2 className="font-semibold text-sm text-amber-800 mb-2">Recommended Next Actions</h2>
            <ul className="space-y-1">
              {data.recommendedNextActions.map((action, i) => (
                <li key={i} className="text-xs text-amber-700 flex gap-1.5">
                  <span className="text-amber-400 flex-shrink-0">→</span>
                  {action}
                </li>
              ))}
            </ul>
          </div>

          {/* Related Admin Areas */}
          <div>
            <p className="text-xs text-gray-400 mb-2 font-medium">Related Admin Areas</p>
            <div className="flex flex-wrap gap-2">
              {RELATED.map((r) => (
                <Link key={r.href} href={r.href} className="text-xs bg-gray-50 border border-gray-200 text-gray-600 px-2 py-1 rounded hover:bg-gray-100">
                  {r.label}
                </Link>
              ))}
            </div>
          </div>

          <p className="text-xs text-gray-300">Generated {new Date(data.generatedAt).toLocaleString()}</p>
        </div>
      )}
    </main>
  );
}
