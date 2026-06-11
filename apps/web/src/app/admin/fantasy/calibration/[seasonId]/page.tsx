'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getCalibrationReadiness } from '@/lib/fantasy-calibration-client';
import Link from 'next/link';

interface Check {
  code: string;
  severity: string;
  message: string;
  detail?: string;
}

interface Readiness {
  seasonId: string;
  seasonName: string;
  status: string;
  blockers: Check[];
  warnings: Check[];
  info: Check[];
}

export default function CalibrationSeasonPage() {
  const { seasonId } = useParams<{ seasonId: string }>();
  const [data, setData] = useState<Readiness | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!seasonId) return;
    getCalibrationReadiness(seasonId)
      .then((d) => setData(d as Readiness))
      .catch((e: unknown) => setError(String(e)));
  }, [seasonId]);

  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;
  if (!data) return <div className="p-8 text-gray-400">Loading…</div>;

  const statusColour =
    data.status === 'READY' ? 'bg-green-50 border-green-200 text-green-800' :
    data.status === 'READY_WITH_WARNINGS' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
    'bg-red-50 border-red-200 text-red-800';

  const links = [
    { href: 'readiness', label: 'Readiness Detail' },
    { href: 'rules', label: 'Fantasy Rules' },
    { href: 'players', label: 'Player Prices' },
    { href: 'gameweeks', label: 'Gameweek Deadlines' },
    { href: 'activation-impact', label: 'Activation Impact' },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <Link href="/admin/fantasy/calibration" className="text-sm text-blue-600 hover:underline">
          ← All Seasons
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">{data.seasonName}</h1>
        <p className="text-sm text-gray-500 mt-1">Fantasy Calibration Dashboard</p>
      </div>

      <div className={`border rounded-lg p-4 ${statusColour}`}>
        <p className="font-semibold">Status: {data.status.replace(/_/g, ' ')}</p>
        {data.blockers.length > 0 && (
          <p className="text-sm mt-1">{data.blockers.length} blocker(s) must be resolved before activation.</p>
        )}
        {data.warnings.length > 0 && (
          <p className="text-sm mt-1">{data.warnings.length} warning(s) require attention.</p>
        )}
      </div>

      {data.blockers.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-red-700 mb-2">Blockers</h2>
          <div className="space-y-2">
            {data.blockers.map((c) => (
              <div key={c.code} className="bg-red-50 border border-red-200 rounded p-3 text-sm">
                <p className="font-medium text-red-800">{c.message}</p>
                {c.detail && <p className="text-red-600 mt-1 text-xs">{c.detail}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {data.warnings.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-yellow-700 mb-2">Warnings</h2>
          <div className="space-y-2">
            {data.warnings.map((c) => (
              <div key={c.code} className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm">
                <p className="font-medium text-yellow-800">{c.message}</p>
                {c.detail && <p className="text-yellow-600 mt-1 text-xs">{c.detail}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-base font-semibold text-gray-800 mb-3">Calibration Actions</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {links.map((l) => (
            <Link
              key={l.href}
              href={`/admin/fantasy/calibration/${seasonId}/${l.href}`}
              className="block border border-gray-200 rounded-lg p-4 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-blue-300"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
