'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getPublicationReadiness } from '@/lib/gameweek-operations-client';
import Link from 'next/link';

interface PublicationData {
  seasonId: string;
  seasonName: string;
  publishingReadiness: {
    total: number;
    published: number;
    unpublished: number;
    readyToPublish: number;
    notReadyToPublish: number;
    fixtures: Array<{
      id: string;
      isPublished: boolean;
      round: number;
      kickoffAt: string;
    }>;
  };
  gameweekSummary: Array<{
    gameweekId: string;
    name: string;
    round: number;
    publishedFixtureCount: number;
    fixtureCount: number;
  }>;
}

export default function PublicationReadinessPage() {
  const { seasonId } = useParams<{ seasonId: string }>();
  const [data, setData] = useState<PublicationData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!seasonId) return;
    getPublicationReadiness(seasonId)
      .then((d) => setData(d as PublicationData))
      .catch((e: unknown) => setError(String(e)));
  }, [seasonId]);

  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;
  if (!data) return <div className="p-8 text-gray-500">Loading…</div>;

  const pr = data.publishingReadiness ?? { total: 0, published: 0, unpublished: 0, readyToPublish: 0, notReadyToPublish: 0, fixtures: [] };
  const publishPct = pr.total > 0 ? Math.round((pr.published / pr.total) * 100) : 0;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <p className="text-sm text-gray-500">
          <Link href="/admin/gameweeks/operations" className="hover:underline">Operations</Link>{' '}
          / <Link href={`/admin/gameweeks/operations/${seasonId}`} className="hover:underline">{data.seasonName}</Link>{' '}
          / Publication
        </p>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">Publication Readiness</h1>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="border border-gray-200 rounded-lg p-4 bg-white">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{pr.total}</p>
        </div>
        <div className="border border-gray-200 rounded-lg p-4 bg-white">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Published</p>
          <p className="mt-1 text-2xl font-bold text-green-700">{pr.published} <span className="text-sm font-normal text-gray-500">({publishPct}%)</span></p>
        </div>
        <div className="border border-gray-200 rounded-lg p-4 bg-white">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Unpublished</p>
          <p className={`mt-1 text-2xl font-bold ${pr.unpublished > 0 ? 'text-orange-600' : 'text-gray-400'}`}>{pr.unpublished}</p>
        </div>
        <div className="border border-gray-200 rounded-lg p-4 bg-white">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Ready to Publish</p>
          <p className="mt-1 text-2xl font-bold text-blue-700">{pr.readyToPublish}</p>
        </div>
      </div>

      {(data.gameweekSummary ?? []).length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">By Gameweek</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border border-gray-200 rounded-lg">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-4 py-2 text-left">Round</th>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Published / Total</th>
                </tr>
              </thead>
              <tbody>
                {data.gameweekSummary.map((gw) => (
                  <tr key={gw.gameweekId} className="border-t border-gray-100">
                    <td className="px-4 py-2 font-medium text-gray-900">{gw.round}</td>
                    <td className="px-4 py-2 text-gray-700">{gw.name}</td>
                    <td className="px-4 py-2 text-gray-600">
                      <span className={gw.publishedFixtureCount === gw.fixtureCount ? 'text-green-700 font-medium' : ''}>
                        {gw.publishedFixtureCount}/{gw.fixtureCount}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
