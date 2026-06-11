'use client';

import { useEffect, useState } from 'react';
import { getFullDashboard } from '@/lib/admin-dashboard-client';

const TOKEN = 'dev-token';

const SECTIONS = [
  { key: 'guess-the-score', label: 'Guess the Score', href: '/admin/dashboard/guess-the-score', color: 'bg-blue-50 border-blue-200' },
  { key: 'fantasy-rules', label: 'Fantasy Rules', href: '/admin/dashboard/fantasy-rules', color: 'bg-purple-50 border-purple-200' },
  { key: 'fantasy-league', label: 'Fantasy League', href: '/admin/dashboard/fantasy-league', color: 'bg-indigo-50 border-indigo-200' },
  { key: 'league-management', label: 'League Management', href: '/admin/dashboard/league-management', color: 'bg-green-50 border-green-200' },
  { key: 'fixture-management', label: 'Fixture Management', href: '/admin/dashboard/fixture-management', color: 'bg-yellow-50 border-yellow-200' },
  { key: 'sponsor-management', label: 'Sponsor Management', href: '/admin/dashboard/sponsor-management', color: 'bg-orange-50 border-orange-200' },
  { key: 'content-moderation', label: 'Content Moderation', href: '/admin/dashboard/content-moderation', color: 'bg-red-50 border-red-200' },
  { key: 'reporting', label: 'Reporting Centre', href: '/admin/dashboard/reporting', color: 'bg-teal-50 border-teal-200' },
  { key: 'compliance', label: 'Compliance & POPIA Governance', href: '/admin/dashboard/compliance', color: 'bg-rose-50 border-rose-200' },
  { key: 'user-audience', label: 'User & Audience Intelligence', href: '/admin/dashboard/user-audience', color: 'bg-cyan-50 border-cyan-200' },
  { key: 'system-operations', label: 'System & Operations', href: '/admin/dashboard/system', color: 'bg-gray-50 border-gray-200' },
];

interface Dashboard {
  generatedAt: string;
  overview: Record<string, number>;
  health: Record<string, unknown>;
  actionRequired: { domain: string; message: string; severity: string; href?: string }[];
  quickLinks: { label: string; href: string; status?: string }[];
}

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getFullDashboard(TOKEN)
      .then(setDashboard)
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  const overview = dashboard?.overview ?? {};
  const actionRequired = dashboard?.actionRequired ?? [];

  return (
    <main className="max-w-6xl mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Command Centre</h1>
          <p className="text-xs text-gray-400 mt-0.5">PSL One — {dashboard?.generatedAt ? new Date(dashboard.generatedAt).toLocaleString() : '...'}</p>
        </div>
        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">LOCAL ONLY · NO AWS · NO KAFKA</span>
      </div>

      {loading && <p className="text-gray-500 text-sm">Loading dashboard...</p>}
      {error && <p className="text-red-600 text-sm">Error: {error}</p>}

      {/* Action Required Banner */}
      {actionRequired.length > 0 && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h2 className="text-sm font-semibold text-amber-800 mb-2">Action Required ({actionRequired.length})</h2>
          <ul className="space-y-1">
            {actionRequired.map((a, i) => (
              <li key={i} className="text-sm text-amber-700">
                {a.href ? <a href={a.href} className="underline">{a.message}</a> : a.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Overview KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Users', key: 'users' },
          { label: 'Fan Profiles', key: 'fans' },
          { label: 'Fixtures', key: 'fixtures' },
          { label: 'Fantasy Teams', key: 'fantasyTeams' },
          { label: 'Predictions', key: 'guessTheScorePredictions' },
          { label: 'Peer Challenges', key: 'peerChallenges' },
          { label: 'Reward Eligible', key: 'rewardEligible' },
          { label: 'Activity Items', key: 'activityItems' },
        ].map(({ label, key }) => (
          <div key={key} className="bg-white border rounded-lg p-3 text-center shadow-sm">
            <div className="text-xl font-bold text-gray-800">{overview[key] ?? 0}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Command Centre Sections */}
      <h2 className="text-lg font-semibold text-gray-700 mb-3">Command Centre</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        {SECTIONS.map(s => (
          <a key={s.key} href={s.href}
            className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${s.color}`}>
            <h3 className="font-semibold text-gray-800 text-sm">{s.label}</h3>
            <p className="text-xs text-gray-500 mt-1">View details →</p>
          </a>
        ))}
      </div>

      {/* Quick Links */}
      <h2 className="text-lg font-semibold text-gray-700 mb-3">Quick Links</h2>
      <div className="flex flex-wrap gap-2 mb-6">
        {(dashboard?.quickLinks ?? []).map((ql, i) => (
          <a key={i} href={ql.href}
            className="text-xs bg-white border rounded px-3 py-1.5 text-blue-600 hover:bg-blue-50 shadow-sm">
            {ql.label}
            {ql.status === 'PLANNED_IF_ROUTE_MISSING' && <span className="ml-1 text-gray-400">(planned)</span>}
          </a>
        ))}
      </div>

      {/* Health Banner */}
      {dashboard?.health && (
        <div className="bg-gray-50 border rounded-lg p-3 text-xs text-gray-500">
          <strong>Platform:</strong> {String(dashboard.health.database)} ·
          <strong> External Services:</strong> {String(dashboard.health.externalServices)} ·
          <strong> Payments:</strong> {String(dashboard.health.paymentsProvider)} ·
          <strong> Sponsor Marketplace:</strong> {String(dashboard.health.sponsorMarketplace)}
        </div>
      )}
    </main>
  );
}
