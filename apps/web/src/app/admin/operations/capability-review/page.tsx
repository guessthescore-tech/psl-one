'use client';

import { useEffect, useState } from 'react';
import { getCapabilityReview } from '@/lib/admin-operations-client';
import Link from 'next/link';

interface CapabilityItem {
  capability: string;
  status: string;
  evidence: string;
  riskIfMissing: string;
  nextStep: string;
}

interface Category {
  category: string;
  items: CapabilityItem[];
}

interface ReviewData {
  generatedAt: string;
  categories: Category[];
}

const statusColour = (s: string) => {
  switch (s) {
    case 'BUILT_NOW': return 'bg-green-100 text-green-700';
    case 'PARTIALLY_BUILT': return 'bg-lime-100 text-lime-700';
    case 'ADMIN_SHELL_READY': return 'bg-blue-100 text-blue-700';
    case 'FOUNDATION_READY': return 'bg-sky-100 text-sky-700';
    case 'INTEGRATION_READY': return 'bg-cyan-100 text-cyan-700';
    case 'SANDBOX_READY': return 'bg-teal-100 text-teal-700';
    case 'PROVIDER_REQUIRED': return 'bg-orange-100 text-orange-700';
    case 'COMPLIANCE_REQUIRED': return 'bg-yellow-100 text-yellow-700';
    case 'CONTRACT_REQUIRED': return 'bg-amber-100 text-amber-700';
    case 'PRODUCTION_DISABLED': return 'bg-red-100 text-red-700';
    case 'FUTURE_IMPLEMENTATION': return 'bg-gray-100 text-gray-500';
    default: return 'bg-gray-100 text-gray-600';
  }
};

const riskColour = (r: string) =>
  r === 'CRITICAL' ? 'text-red-700 font-semibold' :
  r === 'HIGH' ? 'text-orange-700' :
  r === 'MEDIUM' ? 'text-yellow-700' : 'text-gray-500';

export default function CapabilityReviewPage() {
  const [data, setData] = useState<ReviewData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCapabilityReview()
      .then((d) => setData(d as ReviewData))
      .catch((e: unknown) => setError(String(e)));
  }, []);

  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;
  if (!data) return <div className="p-8 text-gray-500">Loading…</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <p className="text-sm text-gray-500">
          <Link href="/admin/operations" className="hover:underline">Operations</Link> / Capability Gap Review
        </p>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">Capability Gap Review</h1>
        <p className="text-sm text-gray-400 mt-0.5">Generated: {new Date(data.generatedAt).toLocaleString()}</p>
      </div>

      {data.categories.map((cat) => (
        <div key={cat.category}>
          <h2 className="text-base font-semibold text-gray-700 mb-3 border-b border-gray-100 pb-1">{cat.category}</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase tracking-wide">
                  <th className="pb-2 pr-4 font-medium">Capability</th>
                  <th className="pb-2 pr-4 font-medium">Status</th>
                  <th className="pb-2 pr-4 font-medium">Evidence</th>
                  <th className="pb-2 pr-4 font-medium">Risk</th>
                  <th className="pb-2 font-medium">Next Step</th>
                </tr>
              </thead>
              <tbody>
                {cat.items.map((item, i) => (
                  <tr key={i} className="border-t border-gray-100">
                    <td className="py-2 pr-4 font-medium text-gray-800">{item.capability}</td>
                    <td className="py-2 pr-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColour(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-gray-600 text-xs">{item.evidence}</td>
                    <td className={`py-2 pr-4 text-xs ${riskColour(item.riskIfMissing)}`}>{item.riskIfMissing}</td>
                    <td className="py-2 text-xs text-gray-500">{item.nextStep}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
