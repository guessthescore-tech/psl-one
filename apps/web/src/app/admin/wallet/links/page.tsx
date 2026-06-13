'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getBetaToken } from '@/lib/auth-client';
import { adminListWalletLinks } from '@/lib/admin-wallet-client';

interface WalletLink {
  id: string;
  fanUserId: string;
  walletProviderId: string;
  status: string;
  linkedAt: string | null;
  unlinkedAt: string | null;
  sandboxOnly: boolean;
  walletProvider?: { name: string; slug: string };
}

const STATUS_COLOURS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  LINKED: 'bg-green-100 text-green-700',
  UNLINKED: 'bg-gray-100 text-gray-400',
  SUSPENDED: 'bg-red-100 text-red-600',
};

export default function AdminWalletLinksPage() {
  const [links, setLinks] = useState<WalletLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminListWalletLinks(getBetaToken())
      .then((data: { links: WalletLink[] }) => setLinks(data.links ?? data))
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-4">
        <Link href="/admin/wallet" className="text-sm text-gray-500 hover:underline">← Wallet Integration</Link>
      </div>
      <h1 className="text-xl font-bold text-gray-900 mb-2">Fan Wallet Links</h1>
      <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2 mb-4">
        Sandbox mode only. No real wallet accounts are linked. Unlinked records are preserved for audit trail (soft-delete only). PSL One does not hold customer funds directly.
      </p>

      {loading && <p className="text-gray-500">Loading…</p>}
      {error && <p className="text-red-600 bg-red-50 rounded p-3">{error}</p>}

      <div className="overflow-x-auto">
        <table className="w-full text-sm border rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3 font-medium text-gray-600">Fan</th>
              <th className="text-left p-3 font-medium text-gray-600">Provider</th>
              <th className="text-left p-3 font-medium text-gray-600">Status</th>
              <th className="text-left p-3 font-medium text-gray-600">Linked At</th>
              <th className="text-left p-3 font-medium text-gray-600">Unlinked At</th>
              <th className="text-left p-3 font-medium text-gray-600">Sandbox</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {links.map(l => (
              <tr key={l.id} className="hover:bg-gray-50">
                <td className="p-3 font-mono text-xs text-gray-500">{l.fanUserId.slice(0, 8)}…</td>
                <td className="p-3">{l.walletProvider?.name ?? l.walletProviderId.slice(0, 8)}</td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-0.5 rounded ${STATUS_COLOURS[l.status] ?? 'bg-gray-100 text-gray-600'}`}>{l.status}</span>
                </td>
                <td className="p-3 text-gray-500">{l.linkedAt ? l.linkedAt.slice(0, 10) : '—'}</td>
                <td className="p-3 text-gray-500">{l.unlinkedAt ? l.unlinkedAt.slice(0, 10) : '—'}</td>
                <td className="p-3 text-xs text-yellow-600">{l.sandboxOnly ? 'SANDBOX' : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!loading && links.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed rounded-lg text-gray-400 mt-4">
          <p>No wallet links yet</p>
        </div>
      )}
    </div>
  );
}
