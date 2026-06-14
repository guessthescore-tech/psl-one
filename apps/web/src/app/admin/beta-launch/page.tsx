'use client';

import { useEffect, useState } from 'react';
import { adminGetBetaLaunchOverview, adminGetBetaLaunchSeasons } from '@/lib/beta-launch-client';
import Link from 'next/link';

export default function AdminBetaLaunchPage() {
  const [overview, setOverview] = useState<Record<string, unknown> | null>(null);
  const [seasons, setSeasons] = useState<unknown[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminGetBetaLaunchOverview()
      .then(d => setOverview(d as Record<string, unknown>))
      .catch(e => setError(String(e)));
    adminGetBetaLaunchSeasons()
      .then(d => setSeasons((d as { seasons: unknown[] }).seasons ?? []))
      .catch(() => null);
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Beta Launch Control</h1>
        <p className="text-sm text-gray-500 mt-1">13-check season readiness gate · cohort management · dry-run · approval</p>
      </div>

      <div className="bg-amber-50 border border-amber-300 rounded p-4 text-sm text-amber-800">
        <strong>Safety notice:</strong> PSL season activation has NOT been performed. This module provides readiness checks, dry-run analysis, cohort management, and approval records only. The activation step requires an explicit admin trigger in a controlled deployment window.
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {overview && (
        <div className="bg-white border rounded p-4 space-y-2">
          <h2 className="font-semibold">Platform Overview</h2>
          <p className="text-sm text-gray-600">{String((overview as Record<string, unknown>).notice ?? '')}</p>
          <dl className="grid grid-cols-2 gap-2 text-sm mt-2">
            <dt className="text-gray-500">Readiness checks</dt>
            <dd>{String((overview as Record<string, unknown>).readinessCheckCount ?? 13)}</dd>
            <dt className="text-gray-500">Smoke tests</dt>
            <dd>{String((overview as Record<string, unknown>).smokeTestCount ?? 24)}</dd>
          </dl>
        </div>
      )}

      <div className="space-y-2">
        <h2 className="font-semibold">Seasons</h2>
        {seasons.length === 0 && <p className="text-sm text-gray-400">Loading seasons…</p>}
        {(seasons as Array<{ id: string; name: string; status: string }>).map(s => (
          <div key={s.id} className="border rounded p-3 flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">{s.name}</p>
              <p className="text-xs text-gray-500">{s.status}</p>
            </div>
            <Link href={`/admin/beta-launch/${s.id}`} className="text-sm text-blue-600 hover:underline">
              View readiness →
            </Link>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <h2 className="font-semibold">Quick links</h2>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/beta-launch/smoke-tests" className="text-sm text-blue-600 hover:underline border rounded px-3 py-1">Smoke Tests</Link>
        </div>
      </div>
    </div>
  );
}
