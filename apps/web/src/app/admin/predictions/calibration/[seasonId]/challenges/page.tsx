'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getPeerChallengeReadiness } from '@/lib/prediction-calibration-client';

export default function ChallengesReadinessPage() {
  const { seasonId } = useParams<{ seasonId: string }>();
  const [data, setData] = useState<{
    seasonName: string;
    publishedFixtures: number;
    pendingChallenges: number;
    acceptedChallenges: number;
    settledChallenges: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPeerChallengeReadiness(seasonId)
      .then((d) => setData(d as typeof data))
      .catch((e: unknown) => setError(String(e)));
  }, [seasonId]);

  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;
  if (!data) return <div className="p-8 text-gray-500">Loading…</div>;

  const total = data.pendingChallenges + data.acceptedChallenges + data.settledChallenges;

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">{data.seasonName} — Peer Challenge Readiness</h1>
      <p className="text-sm text-gray-500">Peer challenges attached to published fixtures in this season.</p>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded text-center">
          <div className="text-2xl font-bold text-blue-700">{data.publishedFixtures}</div>
          <div className="text-sm text-blue-600">Published Fixtures</div>
        </div>
        <div className="p-4 bg-gray-50 border border-gray-200 rounded text-center">
          <div className="text-2xl font-bold">{total}</div>
          <div className="text-sm text-gray-600">Total Challenges</div>
        </div>
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded text-center">
          <div className="text-2xl font-bold text-yellow-700">{data.pendingChallenges}</div>
          <div className="text-sm text-yellow-600">Pending</div>
        </div>
        <div className="p-4 bg-orange-50 border border-orange-200 rounded text-center">
          <div className="text-2xl font-bold text-orange-700">{data.acceptedChallenges}</div>
          <div className="text-sm text-orange-600">Accepted (awaiting settlement)</div>
        </div>
        <div className="p-4 bg-green-50 border border-green-200 rounded text-center col-span-2">
          <div className="text-2xl font-bold text-green-700">{data.settledChallenges}</div>
          <div className="text-sm text-green-600">Settled</div>
        </div>
      </div>

      {data.acceptedChallenges > 0 && (
        <div className="p-4 bg-orange-50 border border-orange-200 rounded text-sm text-orange-700">
          {data.acceptedChallenges} accepted challenge(s) are waiting for fixture settlement. These will be resolved when the fixture is settled via the admin predictions panel.
        </div>
      )}
    </div>
  );
}
