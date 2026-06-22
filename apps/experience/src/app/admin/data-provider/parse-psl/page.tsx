'use client';

/**
 * Admin: Parse PSL Fixture Ingestion
 *
 * This page is for admin operators only. It calls the PSL One backend which
 * enforces ADMIN role RBAC — unauthenticated or non-admin requests return 401/403.
 *
 * SECURITY: The Parse PSL provider key is never accessed from the browser.
 * All provider interactions happen server-side in the NestJS API.
 *
 * Fixtures imported here are created as isPublished=false.
 * PSL season activation is a separate admin action and is NOT triggered here.
 */

import { useState } from 'react';
import type {
  ParsePslIngestionResult,
  ParsePslFixtureCandidateDto,
} from '../../../../lib/admin-ingestion-api';
import { runDryRun, runWriteRun } from '../../../../lib/admin-ingestion-api';

type PageState = 'idle' | 'loading' | 'done' | 'error';

export default function ParsePslIngestionPage() {
  const [state, setState] = useState<PageState>('idle');
  const [result, setResult] = useState<ParsePslIngestionResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Write-mode form state
  const [seasonId, setSeasonId] = useState('');
  const [confirmWrite, setConfirmWrite] = useState(false);
  const [writeState, setWriteState] = useState<PageState>('idle');
  const [writeResult, setWriteResult] = useState<ParsePslIngestionResult | null>(null);
  const [writeError, setWriteError] = useState('');

  async function handleDryRun() {
    setState('loading');
    setResult(null);
    setErrorMsg('');
    try {
      const r = await runDryRun({ includeCandidates: true });
      setResult(r);
      setState('done');
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : 'Unknown error');
      setState('error');
    }
  }

  async function handleWriteRun() {
    if (!seasonId.trim()) { setWriteError('seasonId is required'); return; }
    if (!confirmWrite) { setWriteError('You must confirm the write'); return; }
    setWriteState('loading');
    setWriteResult(null);
    setWriteError('');
    try {
      const r = await runWriteRun({ seasonId: seasonId.trim(), confirmWrite: true });
      setWriteResult(r);
      setWriteState('done');
    } catch (e: unknown) {
      setWriteError(e instanceof Error ? e.message : 'Unknown error');
      setWriteState('error');
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Parse PSL Fixture Ingestion</h1>
      <p className="text-yellow-400 text-sm mb-6">
        Admin only · Fixtures imported as unpublished · No scheduler · No PSL activation
      </p>

      {/* ── Dry-run section ────────────────────────────────────────────── */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-3">Step 1 — Dry-run preview</h2>
        <p className="text-gray-400 text-sm mb-4">
          Fetches normalized fixture candidates from Parse PSL. No database writes.
          Source-empty is expected until psl.co.za publishes the 2026/27 season (~July/August).
        </p>

        <button
          onClick={handleDryRun}
          disabled={state === 'loading'}
          className="bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 px-5 py-2 rounded font-medium text-sm"
        >
          {state === 'loading' ? 'Running…' : 'Run Dry-Run Preview'}
        </button>

        {state === 'error' && (
          <p className="mt-3 text-red-400 text-sm">Error: {errorMsg}</p>
        )}

        {result && (
          <div className="mt-5 space-y-4">
            <StatusBadge result={result} />

            {result.sourceStatus === 'SOURCE_EMPTY' && (
              <div className="bg-blue-900/40 border border-blue-700 rounded p-4 text-sm">
                <strong>Source Empty</strong> — psl.co.za has not published 2026/27 Betway
                Premiership fixtures yet. Re-run in July/August 2026 when fixtures are published.
                No action needed.
              </div>
            )}

            {result.candidates.length > 0 && (
              <CandidateTable candidates={result.candidates} />
            )}

            {result.warnings.length > 0 && (
              <WarningList warnings={result.warnings} />
            )}
          </div>
        )}
      </section>

      {/* ── Write section ──────────────────────────────────────────────── */}
      <section className="border-t border-gray-800 pt-8">
        <h2 className="text-lg font-semibold mb-3">Step 2 — Write run (owner-gated)</h2>
        <div className="bg-yellow-900/30 border border-yellow-700 rounded p-4 text-sm mb-5">
          <strong>Important:</strong> Write runs create fixtures as <code>isPublished=false</code>.
          Fixtures will NOT be visible to fans until separately published by an admin.
          PSL season activation is a separate action and is not triggered here.
        </div>

        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm text-gray-400 mb-1">PSL Season ID</label>
            <input
              type="text"
              value={seasonId}
              onChange={e => setSeasonId(e.target.value)}
              placeholder="e.g. season_abc123"
              className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm"
            />
          </div>

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={confirmWrite}
              onChange={e => setConfirmWrite(e.target.checked)}
              className="rounded"
            />
            I confirm that fixtures will be created as unpublished and that I have reviewed
            the dry-run candidates above.
          </label>

          <button
            onClick={handleWriteRun}
            disabled={writeState === 'loading' || !seasonId.trim() || !confirmWrite}
            className="bg-red-800 hover:bg-red-700 disabled:opacity-40 px-5 py-2 rounded font-medium text-sm"
          >
            {writeState === 'loading' ? 'Writing…' : 'Execute Write Run'}
          </button>
        </div>

        {writeError && (
          <p className="mt-3 text-red-400 text-sm">Error: {writeError}</p>
        )}

        {writeResult && (
          <div className="mt-5 space-y-3">
            <StatusBadge result={writeResult} />
            <p className="text-sm text-gray-300">
              Created: <strong>{writeResult.created}</strong> ·
              Updated: <strong>{writeResult.updated}</strong> ·
              Skipped: <strong>{writeResult.skipped}</strong>
            </p>
            {writeResult.warnings.length > 0 && <WarningList warnings={writeResult.warnings} />}
          </div>
        )}
      </section>
    </main>
  );
}

function StatusBadge({ result }: { result: ParsePslIngestionResult }) {
  const colour =
    result.sourceStatus === 'SOURCE_EMPTY' ? 'bg-blue-700' :
    result.sourceStatus === 'SOURCE_AVAILABLE' ? 'bg-emerald-700' :
    result.errors.length > 0 ? 'bg-red-700' : 'bg-gray-700';

  return (
    <div className={`${colour} inline-flex items-center gap-2 px-3 py-1 rounded text-sm font-mono`}>
      {result.sourceStatus}
      <span className="text-gray-300">· discovered: {result.discovered} · normalized: {result.normalized}</span>
    </div>
  );
}

function CandidateTable({ candidates }: { candidates: ParsePslFixtureCandidateDto[] }) {
  return (
    <div>
      <h3 className="text-sm font-medium text-gray-300 mb-2">Fixture candidates ({candidates.length})</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="text-gray-500 border-b border-gray-800">
              <th className="text-left py-2 pr-4">Home</th>
              <th className="text-left py-2 pr-4">Away</th>
              <th className="text-left py-2 pr-4">Kickoff</th>
              <th className="text-left py-2 pr-4">Home ID</th>
              <th className="text-left py-2 pr-4">Away ID</th>
              <th className="text-left py-2">Warnings</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map(c => (
              <tr key={c.externalId} className="border-b border-gray-900 hover:bg-gray-900/50">
                <td className={`py-2 pr-4 ${c.teamResolution.homeTeamMatched ? 'text-white' : 'text-yellow-400'}`}>
                  {c.homeTeamName}
                </td>
                <td className={`py-2 pr-4 ${c.teamResolution.awayTeamMatched ? 'text-white' : 'text-yellow-400'}`}>
                  {c.awayTeamName}
                </td>
                <td className="py-2 pr-4 text-gray-400">{new Date(c.kickoffAt).toLocaleDateString()}</td>
                <td className="py-2 pr-4 font-mono text-gray-500">{c.teamResolution.homeTeamId ?? '—'}</td>
                <td className="py-2 pr-4 font-mono text-gray-500">{c.teamResolution.awayTeamId ?? '—'}</td>
                <td className="py-2 text-yellow-400">
                  {c.teamResolution.warnings.length > 0
                    ? c.teamResolution.warnings.join('; ')
                    : <span className="text-green-600">OK</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function WarningList({ warnings }: { warnings: string[] }) {
  return (
    <div className="bg-yellow-900/20 border border-yellow-800 rounded p-3">
      <p className="text-yellow-400 text-xs font-medium mb-1">Warnings ({warnings.length})</p>
      <ul className="text-xs text-yellow-300 space-y-1">
        {warnings.map((w, i) => <li key={i}>{w}</li>)}
      </ul>
    </div>
  );
}
