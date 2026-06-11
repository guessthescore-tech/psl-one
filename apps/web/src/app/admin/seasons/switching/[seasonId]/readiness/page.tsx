'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import { getSwitchReadiness } from '@/lib/season-context-client';
import Link from 'next/link';

interface ReadinessCheck {
  domain: string;
  label: string;
  severity: 'BLOCKER' | 'WARNING' | 'INFO';
  passed: boolean;
  detail: string;
}

interface ReadinessData {
  seasonId: string;
  seasonName: string;
  activationStatus: 'READY' | 'READY_WITH_WARNINGS' | 'BLOCKED';
  checks: ReadinessCheck[];
  blockers: ReadinessCheck[];
  warnings: ReadinessCheck[];
}

const severityBadge = (c: ReadinessCheck) => {
  if (!c.passed && c.severity === 'BLOCKER') return 'bg-red-100 text-red-700';
  if (!c.passed && c.severity === 'WARNING') return 'bg-yellow-100 text-yellow-700';
  if (c.passed) return 'bg-green-100 text-green-700';
  return 'bg-gray-100 text-gray-600';
};

const statusBanner = (status: string) => {
  if (status === 'READY') return 'bg-green-50 border-green-300 text-green-800';
  if (status === 'READY_WITH_WARNINGS') return 'bg-yellow-50 border-yellow-300 text-yellow-800';
  return 'bg-red-50 border-red-300 text-red-800';
};

export default function SeasonReadinessPage({ params }: { params: Promise<{ seasonId: string }> }) {
  const { seasonId } = use(params);
  const [data, setData] = useState<ReadinessData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSwitchReadiness(seasonId, 'dev-token')
      .then((d: unknown) => setData(d as ReadinessData))
      .catch((e: unknown) => setError(String(e)));
  }, [seasonId]);

  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;
  if (!data) return <div className="p-8 text-gray-500">Loading readiness…</div>;

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/admin/seasons/switching/${seasonId}`} className="text-blue-600 hover:underline text-sm">
          ← Back
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Activation Readiness</h1>
        <p className="text-sm text-gray-500 mt-1">{data.seasonName}</p>
      </div>

      <div className={`border rounded-lg p-4 ${statusBanner(data.activationStatus)}`}>
        <p className="font-semibold text-lg">{data.activationStatus.replace(/_/g, ' ')}</p>
        {data.activationStatus === 'BLOCKED' && (
          <p className="text-sm mt-1">Resolve blockers before activation.</p>
        )}
        {data.activationStatus === 'READY_WITH_WARNINGS' && (
          <p className="text-sm mt-1">Warnings can be acknowledged at activation time.</p>
        )}
        {data.activationStatus === 'READY' && (
          <p className="text-sm mt-1">All checks pass. Season is ready to activate.</p>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Cross-Domain Checks</h2>
        <div className="space-y-2">
          {data.checks.map((c, i) => (
            <div key={i} className="flex items-start gap-3 p-3 border border-gray-100 rounded-lg bg-white">
              <span className={`mt-0.5 px-2 py-0.5 rounded text-xs font-semibold ${severityBadge(c)}`}>
                {c.passed ? 'PASS' : c.severity}
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{c.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{c.detail}</p>
              </div>
              <span className="text-xs text-gray-400 uppercase">{c.domain}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        {data.activationStatus !== 'BLOCKED' && (
          <Link
            href={`/admin/seasons/switching/${seasonId}/preview`}
            className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            Preview Activation →
          </Link>
        )}
      </div>
    </div>
  );
}
