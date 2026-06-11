'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { listImportJobs, retryJob, cancelJob, type ImportJob } from '@/lib/admin-imports-client';

const STATUS_STYLE: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-600',
  VALIDATING: 'bg-blue-100 text-blue-700',
  VALIDATED: 'bg-blue-100 text-blue-700',
  IMPORTING: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-gray-200 text-gray-500',
};

function fmtDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-ZA', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function ImportsListPage() {
  const [jobs, setJobs] = useState<ImportJob[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState<string | null>(null);

  function loadJobs() {
    setLoading(true);
    listImportJobs()
      .then(setJobs)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadJobs(); }, []);

  async function handleRetry(id: string) {
    setActioning(id);
    try { await retryJob(id); loadJobs(); }
    catch (e: unknown) { alert(e instanceof Error ? e.message : 'Failed'); }
    finally { setActioning(null); }
  }

  async function handleCancel(id: string) {
    setActioning(id);
    try { await cancelJob(id); loadJobs(); }
    catch (e: unknown) { alert(e instanceof Error ? e.message : 'Failed'); }
    finally { setActioning(null); }
  }

  return (
    <main className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Import Jobs</h1>
        <div className="flex gap-2">
          <Link href="/admin/imports/manual" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
            New Import
          </Link>
          <Link href="/admin/imports/new" className="px-4 py-2 border rounded hover:bg-gray-50 text-sm">
            Draft Job
          </Link>
        </div>
      </div>

      {error && <p className="text-red-600 bg-red-50 p-3 rounded mb-4">{error}</p>}
      {loading && <p className="text-gray-500">Loading...</p>}

      {!loading && jobs.length === 0 && (
        <p className="text-gray-500">No import jobs yet. <Link href="/admin/imports/manual" className="text-blue-600 hover:underline">Start one.</Link></p>
      )}

      <div className="space-y-2">
        {jobs.map((job) => (
          <div key={job.id} className="border rounded-lg p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Link href={`/admin/imports/${job.id}`} className="font-mono text-sm font-medium hover:underline">{job.id.slice(0, 8)}…</Link>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[job.status] ?? 'bg-gray-100'}`}>{job.status}</span>
                  <span className="text-xs text-gray-400">{job.source} / {job.sourceType}</span>
                </div>
                <div className="text-xs text-gray-500 space-x-3">
                  <span>{job.importedRecords} imported</span>
                  {job.failedRecords > 0 && <span className="text-red-500">{job.failedRecords} failed</span>}
                  <span>Created {fmtDate(job.createdAt)}</span>
                  {job.completedAt && <span>Completed {fmtDate(job.completedAt)}</span>}
                </div>
              </div>
              <div className="flex gap-1 text-xs">
                {(job.status === 'FAILED' || job.status === 'DRAFT') && (
                  <button
                    disabled={actioning === job.id}
                    onClick={() => handleRetry(job.id)}
                    className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 disabled:opacity-50"
                  >Retry</button>
                )}
                {(job.status === 'DRAFT' || job.status === 'VALIDATED') && (
                  <button
                    disabled={actioning === job.id}
                    onClick={() => handleCancel(job.id)}
                    className="px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 disabled:opacity-50"
                  >Cancel</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
