'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { use } from 'react';
import { getPriceCalibrationActivationDryRun } from '@/lib/fantasy-price-calibration-client';

interface SafetyConfirmations {
  worldCupHistoryPreserved: boolean;
  pslActivationNotPerformed: boolean;
  productionMoneyMovementDisabled: boolean;
  checkoutTicketingLiveProviderDisabled: boolean;
  fantasyPointsOnly: boolean;
  fanValueNonFinancial: boolean;
  pricesHaveNoCashValue: boolean;
}

interface DryRun {
  seasonId: string;
  seasonName: string;
  dryRunOnly: boolean;
  activationWillNotBePerformed: boolean;
  readinessStatus: string;
  blockerCount: number;
  warningCount: number;
  passedCheckCount: number;
  failedCheckCount: number;
  domainChecks: Record<string, unknown>[];
  nextActions: string[];
  safetyConfirmations: SafetyConfirmations;
}

export default function PriceCalibrationDryRunPage({ params }: { params: Promise<{ seasonId: string }> }) {
  const { seasonId } = use(params);
  const [data, setData] = useState<DryRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPriceCalibrationActivationDryRun(seasonId)
      .then(setData)
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [seasonId]);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-4">
        <Link href={`/admin/fantasy-price-calibration/${seasonId}`} className="text-sm text-blue-600 hover:underline">← Calibration Overview</Link>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Activation Dry Run — Price Calibration</h1>

      {loading && <p className="text-gray-500">Loading…</p>}
      {error && <p className="text-red-600 bg-red-50 rounded p-3">{error}</p>}

      {data && (
        <>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800 font-semibold text-sm">READ-ONLY DRY RUN</p>
            <p className="text-blue-700 text-sm mt-1">
              {data.dryRunOnly && data.activationWillNotBePerformed
                ? 'Simulation only. No state changes will occur.'
                : 'Warning: dry run safety flags missing.'}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Status', value: data.readinessStatus },
              { label: 'Blockers', value: data.blockerCount },
              { label: 'Warnings', value: data.warningCount },
              { label: 'Passed Checks', value: data.passedCheckCount },
            ].map(s => (
              <div key={s.label} className="border rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-gray-900">{s.value}</div>
                <div className="text-xs text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {data.nextActions.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="font-medium text-yellow-800 mb-2">Next Actions Required</p>
              <ul className="space-y-1">
                {data.nextActions.map((a, i) => (
                  <li key={i} className="text-sm text-yellow-700">→ {a}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="border rounded-lg p-4 mb-6">
            <p className="font-medium text-gray-800 mb-3">Safety Confirmations</p>
            <ul className="space-y-1">
              {Object.entries(data.safetyConfirmations).map(([k, v]) => (
                <li key={k} className="flex items-center gap-2 text-sm">
                  <span className={v ? 'text-green-600' : 'text-red-600'}>{v ? '✓' : '✗'}</span>
                  <span className="text-gray-700">{k}</span>
                </li>
              ))}
            </ul>
            {data.safetyConfirmations.pricesHaveNoCashValue && (
              <p className="text-xs text-gray-500 mt-3 italic">Fantasy prices are game-value only. No cash value, market value, or monetary meaning.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
