'use client';

import { useEffect, useState } from 'react';
import { getAdminOperationsOverview } from '@/lib/admin-operations-client';
import Link from 'next/link';

interface Section {
  key: string;
  label: string;
  href: string;
  status: string;
}

interface OverviewData {
  generatedAt: string;
  platform: string;
  vision: string;
  deploymentMode: string;
  sections: Section[];
  summary: {
    totalSeasons: number;
    activeSeasons: number;
    integrationProviders: number;
    gameplayEconomy: string;
    commercialEconomy: string;
  };
  safetyNote: string;
}

export default function AdminOperationsPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAdminOperationsOverview()
      .then((d) => setData(d as OverviewData))
      .catch((e: unknown) => setError(String(e)));
  }, []);

  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;
  if (!data) return <div className="p-8 text-gray-500">Loading…</div>;

  const statusColour = (s: string) =>
    s === 'OPERATIONAL' ? 'bg-green-100 text-green-700' :
    s === 'PROVIDER_REQUIRED' ? 'bg-orange-100 text-orange-700' :
    'bg-gray-100 text-gray-600';

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <p className="text-sm text-gray-500">Admin / Operations Control Plane</p>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">Admin Operations</h1>
        <p className="text-sm text-gray-500 mt-0.5">{data.vision}</p>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded p-3 text-xs text-gray-600">
        {data.safetyNote}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Seasons" value={data.summary.totalSeasons} />
        <StatCard label="Active Seasons" value={data.summary.activeSeasons} />
        <StatCard label="Providers" value={data.summary.integrationProviders} />
        <div className="border border-green-200 bg-green-50 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Economy</p>
          <p className="mt-1 text-sm font-bold text-green-700">{data.summary.gameplayEconomy}</p>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Control Plane Sections</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {data.sections.map((section) => (
            <Link
              key={section.key}
              href={section.href}
              className="border border-gray-200 rounded-lg p-4 bg-white hover:bg-gray-50 flex items-center justify-between"
            >
              <span className="text-sm font-medium text-gray-800">{section.label}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColour(section.status)}`}>
                {section.status}
              </span>
            </Link>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-400">Generated: {new Date(data.generatedAt).toLocaleString()}</p>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-gray-200 rounded-lg p-3 bg-white text-center">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
