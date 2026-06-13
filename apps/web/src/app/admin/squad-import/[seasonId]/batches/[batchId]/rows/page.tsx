'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { use } from 'react';
import { listRows } from '@/lib/squad-import-client';

interface Row {
  id: string;
  rowNumber: number;
  proposedPlayerName: string;
  proposedPosition: string;
  proposedShirtNumber: number | null;
  proposedNationality: string | null;
  proposedFantasyPrice: number | null;
  teamId: string | null;
  validationStatus: string;
  validationMessages: { code: string; severity: string; message: string }[] | null;
  importedPlayerId: string | null;
  importedRegistrationId: string | null;
}

const STATUS_COLOURS: Record<string, string> = {
  PENDING: 'bg-gray-100 text-gray-600',
  VALID: 'bg-green-100 text-green-700',
  WARNING: 'bg-yellow-100 text-yellow-700',
  BLOCKED: 'bg-red-100 text-red-700',
  IMPORTED: 'bg-blue-100 text-blue-700',
};

export default function BatchRowsPage({ params }: { params: Promise<{ seasonId: string; batchId: string }> }) {
  const { seasonId, batchId } = use(params);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listRows(seasonId, batchId)
      .then(data => setRows(Array.isArray(data) ? data : []))
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [seasonId, batchId]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-4">
        <Link href={`/admin/squad-import/${seasonId}/batches/${batchId}`} className="text-sm text-blue-600 hover:underline">← Batch Detail</Link>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Batch Rows ({rows.length})</h1>

      {loading && <p className="text-gray-500">Loading rows…</p>}
      {error && <p className="text-red-600 bg-red-50 rounded p-3">{error}</p>}

      {rows.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border rounded-lg overflow-hidden">
            <thead className="bg-gray-50 text-gray-600 text-left">
              <tr>
                <th className="px-3 py-3 font-medium">#</th>
                <th className="px-3 py-3 font-medium">Player Name</th>
                <th className="px-3 py-3 font-medium">Position</th>
                <th className="px-3 py-3 font-medium text-right">Shirt</th>
                <th className="px-3 py-3 font-medium">Nationality</th>
                <th className="px-3 py-3 font-medium text-right">Price</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3 font-medium">Issues</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-3 py-3 text-gray-400">{r.rowNumber}</td>
                  <td className="px-3 py-3 font-medium">{r.proposedPlayerName}</td>
                  <td className="px-3 py-3 text-gray-600">{r.proposedPosition}</td>
                  <td className="px-3 py-3 text-right text-gray-600">{r.proposedShirtNumber ?? '—'}</td>
                  <td className="px-3 py-3 text-gray-600">{r.proposedNationality ?? '—'}</td>
                  <td className="px-3 py-3 text-right">{r.proposedFantasyPrice ?? '—'}</td>
                  <td className="px-3 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLOURS[r.validationStatus] ?? 'bg-gray-100'}`}>
                      {r.validationStatus}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    {r.validationMessages && r.validationMessages.length > 0 ? (
                      <ul className="space-y-0.5">
                        {r.validationMessages.map((m, i) => (
                          <li key={i} className={`text-xs ${m.severity === 'BLOCKER' ? 'text-red-600' : m.severity === 'WARNING' ? 'text-yellow-600' : 'text-gray-500'}`}>
                            [{m.severity}] {m.message}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
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
