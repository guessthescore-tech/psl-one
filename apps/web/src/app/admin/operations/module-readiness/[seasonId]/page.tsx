'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getSeasonModuleReadiness } from '@/lib/admin-operations-client';
import Link from 'next/link';

interface ModuleItem {
  moduleKey: string;
  displayName: string;
  status: string;
  isCommercial: boolean;
  isPointsOnly: boolean;
  isProductionEnabled: boolean;
  isFoundational: boolean;
  blockers: string[];
  warnings: string[];
  recommendedAction: string;
}

interface ModuleReadinessData {
  seasonId: string;
  seasonName: string;
  modules: ModuleItem[];
}

const statusColour = (s: string) => {
  switch (s) {
    case 'BUILT_NOW': return 'bg-green-100 text-green-700';
    case 'PARTIALLY_BUILT': return 'bg-lime-100 text-lime-700';
    case 'ADMIN_SHELL_READY': return 'bg-blue-100 text-blue-700';
    case 'FOUNDATION_READY': return 'bg-sky-100 text-sky-700';
    case 'PROVIDER_REQUIRED': return 'bg-orange-100 text-orange-700';
    case 'COMPLIANCE_REQUIRED': return 'bg-yellow-100 text-yellow-700';
    case 'PRODUCTION_DISABLED': return 'bg-red-100 text-red-700';
    case 'FUTURE_IMPLEMENTATION': return 'bg-gray-100 text-gray-500';
    default: return 'bg-gray-100 text-gray-600';
  }
};

export default function SeasonModuleReadinessPage() {
  const { seasonId } = useParams<{ seasonId: string }>();
  const [data, setData] = useState<ModuleReadinessData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!seasonId) return;
    getSeasonModuleReadiness(seasonId)
      .then((d) => setData(d as ModuleReadinessData))
      .catch((e: unknown) => setError(String(e)));
  }, [seasonId]);

  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;
  if (!data) return <div className="p-8 text-gray-500">Loading…</div>;

  const ready = data.modules.filter((m) => m.status === 'BUILT_NOW').length;
  const blocked = data.modules.filter((m) => m.blockers.length > 0).length;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <p className="text-sm text-gray-500">
          <Link href="/admin/operations" className="hover:underline">Operations</Link> / Module Readiness
        </p>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">Module Readiness — {data.seasonName}</h1>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="border border-gray-200 rounded-lg p-3 bg-white text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total Modules</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{data.modules.length}</p>
        </div>
        <div className="border border-green-200 bg-green-50 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Built Now</p>
          <p className="mt-1 text-2xl font-bold text-green-700">{ready}</p>
        </div>
        <div className={`border rounded-lg p-3 text-center ${blocked > 0 ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'}`}>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Has Blockers</p>
          <p className={`mt-1 text-2xl font-bold ${blocked > 0 ? 'text-red-700' : 'text-gray-400'}`}>{blocked}</p>
        </div>
      </div>

      <div className="space-y-3">
        {data.modules.map((mod) => (
          <div key={mod.moduleKey} className="border border-gray-200 rounded-lg p-4 bg-white">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-gray-800">{mod.displayName}</p>
                  {mod.isPointsOnly && (
                    <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.5 rounded">Points-Only</span>
                  )}
                  {mod.isCommercial && !mod.isPointsOnly && (
                    <span className="text-xs bg-orange-50 text-orange-700 border border-orange-200 px-1.5 py-0.5 rounded">Commercial</span>
                  )}
                  {mod.isFoundational && (
                    <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded">Foundational</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">{mod.recommendedAction}</p>
                {mod.blockers.length > 0 && (
                  <ul className="mt-2 space-y-0.5">
                    {mod.blockers.map((b, i) => (
                      <li key={i} className="text-xs text-red-600">✗ {b}</li>
                    ))}
                  </ul>
                )}
                {mod.warnings.length > 0 && (
                  <ul className="mt-1 space-y-0.5">
                    {mod.warnings.map((w, i) => (
                      <li key={i} className="text-xs text-orange-600">! {w}</li>
                    ))}
                  </ul>
                )}
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${statusColour(mod.status)}`}>
                {mod.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
