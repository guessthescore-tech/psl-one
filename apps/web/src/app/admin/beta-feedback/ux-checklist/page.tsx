'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getBetaUxChecklist } from '@/lib/beta-feedback-client';

interface UxCheckItem {
  area: string;
  check: string;
  status: 'PASS' | 'WARN' | 'FAIL' | 'PENDING';
  notes: string;
}

interface ChecklistData {
  checks: UxCheckItem[];
  summary: Record<string, number>;
  note: string;
}

const STATUS_COLOURS: Record<string, string> = {
  PASS: 'bg-green-100 text-green-700',
  WARN: 'bg-amber-100 text-amber-700',
  FAIL: 'bg-red-100 text-red-700',
  PENDING: 'bg-gray-100 text-gray-500',
};

const STATUS_ICONS: Record<string, string> = {
  PASS: '✓',
  WARN: '⚠',
  FAIL: '✗',
  PENDING: '○',
};

export default function BetaUxChecklistPage() {
  const [data, setData] = useState<ChecklistData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getBetaUxChecklist()
      .then((d) => setData(d as ChecklistData))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed'))
      .finally(() => setLoading(false));
  }, []);

  const grouped = data
    ? data.checks.reduce<Record<string, UxCheckItem[]>>((acc, item) => {
        if (!acc[item.area]) acc[item.area] = [];
        acc[item.area]!.push(item);
        return acc;
      }, {})
    : {};

  return (
    <main className="max-w-4xl mx-auto p-4">
      <div className="flex items-center gap-2 mb-1 text-xs text-gray-400">
        <Link href="/admin/operations" className="hover:text-gray-600">Operations</Link>
        <span>/</span>
        <Link href="/admin/beta-feedback" className="hover:text-gray-600">Beta Feedback</Link>
        <span>/</span>
        <span className="text-gray-600">UX Checklist</span>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">UX Checklist</h1>
        <Link href="/admin/beta-feedback" className="text-sm text-blue-600 underline">← Beta Feedback</Link>
      </div>

      {loading && <p className="text-sm text-gray-400">Loading…</p>}
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {data && !loading && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="flex gap-3 flex-wrap">
            {Object.entries(data.summary).map(([status, count]) => (
              <div key={status} className={`px-3 py-2 rounded-lg text-sm font-semibold ${STATUS_COLOURS[status] ?? 'bg-gray-100 text-gray-600'}`}>
                {STATUS_ICONS[status]} {status}: {count}
              </div>
            ))}
          </div>

          {data.note && <p className="text-xs text-gray-500 italic">{data.note}</p>}

          {/* Groups */}
          {Object.entries(grouped).map(([area, items]) => (
            <div key={area}>
              <h2 className="text-sm font-semibold text-gray-700 mb-2 border-b border-gray-100 pb-1">{area}</h2>
              <div className="space-y-2">
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-white border border-gray-100 rounded-lg p-3">
                    <span className={`flex-shrink-0 px-1.5 py-0.5 rounded text-xs font-bold ${STATUS_COLOURS[item.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {STATUS_ICONS[item.status]}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm text-gray-800">{item.check}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.notes}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
