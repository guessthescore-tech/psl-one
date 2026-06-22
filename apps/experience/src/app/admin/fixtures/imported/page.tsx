'use client';

/**
 * Admin: Imported Fixture Manager
 *
 * Shows fixtures imported from Parse PSL (and other providers).
 * Supports filtering by publication status and bulk publish/unpublish.
 *
 * IMPORTANT: Publishing fixtures is SEPARATE from PSL season activation.
 * Publishing makes fixtures visible to fans. It does not activate the PSL season.
 * All gameplay remains points-only — no real-money functionality.
 *
 * SECURITY: The Parse PSL provider key is never accessed from the browser.
 */

import { useState } from 'react';
import {
  listImportedFixtures,
  publishFixtures,
  ImportedFixtureRow,
  FixturePublishResult,
} from '../../../../lib/fixture-publication-api';

type PageState = 'idle' | 'loading' | 'done' | 'error';

export default function ImportedFixturesPage() {
  const [fixtures, setFixtures] = useState<ImportedFixtureRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loadState, setLoadState] = useState<PageState>('idle');
  const [loadError, setLoadError] = useState('');

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [publishMode, setPublishMode] = useState<boolean>(true);
  const [confirmPublication, setConfirmPublication] = useState(false);
  const [publishState, setPublishState] = useState<PageState>('idle');
  const [publishResult, setPublishResult] = useState<FixturePublishResult | null>(null);
  const [publishError, setPublishError] = useState('');

  const [filterProvider, setFilterProvider] = useState('parse-psl');
  const [filterPublished, setFilterPublished] = useState<string>('false');

  async function handleLoad() {
    setLoadState('loading');
    setFixtures([]);
    setLoadError('');
    setSelectedIds(new Set());
    try {
      const isPublished =
        filterPublished === 'true' ? true : filterPublished === 'false' ? false : undefined;
      const res = await listImportedFixtures({
        providerSource: filterProvider || undefined,
        isPublished,
      });
      setFixtures(res.fixtures);
      setTotal(res.total);
      setLoadState('done');
    } catch (e: unknown) {
      setLoadError(e instanceof Error ? e.message : 'Unknown error');
      setLoadState('error');
    }
  }

  async function handlePublish() {
    if (selectedIds.size === 0) { setPublishError('Select at least one fixture'); return; }
    if (!confirmPublication) { setPublishError('You must confirm before publishing'); return; }
    setPublishState('loading');
    setPublishResult(null);
    setPublishError('');
    try {
      const result = await publishFixtures({
        fixtureIds: Array.from(selectedIds),
        publish: publishMode,
        confirmPublication: true,
      });
      setPublishResult(result);
      setPublishState('done');
      setConfirmPublication(false);
      setSelectedIds(new Set());
    } catch (e: unknown) {
      setPublishError(e instanceof Error ? e.message : 'Unknown error');
      setPublishState('error');
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selectedIds.size === fixtures.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(fixtures.map(f => f.id)));
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">Imported Fixtures</h1>
      <p className="text-yellow-400 text-sm mb-2">
        Admin only · Publishing is separate from PSL activation · Points only — no real money
      </p>
      <p className="text-gray-400 text-xs mb-6">
        Fixtures imported from Parse PSL are created as unpublished. Use this page to review
        and bulk-publish them. Publishing a fixture makes it visible to fans but does NOT activate
        the PSL season.
      </p>

      {/* ── Filters ──────────────────────────────────────────────────────── */}
      <section className="flex flex-wrap gap-4 mb-6 items-end">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Provider source</label>
          <input
            type="text"
            value={filterProvider}
            onChange={e => setFilterProvider(e.target.value)}
            placeholder="parse-psl"
            className="bg-gray-800 border border-gray-600 rounded px-3 py-1.5 text-sm w-44"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Published?</label>
          <select
            value={filterPublished}
            onChange={e => setFilterPublished(e.target.value)}
            className="bg-gray-800 border border-gray-600 rounded px-3 py-1.5 text-sm"
          >
            <option value="">All</option>
            <option value="false">Unpublished</option>
            <option value="true">Published</option>
          </select>
        </div>
        <button
          onClick={handleLoad}
          disabled={loadState === 'loading'}
          className="bg-blue-700 hover:bg-blue-600 disabled:opacity-50 px-4 py-2 rounded text-sm font-medium"
        >
          {loadState === 'loading' ? 'Loading…' : 'Load Fixtures'}
        </button>
      </section>

      {loadError && <p className="text-red-400 text-sm mb-4">Error: {loadError}</p>}

      {/* ── Fixture table ────────────────────────────────────────────────── */}
      {loadState === 'done' && fixtures.length === 0 && (
        <div className="bg-blue-900/30 border border-blue-700 rounded p-4 text-sm mb-6">
          No fixtures found for the selected filters. Source may be empty until psl.co.za publishes
          2026/27 fixtures (~July/August 2026).
        </div>
      )}

      {fixtures.length > 0 && (
        <section className="mb-8">
          <p className="text-xs text-gray-400 mb-2">{total} fixture(s) total</p>
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="text-gray-500 border-b border-gray-800">
                  <th className="text-left py-2 pr-3">
                    <input type="checkbox" onChange={toggleAll} checked={selectedIds.size === fixtures.length && fixtures.length > 0} />
                  </th>
                  <th className="text-left py-2 pr-4">Home</th>
                  <th className="text-left py-2 pr-4">Away</th>
                  <th className="text-left py-2 pr-4">Kickoff</th>
                  <th className="text-left py-2 pr-4">Status</th>
                  <th className="text-left py-2 pr-4">Published</th>
                  <th className="text-left py-2 pr-4">Source</th>
                  <th className="text-left py-2">Ext ID</th>
                </tr>
              </thead>
              <tbody>
                {fixtures.map(f => (
                  <tr key={f.id} className="border-b border-gray-900 hover:bg-gray-900/50">
                    <td className="py-2 pr-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(f.id)}
                        onChange={() => toggleSelect(f.id)}
                      />
                    </td>
                    <td className="py-2 pr-4 text-white">{f.homeTeamName}</td>
                    <td className="py-2 pr-4 text-white">{f.awayTeamName}</td>
                    <td className="py-2 pr-4 text-gray-400">
                      {new Date(f.kickoffAt).toLocaleDateString()}
                    </td>
                    <td className="py-2 pr-4 text-gray-400 font-mono">{f.status}</td>
                    <td className={`py-2 pr-4 font-mono ${f.isPublished ? 'text-green-400' : 'text-yellow-400'}`}>
                      {f.isPublished ? 'YES' : 'NO'}
                    </td>
                    <td className="py-2 pr-4 text-gray-500 font-mono">{f.providerSource ?? '—'}</td>
                    <td className="py-2 text-gray-500 font-mono">{f.externalId ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Publish controls ──────────────────────────────────────────── */}
          <div className="border border-gray-800 rounded p-5 space-y-4 max-w-lg">
            <h2 className="text-sm font-semibold">
              Publish / Unpublish ({selectedIds.size} selected)
            </h2>

            <div className="bg-yellow-900/30 border border-yellow-700 rounded p-3 text-xs">
              <strong>Important:</strong> Publishing a fixture makes it visible to fans.
              It does NOT activate the PSL season — activation is a separate owner-gated action.
              All gameplay is points-only; no real-money functionality.
            </div>

            <div className="flex gap-3">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="publishMode"
                  checked={publishMode}
                  onChange={() => setPublishMode(true)}
                />
                Publish selected
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="publishMode"
                  checked={!publishMode}
                  onChange={() => setPublishMode(false)}
                />
                Unpublish selected
              </label>
            </div>

            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={confirmPublication}
                onChange={e => setConfirmPublication(e.target.checked)}
              />
              I confirm this action. Fixtures remain points-only. PSL season is not activated.
            </label>

            <button
              onClick={handlePublish}
              disabled={publishState === 'loading' || selectedIds.size === 0 || !confirmPublication}
              className="bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 px-4 py-2 rounded text-sm font-medium"
            >
              {publishState === 'loading' ? 'Working…' : publishMode ? 'Publish Selected' : 'Unpublish Selected'}
            </button>

            {publishError && <p className="text-red-400 text-xs">Error: {publishError}</p>}

            {publishResult && (
              <div className="text-xs space-y-1">
                <p className="text-green-400">
                  Changed: <strong>{publishResult.changed}</strong> ·
                  Skipped: <strong>{publishResult.skipped}</strong> ·
                  Published: <strong>{publishResult.published}</strong> ·
                  Unpublished: <strong>{publishResult.unpublished}</strong>
                </p>
                {publishResult.warnings.map((w, i) => (
                  <p key={i} className="text-yellow-400">{w}</p>
                ))}
                {publishResult.errors.map((e, i) => (
                  <p key={i} className="text-red-400">{e}</p>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
