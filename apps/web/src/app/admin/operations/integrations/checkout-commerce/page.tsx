'use client';

import { useEffect, useState } from 'react';
import { getCheckoutCommerceReadiness } from '@/lib/admin-operations-client';
import Link from 'next/link';

export default function CheckoutCommercePage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCheckoutCommerceReadiness()
      .then((d) => setData(d as Record<string, unknown>))
      .catch((e: unknown) => setError(String(e)));
  }, []);

  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;
  if (!data) return <div className="p-8 text-gray-500">Loading…</div>;

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <p className="text-sm text-gray-500">
          <Link href="/admin/operations/integrations" className="hover:underline">Integrations</Link> / Checkout &amp; Commerce
        </p>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">Checkout &amp; Commerce Readiness</h1>
      </div>

      {Boolean(data.safetyNote) && (
        <div className="bg-amber-50 border border-amber-200 rounded p-3 text-xs text-amber-800 font-medium">
          {String(data.safetyNote)}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className={`border rounded-lg p-3 text-center ${data.productionDisabled ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Production Checkout</p>
          <p className={`mt-1 text-sm font-bold ${data.productionDisabled ? 'text-green-700' : 'text-red-700'}`}>
            {data.productionDisabled ? 'DISABLED' : 'ENABLED'}
          </p>
        </div>
        <div className="border border-blue-200 bg-blue-50 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Catalogue</p>
          <p className={`mt-1 text-sm font-bold ${data.catalogueExists ? 'text-blue-700' : 'text-gray-500'}`}>
            {data.catalogueExists ? 'EXISTS' : 'NOT BUILT'}
          </p>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <tbody>
            {Object.entries(data).filter(([k]) => k !== 'safetyNote').map(([k, v]) => (
              <tr key={k} className="border-t border-gray-100 first:border-t-0">
                <td className="py-2.5 px-4 text-xs text-gray-500 font-medium w-1/2">{k}</td>
                <td className="py-2.5 px-4 text-xs text-gray-700">{String(v)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
