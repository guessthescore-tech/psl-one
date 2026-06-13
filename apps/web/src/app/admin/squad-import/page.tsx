'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getImportSeasons } from '@/lib/squad-import-client';

interface ImportSeason {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  status: string;
  importBatchCount: number;
  squadRegistrationCount: number;
}

export default function SquadImportPage() {
  const [seasons, setSeasons] = useState<ImportSeason[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getImportSeasons()
      .then(setSeasons)
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Squad Import</h1>
        <p className="text-gray-500 mt-1">Import and manage PSL player squad registrations by season</p>
      </div>

      {loading && <p className="text-gray-500">Loading seasons…</p>}
      {error && <p className="text-red-600 bg-red-50 rounded p-3">{error}</p>}

      {!loading && seasons.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed rounded-lg text-gray-400">
          <p>No seasons found</p>
        </div>
      )}

      <div className="grid gap-4">
        {seasons.map(s => (
          <div key={s.id} className="border rounded-lg p-4 flex items-center justify-between hover:bg-gray-50">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">{s.name}</span>
                {s.isActive && <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded">ACTIVE</span>}
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">{s.status}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {s.importBatchCount} import batch{s.importBatchCount !== 1 ? 'es' : ''} · {s.squadRegistrationCount} registrations
              </p>
            </div>
            <div className="flex gap-2">
              <Link href={`/admin/squad-import/${s.id}`} className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700">
                Manage
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
