'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getPredictionCalibrationReadiness } from '@/lib/prediction-calibration-client';

interface CalibrationCheck {
  domain: string;
  label: string;
  severity: string;
  passed: boolean;
  detail: string;
}

export default function PredictionReadinessPage() {
  const { seasonId } = useParams<{ seasonId: string }>();
  const [data, setData] = useState<{ seasonName: string; activationStatus: string; checks: CalibrationCheck[]; blockers: CalibrationCheck[]; warnings: CalibrationCheck[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPredictionCalibrationReadiness(seasonId)
      .then((d) => setData(d as typeof data))
      .catch((e: unknown) => setError(String(e)));
  }, [seasonId]);

  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;
  if (!data) return <div className="p-8 text-gray-500">Loading…</div>;

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">{data.seasonName} — Prediction Readiness Detail</h1>

      {data.blockers.length > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <h2 className="font-semibold text-red-700 mb-2">Blockers ({data.blockers.length})</h2>
          {data.blockers.map((b, i) => <p key={i} className="text-sm text-red-600">{b.label}: {b.detail}</p>)}
        </div>
      )}

      {data.warnings.length > 0 && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
          <h2 className="font-semibold text-yellow-700 mb-2">Warnings ({data.warnings.length})</h2>
          {data.warnings.map((w, i) => <p key={i} className="text-sm text-yellow-600">{w.label}: {w.detail}</p>)}
        </div>
      )}

      <div className="space-y-2">
        {data.checks.map((c, i) => (
          <div key={i} className={`p-3 rounded border text-sm ${c.passed ? 'bg-green-50 border-green-200' : c.severity === 'BLOCKER' ? 'bg-red-50 border-red-200' : c.severity === 'WARNING' ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'}`}>
            <span className="font-medium">[{c.domain}] {c.label}</span>
            <p className="text-gray-600">{c.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
