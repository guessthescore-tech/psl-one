'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getPredictionCalibrationReadiness } from '@/lib/prediction-calibration-client';
import Link from 'next/link';

interface CalibrationCheck {
  domain: string;
  label: string;
  severity: string;
  passed: boolean;
  detail: string;
}

interface ReadinessData {
  seasonId: string;
  seasonName: string;
  activationStatus: string;
  checks: CalibrationCheck[];
  blockers: CalibrationCheck[];
  warnings: CalibrationCheck[];
}

export default function PredictionCalibrationDashboard() {
  const { seasonId } = useParams<{ seasonId: string }>();
  const [data, setData] = useState<ReadinessData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPredictionCalibrationReadiness(seasonId)
      .then((d) => setData(d as ReadinessData))
      .catch((e: unknown) => setError(String(e)));
  }, [seasonId]);

  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;
  if (!data) return <div className="p-8 text-gray-500">Loading…</div>;

  const statusColor = data.activationStatus === 'READY'
    ? 'bg-green-100 text-green-800'
    : data.activationStatus === 'READY_WITH_WARNINGS'
      ? 'bg-yellow-100 text-yellow-800'
      : 'bg-red-100 text-red-800';

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{data.seasonName} — Prediction Calibration</h1>
        <span className={`text-sm font-medium px-3 py-1 rounded-full ${statusColor}`}>
          {data.activationStatus}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <Link href={`/admin/predictions/calibration/${seasonId}/rules`} className="p-4 border rounded-lg hover:bg-gray-50 text-blue-600 font-medium">Prediction Rules →</Link>
        <Link href={`/admin/predictions/calibration/${seasonId}/fixtures`} className="p-4 border rounded-lg hover:bg-gray-50 text-blue-600 font-medium">Fixture Eligibility →</Link>
        <Link href={`/admin/predictions/calibration/${seasonId}/locks`} className="p-4 border rounded-lg hover:bg-gray-50 text-blue-600 font-medium">Lock Readiness →</Link>
        <Link href={`/admin/predictions/calibration/${seasonId}/settlement`} className="p-4 border rounded-lg hover:bg-gray-50 text-blue-600 font-medium">Settlement Readiness →</Link>
        <Link href={`/admin/predictions/calibration/${seasonId}/peer-challenges`} className="p-4 border rounded-lg hover:bg-gray-50 text-blue-600 font-medium">Peer Challenges →</Link>
        <Link href={`/admin/predictions/calibration/${seasonId}/activation-impact`} className="p-4 border rounded-lg hover:bg-gray-50 text-blue-600 font-medium">Activation Impact →</Link>
      </div>

      <div>
        <h2 className="font-semibold mb-2">Readiness Checks</h2>
        <div className="space-y-2">
          {data.checks.map((c, i) => (
            <div key={i} className={`flex items-start gap-3 p-3 rounded border text-sm ${c.passed ? 'bg-green-50 border-green-200' : c.severity === 'BLOCKER' ? 'bg-red-50 border-red-200' : c.severity === 'WARNING' ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'}`}>
              <span className="mt-0.5">{c.passed ? '✓' : c.severity === 'BLOCKER' ? '✗' : '⚠'}</span>
              <div>
                <div className="font-medium">{c.label}</div>
                <div className="text-gray-600">{c.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
