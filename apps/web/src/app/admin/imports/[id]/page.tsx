'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getImportJob, retryJob, cancelJob, type ImportJob } from '@/lib/admin-imports-client';

const STATUS_STYLE: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-600',
  IMPORTING: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-gray-200 text-gray-500',
};

export default function ImportJobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string | null>(null);
  const [job, setJob] = useState<ImportJob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(false);

  useEffect(() => { params.then((p) => setId(p.id)); }, [params]);

  useEffect(() => {
    if (!id) return;
    getImportJob(id)
      .then(setJob)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleRetry() {
    if (!id) return;
    setActioning(true);
    try { const updated = await retryJob(id); setJob(updated as any); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : 'Failed'); }
    finally { setActioning(false); }
  }

  async function handleCancel() {
    if (!id) return;
    setActioning(true);
    try { const updated = await cancelJob(id); setJob(updated); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : 'Failed'); }
    finally { setActioning(false); }
  }

  if (loading) return <main className="p-6"><p className="text-gray-500">Loading...</p></main>;
  if (error) return <main className="p-6"><p className="text-red-600">{error}</p></main>;
  if (!job) return null;

  const jobErrors = Array.isArray(job.errorsJson) ? (job.errorsJson as string[]) : [];

  return (
    <main className="max-w-3xl mx-auto p-6">
      <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
        <Link href="/admin/imports" className="hover:underline">Import Jobs</Link>
        <span>/</span>
        <span className="font-mono">{job.id.slice(0, 8)}…</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold font-mono">{job.id}</h1>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[job.status] ?? 'bg-gray-100'}`}>{job.status}</span>
          </div>
          <p className="text-sm text-gray-500">{job.source} / {job.sourceType}</p>
        </div>
        <div className="flex gap-2">
          {(job.status === 'FAILED' || job.status === 'DRAFT') && (
            <button disabled={actioning} onClick={handleRetry} className="px-3 py-2 bg-yellow-100 text-yellow-700 rounded text-sm hover:bg-yellow-200 disabled:opacity-50">
              {actioning ? '...' : 'Retry'}
            </button>
          )}
          {(job.status === 'DRAFT' || job.status === 'VALIDATED') && (
            <button disabled={actioning} onClick={handleCancel} className="px-3 py-2 border rounded text-sm hover:bg-gray-50 disabled:opacity-50">
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          ['Total', job.totalRecords],
          ['Imported', job.importedRecords],
          ['Skipped', job.skippedRecords],
          ['Failed', job.failedRecords],
          ['Started', job.startedAt ? new Date(job.startedAt).toLocaleString() : '—'],
          ['Completed', job.completedAt ? new Date(job.completedAt).toLocaleString() : '—'],
        ].map(([label, val]) => (
          <div key={String(label)} className="border rounded p-3">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</p>
            <p className="font-semibold text-sm">{val}</p>
          </div>
        ))}
      </div>

      {jobErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded p-3">
          <p className="text-sm font-semibold text-red-700 mb-2">Errors ({jobErrors.length})</p>
          <ul className="text-xs text-red-600 space-y-1 list-disc list-inside">
            {jobErrors.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </div>
      )}
    </main>
  );
}
