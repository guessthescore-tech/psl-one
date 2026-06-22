'use client';

/**
 * Admin: PSL Activation Pre-Flight Check
 *
 * Read-only page that shows whether the PSL season is ready for activation.
 * This page does NOT activate anything. It is a diagnostic tool only.
 *
 * Activation remains a separate owner-gated action outside this UI.
 * All gameplay is points-only — no real-money functionality.
 */

import { useState } from 'react';
import { runPslPreflight, PslActivationPreflightResult, PreflightCheck } from '../../../../lib/fixture-publication-api';

type PageState = 'idle' | 'loading' | 'done' | 'error';

export default function PslPreflightPage() {
  const [state, setState] = useState<PageState>('idle');
  const [result, setResult] = useState<PslActivationPreflightResult | null>(null);
  const [error, setError] = useState('');
  const [seasonId, setSeasonId] = useState('');

  async function handleRun() {
    setState('loading');
    setResult(null);
    setError('');
    try {
      const res = await runPslPreflight(seasonId.trim() || undefined);
      setResult(res);
      setState('done');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error');
      setState('error');
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">PSL Activation Pre-Flight</h1>
      <p className="text-yellow-400 text-sm mb-2">
        Admin only · Read-only · Does NOT activate PSL · Points only — no real money
      </p>
      <p className="text-gray-400 text-xs mb-6">
        This tool checks whether the PSL season is ready for activation. It does not activate
        anything. All activation decisions remain owner-gated outside this UI.
      </p>

      <div className="bg-blue-900/30 border border-blue-700 rounded p-4 text-sm mb-6">
        <strong>This page is read-only.</strong> Running a pre-flight check makes no database
        changes and does not activate the PSL season. Fixture publishing and season activation
        are separate actions.
      </div>

      <section className="space-y-4 max-w-md mb-8">
        <div>
          <label className="block text-xs text-gray-400 mb-1">
            PSL Season ID (optional — leave blank to use latest inactive PSL season)
          </label>
          <input
            type="text"
            value={seasonId}
            onChange={e => setSeasonId(e.target.value)}
            placeholder="e.g. season_abc123"
            className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm"
          />
        </div>

        <button
          onClick={handleRun}
          disabled={state === 'loading'}
          className="bg-blue-700 hover:bg-blue-600 disabled:opacity-50 px-5 py-2 rounded font-medium text-sm"
        >
          {state === 'loading' ? 'Checking…' : 'Run Pre-Flight Check'}
        </button>

        {error && <p className="text-red-400 text-sm">Error: {error}</p>}
      </section>

      {result && (
        <section className="space-y-5">
          <StatusBanner result={result} />

          {result.blockers.length > 0 && (
            <div className="bg-red-900/30 border border-red-700 rounded p-4">
              <h2 className="text-sm font-semibold text-red-300 mb-2">
                Blockers ({result.blockers.length}) — must resolve before activation
              </h2>
              <ul className="text-sm text-red-200 space-y-1 list-disc list-inside">
                {result.blockers.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </div>
          )}

          {result.warnings.length > 0 && (
            <div className="bg-yellow-900/30 border border-yellow-700 rounded p-4">
              <h2 className="text-sm font-semibold text-yellow-300 mb-2">
                Warnings ({result.warnings.length}) — review before activation
              </h2>
              <ul className="text-sm text-yellow-200 space-y-1 list-disc list-inside">
                {result.warnings.map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            </div>
          )}

          <CheckList checks={result.checks} />

          <div className="bg-gray-900 border border-gray-700 rounded p-4 text-xs text-gray-400">
            <strong>Reminder:</strong> PSL activation must be performed via the Season Switching
            admin action with full owner approval. This pre-flight check is advisory only.
          </div>
        </section>
      )}
    </main>
  );
}

function StatusBanner({ result }: { result: PslActivationPreflightResult }) {
  const colour =
    result.status === 'GO' ? 'bg-green-700' :
    result.status === 'CONDITIONAL_GO' ? 'bg-yellow-700' : 'bg-red-700';

  return (
    <div className={`${colour} rounded px-5 py-3 flex items-center justify-between`}>
      <span className="font-bold text-lg">{result.status}</span>
      <span className="text-sm">
        {result.blockers.length} blocker(s) · {result.warnings.length} warning(s)
      </span>
    </div>
  );
}

function CheckList({ checks }: { checks: PreflightCheck[] }) {
  return (
    <div>
      <h2 className="text-sm font-semibold mb-2">Individual Checks ({checks.length})</h2>
      <div className="space-y-1">
        {checks.map((c, i) => (
          <div key={i} className="flex items-start gap-3 text-sm">
            <span className={`mt-0.5 text-xs font-bold w-12 shrink-0 ${
              c.status === 'PASS' ? 'text-green-400' :
              c.status === 'WARN' ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {c.status}
            </span>
            <span className="font-mono text-gray-400 text-xs w-48 shrink-0">{c.name}</span>
            <span className="text-gray-300 text-xs">{c.detail}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
