'use client';

import { useEffect, useState } from 'react';
import { adminGetComplianceStatus } from '@/lib/admin-social-prediction-client';
import { getBetaToken } from '@/lib/auth-client';

export default function CompliancePage() {
  const [status, setStatus] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminGetComplianceStatus(getBetaToken())
      .then(d => setStatus(d))
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-1">Social Prediction Compliance Status</h1>
      <p className="text-xs text-gray-500 mb-5">
        PSL One social prediction challenges use system-issued gameplay points only. Gameplay points cannot be
        purchased, transferred, withdrawn or exchanged for money. Challenge results affect platform scoring and
        leaderboard positions only.
      </p>

      {loading && <p className="text-gray-500 text-sm">Loading...</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}

      {status && (
        <div className="space-y-4">
          <div className="border rounded-lg p-5 bg-white shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold">Compliance Domain</p>
              <span className={`text-xs px-2 py-1 rounded font-medium ${
                String(status['status']) === 'APPROVED' ? 'bg-green-50 text-green-700' :
                String(status['status']) === 'INTERNAL_REVIEW_REQUIRED' ? 'bg-yellow-50 text-yellow-700' :
                'bg-red-50 text-red-700'
              }`}>
                {String(status['status'])}
              </span>
            </div>
            <p className="text-xs text-gray-500 font-mono mb-2">{String(status['domainKey'])}</p>
            <p className="text-sm text-gray-700">{String(status['description'] ?? '')}</p>
          </div>

          <div className="border rounded-lg p-5 bg-white shadow-sm">
            <p className="font-semibold mb-3">Boundary Controls</p>
            <ul className="space-y-2 text-sm text-gray-600">
              {(status['boundaryControls'] as string[] ?? []).map((c, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>

          {status['reviewItems'] != null && (
            <div className="border rounded-lg p-5 bg-yellow-50">
              <p className="font-semibold mb-3 text-yellow-800">Review Items</p>
              <ul className="space-y-2 text-sm text-yellow-700">
                {(status['reviewItems'] as string[]).map((r, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-0.5">⚠</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="text-xs text-gray-400 border-t pt-3">
            Fan Value is a separate non-financial loyalty score and is not used to fund prediction challenges.
          </div>
        </div>
      )}
    </main>
  );
}
