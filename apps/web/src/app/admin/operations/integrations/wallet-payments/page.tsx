'use client';

import { useEffect, useState } from 'react';
import { getWalletPaymentsReadiness } from '@/lib/admin-operations-client';
import Link from 'next/link';

export default function WalletPaymentsPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getWalletPaymentsReadiness()
      .then((d) => setData(d as Record<string, unknown>))
      .catch((e: unknown) => setError(String(e)));
  }, []);

  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;
  if (!data) return <div className="p-8 text-gray-500">Loading…</div>;

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <p className="text-sm text-gray-500">
          <Link href="/admin/operations/integrations" className="hover:underline">Integrations</Link> / Wallet &amp; Payments
        </p>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">Wallet &amp; Payments Readiness</h1>
      </div>

      {Boolean(data.safetyNote) && (
        <div className="bg-green-50 border border-green-200 rounded p-3 text-xs text-green-800 font-medium">
          {String(data.safetyNote)}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <StatusCard label="Production Money Movement" value={data.productionMoneyMovementDisabled ? 'DISABLED' : 'ENABLED'} good={Boolean(data.productionMoneyMovementDisabled)} />
        <StatusCard label="Gameplay Economy" value={data.gameplayRemainsPointsOnly ? 'POINTS-ONLY' : 'NOT POINTS-ONLY'} good={Boolean(data.gameplayRemainsPointsOnly)} />
        <StatusCard label="Compliance Approval" value={data.complianceApprovalRequired ? 'REQUIRED' : 'NOT REQUIRED'} good={false} />
        <StatusCard label="Contract Approval" value={data.contractApprovalRequired ? 'REQUIRED' : 'NOT REQUIRED'} good={false} />
      </div>

      <ReadinessTable data={data} skip={['safetyNote', 'productionMoneyMovementDisabled', 'gameplayRemainsPointsOnly', 'complianceApprovalRequired', 'contractApprovalRequired']} />
    </div>
  );
}

function StatusCard({ label, value, good }: { label: string; value: string; good: boolean }) {
  return (
    <div className={`border rounded-lg p-3 text-center ${good ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className={`mt-1 text-sm font-bold ${good ? 'text-green-700' : 'text-orange-700'}`}>{value}</p>
    </div>
  );
}

function ReadinessTable({ data, skip }: { data: Record<string, unknown>; skip: string[] }) {
  const entries = Object.entries(data).filter(([k]) => !skip.includes(k));
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <tbody>
          {entries.map(([k, v]) => (
            <tr key={k} className="border-t border-gray-100 first:border-t-0">
              <td className="py-2.5 px-4 text-xs text-gray-500 font-medium w-1/2">{k}</td>
              <td className="py-2.5 px-4 text-xs text-gray-700">{String(v)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
