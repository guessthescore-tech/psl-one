'use client';

import { use, useEffect, useState } from 'react';
import { getBetaToken } from '@/lib/auth-client';

interface ChallengeListing {
  id: string;
  creatorId: string;
  totalPoints: number;
  availablePoints: number;
  status: string;
  challengeMode?: string;
  prediction?: { homeScore: number; awayScore: number } | null;
  creator?: { id: string; fanProfile?: { displayName: string | null } | null };
}

const BASE = process.env['NEXT_PUBLIC_API_BASE_URL'] ?? 'http://localhost:4000';

function authedHeaders(): HeadersInit {
  const token = getBetaToken();
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

async function getFixtureListings(fixtureId: string): Promise<ChallengeListing[]> {
  const res = await fetch(`${BASE}/social-prediction/listings?fixtureId=${fixtureId}&status=OPEN`, {
    headers: authedHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) return [];
  const data = await res.json() as { listings?: ChallengeListing[] } | ChallengeListing[];
  return Array.isArray(data) ? data : (data.listings ?? []);
}

export default function MatchSocialPage({ params }: { params: Promise<{ fixtureId: string }> }) {
  const { fixtureId } = use(params);
  const [listings, setListings] = useState<ChallengeListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFixtureListings(fixtureId)
      .then(setListings)
      .finally(() => setLoading(false));
  }, [fixtureId]);

  const marketplace = listings.filter(l => !l.challengeMode || l.challengeMode === 'PUBLIC_MARKETPLACE');
  const direct = listings.filter(l => l.challengeMode === 'DIRECT_USER' || l.challengeMode === 'FRIEND');

  return (
    <main className="max-w-2xl mx-auto p-6">
      <a href={`/matches/${fixtureId}`} className="text-xs text-blue-600 underline mb-4 inline-block">← Match Overview</a>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Social Predictions</h1>
        <a href="/social-predictions/marketplace" className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg">
          Open Marketplace
        </a>
      </div>
      <p className="text-xs text-gray-500 mb-6">Points-based prediction challenges for this match. No cash involved.</p>

      {loading && <p className="text-gray-400 text-sm">Loading…</p>}

      {!loading && listings.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-sm">No open challenges for this match yet.</p>
          <a href="/social-predictions/marketplace" className="mt-2 inline-block text-xs text-blue-600 underline">
            Be the first to create one →
          </a>
        </div>
      )}

      {marketplace.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-semibold text-gray-600 mb-2">Marketplace Challenges ({marketplace.length})</h2>
          <div className="space-y-2">
            {marketplace.map(l => (
              <div key={l.id} className="border rounded-lg p-3 bg-white shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">
                    {l.creator?.fanProfile?.displayName ?? 'Fan'}
                  </div>
                  {l.prediction && (
                    <div className="text-xs text-gray-500 mt-0.5">
                      Predicts: {l.prediction.homeScore}–{l.prediction.awayScore}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-700">{l.availablePoints} pts</div>
                  <div className="text-xs text-gray-400">available</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {direct.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-600 mb-2">Direct Challenges ({direct.length})</h2>
          <div className="space-y-2">
            {direct.map(l => (
              <div key={l.id} className="border rounded-lg p-3 bg-white shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">
                    {l.creator?.fanProfile?.displayName ?? 'Fan'}
                  </div>
                  <div className="text-xs text-gray-400 capitalize">{l.challengeMode?.toLowerCase().replace('_', ' ')}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-purple-700">{l.totalPoints} pts</div>
                  <a href="/social-challenges/incoming" className="text-xs text-blue-600 underline">View invite</a>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
