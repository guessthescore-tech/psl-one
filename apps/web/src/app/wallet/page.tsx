'use client';

import { useEffect, useState } from 'react';
import { getBetaToken } from '@/lib/auth-client';
import { fanGetWalletStatus, fanStartWalletLink, fanConfirmWalletLink, fanUnlinkWallet } from '@/lib/wallet-client';

interface WalletStatus {
  linked: boolean;
  status: string | null;
  providerName: string | null;
  sandboxMode: boolean;
  safetyNote: string;
  providerCustomerRef: null;
  providerWalletRef: null;
}

export default function WalletPage() {
  const [status, setStatus] = useState<WalletStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState(false);
  const [linkStep, setLinkStep] = useState<'idle' | 'confirm'>('idle');
  const [sandboxToken, setSandboxToken] = useState('');

  const token = getBetaToken();

  useEffect(() => {
    fanGetWalletStatus(token)
      .then(setStatus)
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleStartLink() {
    setActing(true);
    setError(null);
    try {
      const res = await fanStartWalletLink(token, { providerSlug: 'silicon-enterprise-wallet' });
      setSandboxToken(res.sandboxToken ?? 'SANDBOX-TOKEN-DEMO');
      setLinkStep('confirm');
    } catch (e: unknown) { setError(String(e)); }
    finally { setActing(false); }
  }

  async function handleConfirmLink() {
    setActing(true);
    setError(null);
    try {
      const res = await fanConfirmWalletLink(token, { providerSlug: 'silicon-enterprise-wallet', providerToken: sandboxToken });
      setStatus(s => s ? { ...s, linked: true, status: 'LINKED', providerName: 'Silicon Enterprise Wallet' } : s);
      setLinkStep('idle');
      if (res.kycDisclaimer) setError(null);
    } catch (e: unknown) { setError(String(e)); }
    finally { setActing(false); }
  }

  async function handleUnlink() {
    setActing(true);
    setError(null);
    try {
      await fanUnlinkWallet(token, { providerSlug: 'silicon-enterprise-wallet' });
      setStatus(s => s ? { ...s, linked: false, status: 'UNLINKED' } : s);
    } catch (e: unknown) { setError(String(e)); }
    finally { setActing(false); }
  }

  if (loading) return <div className="p-6 text-gray-500">Loading…</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">My Wallet</h1>

      <div className="bg-amber-50 border border-amber-200 rounded p-4 mb-6 space-y-1 text-sm text-amber-800">
        <p>Wallet integration is operating in <strong>sandbox mode</strong>. No real financial transactions are processed.</p>
        <p>Wallet services are provided by an external wallet provider. PSL One does not hold customer funds directly.</p>
        <p className="text-xs text-amber-600 pt-1">Fan Value points are non-cash loyalty points. They are not money, betting credits, or a withdrawable balance.</p>
      </div>

      {error && <p className="text-red-600 bg-red-50 rounded p-3 mb-4">{error}</p>}

      {status && (
        <div className="border rounded-lg p-5 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-3 h-3 rounded-full ${status.linked ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className="font-semibold text-gray-900">
              {status.linked ? `Linked — ${status.providerName ?? 'Provider'}` : 'No wallet linked'}
            </span>
            {status.sandboxMode && <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded">SANDBOX</span>}
          </div>

          <p className="text-xs text-gray-400 mb-4">{status.safetyNote}</p>
          <p className="text-xs text-gray-300">Provider customer ref: masked (sandbox) · Provider wallet ref: masked (sandbox)</p>
        </div>
      )}

      {!status?.linked && linkStep === 'idle' && (
        <button onClick={handleStartLink} disabled={acting} className="bg-indigo-600 text-white px-5 py-2 rounded hover:bg-indigo-700 disabled:opacity-50">
          {acting ? 'Starting…' : 'Link Wallet (Sandbox)'}
        </button>
      )}

      {linkStep === 'confirm' && (
        <div className="border rounded-lg p-5 mb-4">
          <h2 className="font-semibold text-gray-900 mb-2">Confirm Wallet Link</h2>
          <p className="text-xs text-gray-500 mb-3">Sandbox KYC is not regulated verification. No real identity check performed.</p>
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Sandbox Token</label>
            <input className="w-full border rounded px-3 py-2 text-sm font-mono" value={sandboxToken} onChange={e => setSandboxToken(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <button onClick={handleConfirmLink} disabled={acting} className="bg-green-600 text-white text-sm px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50">
              {acting ? 'Confirming…' : 'Confirm Link'}
            </button>
            <button onClick={() => setLinkStep('idle')} className="text-sm border px-4 py-2 rounded hover:bg-gray-50">Cancel</button>
          </div>
        </div>
      )}

      {status?.linked && (
        <button onClick={handleUnlink} disabled={acting} className="text-sm text-red-600 border border-red-200 px-4 py-2 rounded hover:bg-red-50 disabled:opacity-50">
          {acting ? 'Unlinking…' : 'Unlink Wallet'}
        </button>
      )}
    </div>
  );
}
