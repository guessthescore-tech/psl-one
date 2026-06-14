'use client';

import { useEffect, useState } from 'react';
import { fanGetIncomingChallenges, fanAcceptDirectChallenge, fanDeclineDirectChallenge } from '@/lib/social-prediction-client';
import { getBetaToken } from '@/lib/auth-client';

interface Challenge {
  id: string;
  committedPoints: number;
  supportingSelection: string;
  opposingSelection: string;
  createdAt: string;
  fanUser?: { id: string; fanProfile?: { displayName?: string } };
  fixtureMarket?: { marketType: string; fixture?: { kickoffAt: string; homeTeam?: { name: string }; awayTeam?: { name: string } } };
}

export default function IncomingChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const d = await fanGetIncomingChallenges(getBetaToken());
      setChallenges(Array.isArray(d) ? d : []);
    } catch (e) {
      setMsg(String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function accept(id: string) {
    try {
      await fanAcceptDirectChallenge(getBetaToken(), id);
      setMsg('Challenge accepted!');
      load();
    } catch (e) { setMsg(String(e)); }
  }

  async function decline(id: string) {
    try {
      await fanDeclineDirectChallenge(getBetaToken(), id);
      setMsg('Challenge declined.');
      load();
    } catch (e) { setMsg(String(e)); }
  }

  return (
    <main className="max-w-2xl mx-auto p-6">
      <a href="/social-challenges" className="text-xs text-blue-600 underline mb-4 inline-block">← Challenges</a>
      <h1 className="text-2xl font-bold mb-1">Incoming Challenges</h1>
      <p className="text-xs text-gray-500 mb-5">Gameplay points only — cannot be exchanged for money.</p>

      {msg && <p className="mb-3 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded p-2">{msg}</p>}
      {loading && <p className="text-gray-400 text-sm">Loading...</p>}

      <div className="space-y-3">
        {challenges.map(c => (
          <div key={c.id} className="border rounded-lg p-4 bg-white shadow-sm">
            <div className="font-semibold text-sm mb-1">
              From: {c.fanUser?.fanProfile?.displayName ?? 'A fan'}
            </div>
            <div className="text-xs text-gray-600 mb-1">
              {c.fixtureMarket?.fixture?.homeTeam?.name} vs {c.fixtureMarket?.fixture?.awayTeam?.name}
              {c.fixtureMarket?.fixture?.kickoffAt && (
                <span className="ml-2 text-gray-400">{new Date(c.fixtureMarket.fixture.kickoffAt).toLocaleDateString()}</span>
              )}
            </div>
            <div className="text-xs text-gray-600 mb-1">
              Market: <strong>{c.fixtureMarket?.marketType?.replace(/_/g, ' ')}</strong>
            </div>
            <div className="text-xs text-gray-600 mb-3">
              Their pick: <strong>{c.supportingSelection}</strong> · Your side: <strong>{c.opposingSelection}</strong> · Pts: <strong>{c.committedPoints}</strong>
            </div>
            <div className="flex gap-2">
              <button onClick={() => accept(c.id)} className="text-xs bg-green-600 text-white rounded px-3 py-1 hover:bg-green-700">Accept</button>
              <button onClick={() => decline(c.id)} className="text-xs border border-red-300 text-red-600 rounded px-3 py-1 hover:bg-red-50">Decline</button>
            </div>
          </div>
        ))}
        {!loading && challenges.length === 0 && (
          <p className="text-gray-400 text-sm">No incoming challenges.</p>
        )}
      </div>
    </main>
  );
}
