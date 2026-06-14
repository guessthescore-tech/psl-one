'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { adminGetApproval, adminCreateApproval, adminRejectApproval } from '@/lib/beta-launch-client';
import Link from 'next/link';

const FLAG_LABELS = [
  { key: 'rollbackVerified', label: 'Rollback dry-run verified' },
  { key: 'betaCohortVerified', label: 'Beta cohort ready' },
  { key: 'frontendVerified', label: 'Frontend walkthrough complete' },
  { key: 'dataVerified', label: 'Data seeded and confirmed' },
  { key: 'securityVerified', label: 'Security & RBAC verified' },
  { key: 'operationsVerified', label: 'Operations & infrastructure verified' },
] as const;

export default function AdminApprovalPage() {
  const { seasonId } = useParams<{ seasonId: string }>();
  const [approval, setApproval] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  const load = () => {
    adminGetApproval(seasonId)
      .then(d => setApproval(d as Record<string, unknown>))
      .catch(() => setApproval(null));
  };

  useEffect(() => { load(); }, [seasonId]);

  const toggleFlag = (k: string) => setFlags(prev => ({ ...prev, [k]: !prev[k] }));

  const approve = async () => {
    const allSet = FLAG_LABELS.every(f => flags[f.key]);
    if (!allSet) { setError('All 6 verification flags must be checked before creating approval'); return; }
    try {
      await adminCreateApproval(seasonId, { ...flags, notes });
      setMsg('Approval created (status: APPROVED — season NOT activated)');
      setError(null);
      load();
    } catch (e) { setError(String(e)); }
  };

  const reject = async () => {
    if (!rejectReason.trim()) { setError('Rejection reason required'); return; }
    try {
      await adminRejectApproval(seasonId, { reason: rejectReason });
      setMsg('Approval rejected');
      setError(null);
      load();
    } catch (e) { setError(String(e)); }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Link href={`/admin/beta-launch/${seasonId}`} className="text-sm text-blue-600 hover:underline">← Back</Link>
        <h1 className="text-2xl font-bold">Season Activation Approval</h1>
      </div>

      <div className="bg-amber-50 border border-amber-300 rounded p-4 text-sm text-amber-800">
        <strong>Approval does NOT activate the season.</strong> Creating an approval record sets status to APPROVED. Actual activation requires an explicit admin trigger in a separate controlled deployment window.
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}
      {msg && <p className="text-green-700 text-sm">{msg}</p>}

      {approval && (
        <div className="bg-white border rounded p-4 space-y-2">
          <p className="font-medium text-sm">Current Approval</p>
          <p className="text-sm">Status: <span className={`font-mono px-2 py-0.5 rounded text-xs ${String(approval['approvalStatus']) === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>{String(approval['approvalStatus'] ?? 'NONE')}</span></p>
          {!!approval['approvedAt'] && <p className="text-xs text-gray-500">Approved at: {String(approval['approvedAt'])}</p>}
          {!!approval['notes'] && <p className="text-xs text-gray-500">Notes: {String(approval['notes'])}</p>}
          <p className="text-xs text-red-600 font-mono mt-2">activationPerformedAt: {String(approval['activationPerformedAt'] ?? 'null')} (not set in STORY-39)</p>
        </div>
      )}

      <div className="border rounded p-4 space-y-3">
        <p className="font-medium text-sm">Create New Approval</p>
        <p className="text-xs text-gray-500">All 6 verification flags must be checked before approval can be created</p>
        {FLAG_LABELS.map(f => (
          <label key={f.key} className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={!!flags[f.key]} onChange={() => toggleFlag(f.key)} className="rounded" />
            {f.label}
          </label>
        ))}
        <textarea
          className="border rounded px-3 py-2 text-sm w-full"
          rows={2}
          placeholder="Notes (optional)"
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />
        <button onClick={approve} className="bg-green-600 text-white text-sm px-4 py-1.5 rounded hover:bg-green-700">
          Create Approval (APPROVED)
        </button>
      </div>

      <div className="border border-red-200 rounded p-4 space-y-3">
        <p className="font-medium text-sm text-red-700">Reject / Invalidate Approval</p>
        <input
          className="border rounded px-3 py-1.5 text-sm w-full"
          placeholder="Rejection reason (required)"
          value={rejectReason}
          onChange={e => setRejectReason(e.target.value)}
        />
        <button onClick={reject} className="bg-red-600 text-white text-sm px-4 py-1.5 rounded hover:bg-red-700">
          Reject
        </button>
      </div>
    </div>
  );
}
