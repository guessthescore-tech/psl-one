'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface ImportRow {
  id: string;
  rowNumber: number;
  homeTeamRaw?: string;
  awayTeamRaw?: string;
  venueRaw?: string;
  kickoffAtRaw: string;
  roundRaw?: string;
  homeTeamId?: string;
  awayTeamId?: string;
  venueId?: string;
  gameweekId?: string;
  fixtureId?: string;
  status: string;
  errorsJson?: unknown;
  warningsJson?: unknown;
}

const ROW_STATUS_COLOURS: Record<string, string> = {
  PENDING: 'bg-gray-100 text-gray-600',
  VALID: 'bg-green-100 text-green-700',
  WARNING: 'bg-yellow-100 text-yellow-700',
  ERROR: 'bg-red-100 text-red-700',
  COMMITTED: 'bg-blue-100 text-blue-700',
  SKIPPED: 'bg-gray-100 text-gray-400',
};

export default function BatchRowsPage() {
  const params = useParams<{ batchId: string }>();
  const batchId = params.batchId;
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addError, setAddError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRow, setNewRow] = useState({ homeTeamRaw: '', awayTeamRaw: '', kickoffAtRaw: '', venueRaw: '', roundRaw: '' });
  const [adding, setAdding] = useState(false);

  async function loadRows() {
    try {
      const res = await fetch(`/api/proxy/fixtures/admin/imports/${batchId}/rows`, { credentials: 'include' });
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json() as ImportRow[];
      setRows(data);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadRows(); }, [batchId]);

  async function handleAddRow(e: React.FormEvent) {
    e.preventDefault();
    if (!newRow.kickoffAtRaw.trim()) { setAddError('Kickoff date/time is required'); return; }
    setAdding(true);
    setAddError(null);
    try {
      const body: Record<string, string> = { kickoffAtRaw: newRow.kickoffAtRaw };
      if (newRow.homeTeamRaw) body['homeTeamRaw'] = newRow.homeTeamRaw;
      if (newRow.awayTeamRaw) body['awayTeamRaw'] = newRow.awayTeamRaw;
      if (newRow.venueRaw) body['venueRaw'] = newRow.venueRaw;
      if (newRow.roundRaw) body['roundRaw'] = newRow.roundRaw;
      const res = await fetch(`/api/proxy/fixtures/admin/imports/${batchId}/rows`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) { const b = await res.text(); throw new Error(`${res.status}: ${b}`); }
      setNewRow({ homeTeamRaw: '', awayTeamRaw: '', kickoffAtRaw: '', venueRaw: '', roundRaw: '' });
      setShowAddForm(false);
      await loadRows();
    } catch (e) {
      setAddError(String(e));
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(rowId: string) {
    if (!confirm('Delete this row?')) return;
    await fetch(`/api/proxy/fixtures/admin/imports/${batchId}/rows/${rowId}`, {
      method: 'DELETE', credentials: 'include',
    });
    await loadRows();
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <Link href={`/admin/fixtures/imports/${batchId}`} className="text-sm text-blue-600 hover:underline">
            ← Batch Detail
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Import Rows</h1>
          <p className="text-gray-500 text-sm">Batch: {batchId}</p>
        </div>
        <button
          onClick={() => setShowAddForm(v => !v)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          + Add Row
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddRow} className="border rounded-lg p-4 mb-6 bg-gray-50 grid grid-cols-2 gap-3">
          {addError && <p className="col-span-2 text-red-600 text-sm">{addError}</p>}
          {[
            { key: 'homeTeamRaw', label: 'Home Team', placeholder: 'Kaizer Chiefs' },
            { key: 'awayTeamRaw', label: 'Away Team', placeholder: 'Orlando Pirates' },
            { key: 'kickoffAtRaw', label: 'Kickoff (ISO)*', placeholder: '2026-09-06T15:00:00Z' },
            { key: 'venueRaw', label: 'Venue', placeholder: 'FNB Stadium' },
            { key: 'roundRaw', label: 'Round', placeholder: '1' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
              <input
                type="text"
                value={newRow[f.key as keyof typeof newRow]}
                onChange={e => setNewRow(prev => ({ ...prev, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className="w-full border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
          <div className="col-span-2 flex gap-2">
            <button type="submit" disabled={adding} className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm disabled:opacity-50">
              {adding ? 'Adding…' : 'Add Row'}
            </button>
            <button type="button" onClick={() => setShowAddForm(false)} className="border px-3 py-1.5 rounded text-sm">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading && <p className="text-gray-500">Loading rows…</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && rows.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed rounded-lg text-gray-400">
          No rows yet. Add rows manually or import from CSV.
        </div>
      )}

      {rows.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs border rounded-lg overflow-hidden">
            <thead className="bg-gray-50 text-gray-600 text-left">
              <tr>
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">Home</th>
                <th className="px-3 py-2">Away</th>
                <th className="px-3 py-2">Kickoff</th>
                <th className="px-3 py-2">Round</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Issues</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map(row => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 font-mono">{row.rowNumber}</td>
                  <td className="px-3 py-2">{row.homeTeamRaw ?? row.homeTeamId ?? '—'}</td>
                  <td className="px-3 py-2">{row.awayTeamRaw ?? row.awayTeamId ?? '—'}</td>
                  <td className="px-3 py-2 font-mono">{row.kickoffAtRaw}</td>
                  <td className="px-3 py-2">{row.roundRaw ?? '—'}</td>
                  <td className="px-3 py-2">
                    <span className={`inline-block px-1.5 py-0.5 rounded text-xs ${ROW_STATUS_COLOURS[row.status] ?? ''}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    {Array.isArray(row.errorsJson) && (row.errorsJson as unknown[]).length > 0 && (
                      <span className="text-red-600">
                        {(row.errorsJson as { message: string }[]).map(e => e.message).join(', ')}
                      </span>
                    )}
                    {Array.isArray(row.warningsJson) && (row.warningsJson as unknown[]).length > 0 && (
                      <span className="text-yellow-600 ml-1">
                        {(row.warningsJson as { message: string }[]).map(w => w.message).join(', ')}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {!row.fixtureId && (
                      <button
                        onClick={() => void handleDelete(row.id)}
                        className="text-red-400 hover:text-red-600"
                      >
                        Delete
                      </button>
                    )}
                    {row.fixtureId && (
                      <span className="text-green-600">Committed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
