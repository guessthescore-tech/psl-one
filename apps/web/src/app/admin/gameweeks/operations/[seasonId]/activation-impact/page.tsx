'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getActivationImpact } from '@/lib/gameweek-operations-client';
import Link from 'next/link';

interface DomainStatus {
  domain: string;
  status: string;
  blockers: string[];
  warnings: string[];
}

interface ActivationImpactData {
  seasonId: string;
  seasonName: string;
  overallReadiness: string;
  domains: DomainStatus[];
  totalBlockers: number;
  totalWarnings: number;
}

export default function ActivationImpactPage() {
  const { seasonId } = useParams<{ seasonId: string }>();
  const [data, setData] = useState<ActivationImpactData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!seasonId) return;
    getActivationImpact(seasonId)
      .then((d) => setData(d as ActivationImpactData))
      .catch((e: unknown) => setError(String(e)));
  }, [seasonId]);

  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;
  if (!data) return <div className="p-8 text-gray-500">Loading…</div>;

  const overallColour = data.overallReadiness === 'READY'
    ? 'bg-green-100 text-green-800 border-green-200'
    : data.overallReadiness === 'BLOCKED'
    ? 'bg-red-100 text-red-800 border-red-200'
    : 'bg-yellow-100 text-yellow-800 border-yellow-200';

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <p className="text-sm text-gray-500">
          <Link href="/admin/gameweeks/operations" className="hover:underline">Operations</Link>{' '}
          / <Link href={`/admin/gameweeks/operations/${seasonId}`} className="hover:underline">{data.seasonName}</Link>{' '}
          / Activation Impact
        </p>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">Activation Impact</h1>
      </div>

      <div className={`border rounded-lg p-4 ${overallColour}`}>
        <p className="text-sm font-semibold">Overall Readiness: {data.overallReadiness}</p>
        <p className="text-xs mt-0.5">
          {data.totalBlockers ?? 0} blocker(s) · {data.totalWarnings ?? 0} warning(s)
        </p>
      </div>

      {(data.domains ?? []).length > 0 && (
        <div className="space-y-3">
          {data.domains.map((domain) => {
            const colour = domain.status === 'READY'
              ? 'border-green-200 bg-green-50'
              : domain.status === 'BLOCKED'
              ? 'border-red-200 bg-red-50'
              : 'border-yellow-200 bg-yellow-50';
            return (
              <div key={domain.domain} className={`border rounded-lg p-4 ${colour}`}>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900 capitalize">{domain.domain}</p>
                  <span className="text-xs font-medium text-gray-700">{domain.status}</span>
                </div>
                {domain.blockers?.length > 0 && (
                  <ul className="mt-2 list-disc list-inside space-y-0.5">
                    {domain.blockers.map((b, i) => <li key={i} className="text-xs text-red-700">{b}</li>)}
                  </ul>
                )}
                {domain.warnings?.length > 0 && (
                  <ul className="mt-2 list-disc list-inside space-y-0.5">
                    {domain.warnings.map((w, i) => <li key={i} className="text-xs text-yellow-700">{w}</li>)}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
