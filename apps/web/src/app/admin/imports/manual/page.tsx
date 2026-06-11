'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { validateImportPayload, commitImport, type ValidationResult } from '@/lib/admin-imports-client';

const SAMPLE = JSON.stringify(
  {
    source: 'MANUAL',
    sourceType: 'JSON_FILE',
    competition: {
      externalId: 'psl-premiership',
      name: 'PSL Premiership',
      slug: 'psl-premiership',
      format: 'LEAGUE',
      teamCount: 16,
      hasGroups: false,
      hasKnockouts: false,
      hasHomeAway: true,
      usesNeutralVenues: false,
      pointsForWin: 3,
      pointsForDraw: 1,
      pointsForLoss: 0,
    },
  },
  null,
  2,
);

export default function ManualImportPage() {
  const router = useRouter();
  const [json, setJson] = useState(SAMPLE);
  const [parseError, setParseError] = useState<string | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [validating, setValidating] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [commitError, setCommitError] = useState<string | null>(null);

  function parseJson(): unknown | null {
    try { const p = JSON.parse(json); setParseError(null); return p; }
    catch { setParseError('Invalid JSON — check syntax'); return null; }
  }

  async function handleValidate() {
    const payload = parseJson();
    if (!payload) return;
    setValidating(true);
    setValidation(null);
    try { setValidation(await validateImportPayload(payload)); }
    catch (e: unknown) { setParseError(e instanceof Error ? e.message : 'Validate failed'); }
    finally { setValidating(false); }
  }

  async function handleCommit() {
    const payload = parseJson();
    if (!payload) return;
    setCommitting(true);
    setCommitError(null);
    try {
      const result = await commitImport(payload);
      router.push(`/admin/imports/${result.jobId}`);
    } catch (e: unknown) {
      setCommitError(e instanceof Error ? e.message : 'Commit failed');
      setCommitting(false);
    }
  }

  const total = validation
    ? Object.values(validation.previewCounts).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Manual Import</h1>
      <p className="text-sm text-gray-500 mb-6">Paste a provider-neutral import payload. Validate first, then commit.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payload editor */}
        <div>
          <label className="block text-sm font-medium mb-1">Import Payload (JSON)</label>
          {parseError && <p className="text-red-600 text-xs mb-2">{parseError}</p>}
          <textarea
            value={json}
            onChange={(e) => { setJson(e.target.value); setValidation(null); }}
            rows={24}
            className="w-full border rounded px-3 py-2 text-xs font-mono"
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleValidate}
              disabled={validating}
              className="px-4 py-2 border rounded text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              {validating ? 'Validating...' : 'Validate'}
            </button>
            <button
              onClick={handleCommit}
              disabled={committing || (validation !== null && !validation.isValid)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm disabled:opacity-50"
            >
              {committing ? 'Committing...' : 'Validate & Commit'}
            </button>
          </div>
          {commitError && <p className="text-red-600 text-sm mt-2">{commitError}</p>}
        </div>

        {/* Validation result */}
        <div>
          {!validation && (
            <div className="border rounded p-4 bg-gray-50 text-gray-400 text-sm h-full flex items-center justify-center">
              Click Validate to see preview
            </div>
          )}
          {validation && (
            <div className="space-y-4">
              <div className={`border rounded p-3 ${validation.isValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <p className={`font-semibold text-sm ${validation.isValid ? 'text-green-700' : 'text-red-700'}`}>
                  {validation.isValid ? 'Valid — ready to commit' : `Invalid — ${validation.errors.length} error${validation.errors.length !== 1 ? 's' : ''}`}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">Format: {validation.detectedFormat} · {total} total records</p>
              </div>

              {/* Preview counts */}
              <div>
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">Preview Counts</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(validation.previewCounts).map(([k, v]) => (
                    <div key={k} className="flex justify-between border rounded px-3 py-2 text-sm">
                      <span className="text-gray-500 capitalize">{k}</span>
                      <span className="font-medium">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Flags */}
              {(validation.willActivateSeason || validation.replaceMode) && (
                <div className="text-xs space-y-1">
                  {validation.willActivateSeason && (
                    <p className="bg-orange-50 text-orange-700 border border-orange-200 rounded px-2 py-1">Will activate season (deactivates current active season)</p>
                  )}
                  {validation.replaceMode && (
                    <p className="bg-red-50 text-red-700 border border-red-200 rounded px-2 py-1">Replace mode — existing records may be overwritten</p>
                  )}
                </div>
              )}

              {/* Errors */}
              {validation.errors.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-red-600 uppercase tracking-wide mb-1">Errors</p>
                  <ul className="text-xs text-red-600 space-y-1 list-disc list-inside">
                    {validation.errors.map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                </div>
              )}

              {/* Warnings */}
              {validation.warnings.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-yellow-600 uppercase tracking-wide mb-1">Warnings</p>
                  <ul className="text-xs text-yellow-600 space-y-1 list-disc list-inside">
                    {validation.warnings.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
