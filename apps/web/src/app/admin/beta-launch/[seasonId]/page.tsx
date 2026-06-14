'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { adminGetReadiness } from '@/lib/beta-launch-client';
import Link from 'next/link';

interface ReadinessCheck {
  key: string;
  category: string;
  label: string;
  status: string;
  isBlocker: boolean;
  message: string;
}

interface ReadinessResult {
  seasonId: string;
  seasonName: string;
  overallStatus: string;
  blockerCount: number;
  warningCount: number;
  checks: ReadinessCheck[];
  notice: string;
}

export default function AdminBetaSeasonPage() {
  const { seasonId } = useParams<{ seasonId: string }>();
  const [data, setData] = useState<ReadinessResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminGetReadiness(seasonId)
      .then(d => setData(d as ReadinessResult))
      .catch(e => setError(String(e)));
  }, [seasonId]);

  const statusColour = (s: string) =>
    s === 'READY' ? 'text-green-700 bg-green-50' :
    s === 'READY_WITH_WARNINGS' ? 'text-amber-700 bg-amber-50' :
    'text-red-700 bg-red-50';

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Beta Launch — Season Overview</h1>
        <p className="text-xs text-gray-400 font-mono mt-1">{seasonId}</p>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {data && (
        <>
          <div className={`rounded px-4 py-3 font-semibold text-sm ${statusColour(data.overallStatus)}`}>
            {data.overallStatus} — {data.blockerCount} blockers, {data.warningCount} warnings
          </div>

          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-3">{data.notice}</p>

          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Readiness', href: 'readiness' },
              { label: 'Blockers', href: 'blockers' },
              { label: 'Warnings', href: 'warnings' },
              { label: 'Frontend', href: 'frontend' },
              { label: 'Data', href: 'data' },
              { label: 'Security', href: 'security' },
              { label: 'Operations', href: 'operations' },
              { label: 'Beta Cohort', href: 'cohort' },
              { label: 'Activation Preview', href: 'activation-preview' },
              { label: 'Dry Run', href: 'dry-run' },
              { label: 'Rollback Dry Run', href: 'rollback-dry-run' },
              { label: 'Approval', href: 'approval' },
              { label: 'Walkthrough', href: 'walkthrough' },
              { label: 'Runbook', href: 'runbook' },
            ].map(({ label, href }) => (
              <Link
                key={href}
                href={`/admin/beta-launch/${seasonId}/${href}`}
                className="border rounded p-3 text-sm hover:bg-gray-50 flex items-center justify-between"
              >
                <span>{label}</span>
                <span className="text-gray-400">→</span>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
