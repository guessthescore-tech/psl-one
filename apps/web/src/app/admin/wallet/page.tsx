'use client';

import Link from 'next/link';

export default function AdminWalletPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Wallet Integration</h1>
        <p className="text-gray-500 mt-1">Manage wallet providers, fan links, and transactions</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded p-4 mb-6 space-y-1 text-sm text-amber-800">
        <p><strong>Sandbox mode only.</strong> Wallet integration is operating in sandbox mode. No real financial transactions are processed.</p>
        <p>Wallet services are provided by an external wallet provider. PSL One does not hold customer funds directly.</p>
        <p>Fan Value points are non-cash loyalty points. They are not money, betting credits, or a withdrawable balance.</p>
        <p className="text-xs text-amber-600 pt-1">WALLET_TRANSACTIONS module readiness: PRODUCTION_DISABLED — production contract and KYC/fraud controls not configured.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/admin/wallet/providers" className="border rounded-lg p-5 hover:bg-gray-50 block">
          <h2 className="font-semibold text-gray-900 mb-1">Providers</h2>
          <p className="text-sm text-gray-500">Manage wallet provider configurations (sandbox only)</p>
        </Link>
        <Link href="/admin/wallet/links" className="border rounded-lg p-5 hover:bg-gray-50 block">
          <h2 className="font-semibold text-gray-900 mb-1">Fan Links</h2>
          <p className="text-sm text-gray-500">View fan-to-wallet link status and history</p>
        </Link>
        <Link href="/admin/wallet/transactions" className="border rounded-lg p-5 hover:bg-gray-50 block">
          <h2 className="font-semibold text-gray-900 mb-1">Transactions</h2>
          <p className="text-sm text-gray-500">View sandbox wallet transaction log</p>
        </Link>
      </div>
    </div>
  );
}
