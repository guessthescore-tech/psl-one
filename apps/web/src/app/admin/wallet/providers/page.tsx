'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getBetaToken } from '@/lib/auth-client';
import { adminListWalletProviders, adminUpdateWalletProvider } from '@/lib/admin-wallet-client';

interface WalletProvider {
  id: string;
  name: string;
  slug: string;
  providerType: string;
  status: string;
  isActive: boolean;
  operationalMetadata: Record<string, unknown> | null;
}

export default function AdminWalletProvidersPage() {
  const [providers, setProviders] = useState<WalletProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    adminListWalletProviders(getBetaToken())
      .then((data: { providers: WalletProvider[] }) => setProviders(data.providers ?? data))
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  async function toggleActive(id: string, current: boolean) {
    setUpdating(id);
    try {
      const updated = await adminUpdateWalletProvider(getBetaToken(), id, { isActive: !current });
      setProviders(ps => ps.map(p => p.id === id ? { ...p, ...updated } : p));
    } catch (e: unknown) { setError(String(e)); }
    finally { setUpdating(null); }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-4">
        <Link href="/admin/wallet" className="text-sm text-gray-500 hover:underline">← Wallet Integration</Link>
      </div>
      <h1 className="text-xl font-bold text-gray-900 mb-2">Wallet Providers</h1>
      <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2 mb-4">
        All wallet providers operate in sandbox mode only. No production credentials are stored. No real financial transactions are processed.
      </p>

      {loading && <p className="text-gray-500">Loading…</p>}
      {error && <p className="text-red-600 bg-red-50 rounded p-3">{error}</p>}

      <div className="border rounded-lg divide-y">
        {providers.map(p => (
          <div key={p.id} className="p-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">{p.name}</span>
                <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded">{p.providerType}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${p.status === 'SANDBOX' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                  {p.status}
                </span>
                {p.isActive && <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded">ACTIVE</span>}
              </div>
              <p className="text-xs text-gray-400 mt-1 font-mono">{p.slug}</p>
            </div>
            <button
              onClick={() => toggleActive(p.id, p.isActive)}
              disabled={updating === p.id}
              className="text-sm border px-3 py-1.5 rounded hover:bg-gray-50 disabled:opacity-50"
            >
              {p.isActive ? 'Deactivate' : 'Activate'}
            </button>
          </div>
        ))}
        {!loading && providers.length === 0 && (
          <div className="p-8 text-center text-gray-400 text-sm">No wallet providers configured</div>
        )}
      </div>
    </div>
  );
}
