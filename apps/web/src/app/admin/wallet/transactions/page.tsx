'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getBetaToken } from '@/lib/auth-client';
import { adminListWalletTransactions } from '@/lib/admin-wallet-client';

interface WalletTransaction {
  id: string;
  fanUserId: string;
  walletProviderId: string;
  transactionType: string;
  amount: number | null;
  currency: string | null;
  status: string;
  sandboxOnly: boolean;
  providerRef: string | null;
  createdAt: string;
  walletProvider?: { name: string };
}

const STATUS_COLOURS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-green-100 text-green-700',
  FAILED: 'bg-red-100 text-red-600',
  REVERSED: 'bg-gray-100 text-gray-400',
};

export default function AdminWalletTransactionsPage() {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminListWalletTransactions(getBetaToken())
      .then((data: { transactions: WalletTransaction[] }) => setTransactions(data.transactions ?? data))
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-4">
        <Link href="/admin/wallet" className="text-sm text-gray-500 hover:underline">← Wallet Integration</Link>
      </div>
      <h1 className="text-xl font-bold text-gray-900 mb-2">Wallet Transactions</h1>
      <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2 mb-4">
        Wallet integration is operating in sandbox mode. No real financial transactions are processed. WALLET_TRANSACTIONS module readiness: PRODUCTION_DISABLED.
        Wallet services are provided by an external wallet provider. PSL One does not hold customer funds directly.
      </p>

      {loading && <p className="text-gray-500">Loading…</p>}
      {error && <p className="text-red-600 bg-red-50 rounded p-3">{error}</p>}

      <div className="overflow-x-auto">
        <table className="w-full text-sm border rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3 font-medium text-gray-600">Fan</th>
              <th className="text-left p-3 font-medium text-gray-600">Provider</th>
              <th className="text-left p-3 font-medium text-gray-600">Type</th>
              <th className="text-left p-3 font-medium text-gray-600">Amount</th>
              <th className="text-left p-3 font-medium text-gray-600">Status</th>
              <th className="text-left p-3 font-medium text-gray-600">Date</th>
              <th className="text-left p-3 font-medium text-gray-600">Sandbox</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {transactions.map(t => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="p-3 font-mono text-xs text-gray-500">{t.fanUserId.slice(0, 8)}…</td>
                <td className="p-3 text-sm">{t.walletProvider?.name ?? t.walletProviderId.slice(0, 8)}</td>
                <td className="p-3 text-xs text-gray-500">{t.transactionType}</td>
                <td className="p-3">{t.amount != null ? `${t.amount} ${t.currency ?? ''}` : '—'}</td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-0.5 rounded ${STATUS_COLOURS[t.status] ?? 'bg-gray-100 text-gray-600'}`}>{t.status}</span>
                </td>
                <td className="p-3 text-gray-500">{t.createdAt.slice(0, 10)}</td>
                <td className="p-3 text-xs text-yellow-600">{t.sandboxOnly ? 'SANDBOX' : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!loading && transactions.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed rounded-lg text-gray-400 mt-4">
          <p>No wallet transactions yet</p>
        </div>
      )}
    </div>
  );
}
