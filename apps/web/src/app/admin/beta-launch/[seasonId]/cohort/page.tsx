'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { adminGetBetaCohortReadiness, adminListCohorts, adminCreateCohort, adminStartCohort } from '@/lib/beta-launch-client';
import Link from 'next/link';

export default function AdminBetaCohortPage() {
  const { seasonId } = useParams<{ seasonId: string }>();
  const [readiness, setReadiness] = useState<Record<string, unknown> | null>(null);
  const [cohorts, setCohorts] = useState<unknown[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');

  const load = () => {
    adminGetBetaCohortReadiness(seasonId).then(d => setReadiness(d as Record<string, unknown>)).catch(e => setError(String(e)));
    adminListCohorts(seasonId).then(d => setCohorts((d as { cohorts: unknown[] }).cohorts ?? [])).catch(() => null);
  };

  useEffect(() => { load(); }, [seasonId]);

  const create = async () => {
    try {
      await adminCreateCohort({ name, slug, seasonId });
      setMsg('Cohort created');
      setName(''); setSlug('');
      load();
    } catch (e) { setError(String(e)); }
  };

  const start = async (cohortId: string) => {
    try {
      await adminStartCohort(cohortId);
      setMsg('Cohort started — season activation status unchanged');
      load();
    } catch (e) { setError(String(e)); }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Link href={`/admin/beta-launch/${seasonId}`} className="text-sm text-blue-600 hover:underline">← Back</Link>
        <h1 className="text-2xl font-bold">Beta Cohort Management</h1>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded p-3 text-xs text-amber-800">
        Starting a cohort does NOT activate the PSL season. Season activation is a separate controlled operation.
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}
      {msg && <p className="text-green-700 text-sm">{msg}</p>}

      {readiness && (
        <div className="bg-white border rounded p-4 text-sm space-y-1">
          <p className="font-medium">Cohort Readiness</p>
          <p className="text-gray-500">Active cohorts: {String((readiness as Record<string, unknown>)['activeCohortCount'] ?? 0)}</p>
          <p className="text-gray-500">Max users limit: {String((readiness as Record<string, unknown>)['maxUsersConfigured'] ?? 'not set')}</p>
        </div>
      )}

      <div className="border rounded p-4 space-y-3">
        <p className="font-medium text-sm">Create Cohort</p>
        <input className="border rounded px-3 py-1.5 text-sm w-full" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
        <input className="border rounded px-3 py-1.5 text-sm w-full" placeholder="Slug (e.g. psl-beta-wave-1)" value={slug} onChange={e => setSlug(e.target.value)} />
        <button onClick={create} className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded hover:bg-blue-700">Create</button>
      </div>

      <div className="space-y-2">
        <p className="font-medium text-sm">Cohorts for this season</p>
        {cohorts.length === 0 && <p className="text-sm text-gray-400">No cohorts yet</p>}
        {(cohorts as Array<{ id: string; name: string; slug: string; status: string; _count?: { members: number } }>).map(c => (
          <div key={c.id} className="border rounded p-3 flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">{c.name}</p>
              <p className="text-xs text-gray-500">{c.slug} · {c.status} · {c._count?.members ?? 0} members</p>
            </div>
            {c.status === 'DRAFT' && (
              <button onClick={() => start(c.id)} className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">Start</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
