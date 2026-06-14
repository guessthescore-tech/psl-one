'use client';

import { useEffect, useState } from 'react';
import { fanGetOutgoingChallenges, fanWithdrawDirectChallenge, fanGetShareLink } from '@/lib/social-prediction-client';
import { getBetaToken } from '@/lib/auth-client';

interface Challenge {
  id: string;
  committedPoints: number;
  supportingSelection: string;
  invitationStatus: string;
  createdAt: string;
  challengedUser?: { id: string; fanProfile?: { displayName?: string } };
  fixtureMarket?: { marketType: string; fixture?: { kickoffAt: string; homeTeam?: { name: string }; awayTeam?: { name: string } } };
}

export default function OutgoingChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [shareLinks, setShareLinks] = useState<Record<string, string>>({});

  async function load() {
    setLoading(true);
    try {
      const d = await fanGetOutgoingChallenges(getBetaToken());
      setChallenges(Array.isArray(d) ? d : []);
    } catch (e) {
      setMsg(String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function withdraw(id: string) {
    try {
      await fanWithdrawDirectChallenge(getBetaToken(), id);
      setMsg('Challenge withdrawn.');
      load();
    } catch (e) { setMsg(String(e)); }
  }

  async function getShareLink(id: string) {
    try {
      const d = await fanGetShareLink(getBetaToken(), id);
      setShareLinks(prev => ({ ...prev, [id]: d.shareLink }));
    } catch (e) { setMsg(String(e)); }
  }

  const statusColor: Record<string, string> = {
    PENDING: 'text-yellow-700 bg-yellow-50',
    ACCEPTED: 'text-green-700 bg-green-50',
    DECLINED: 'text-red-700 bg-red-50',
    WITHDRAWN: 'text-gray-500 bg-gray-100',
    EXPIRED: 'text-gray-400 bg-gray-50',
  };

  return (
    <main className="max-w-2xl mx-auto p-6">
      <a href="/social-challenges" className="text-xs text-blue-600 underline mb-4 inline-block">← Challenges</a>
      <h1 className="text-2xl font-bold mb-1">Outgoing Challenges</h1>
      <p className="text-xs text-gray-500 mb-5">Gameplay points only — cannot be exchanged for money.</p>

      {msg && <p className="mb-3 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded p-2">{msg}</p>}
      {loading && <p className="text-gray-400 text-sm">Loading...</p>}

      <div className="space-y-3">
        {challenges.map(c => (
          <div key={c.id} className="border rounded-lg p-4 bg-white shadow-sm">
            <div className="flex items-start justify-between mb-1">
              <div className="font-semibold text-sm">
                To: {c.challengedUser?.fanProfile?.displayName ?? 'A fan'}
              </div>
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${statusColor[c.invitationStatus] ?? 'bg-gray-100 text-gray-500'}`}>
                {c.invitationStatus}
              </span>
            </div>
            <div className="text-xs text-gray-600 mb-1">
              {c.fixtureMarket?.fixture?.homeTeam?.name} vs {c.fixtureMarket?.fixture?.awayTeam?.name}
            </div>
            <div className="text-xs text-gray-600 mb-2">
              Market: <strong>{c.fixtureMarket?.marketType?.replace(/_/g, ' ')}</strong> · Your pick: <strong>{c.supportingSelection}</strong> · {c.committedPoints} pts
            </div>
            <div className="flex gap-2">
              {c.invitationStatus === 'PENDING' && (
                <button onClick={() => withdraw(c.id)} className="text-xs border border-red-300 text-red-600 rounded px-3 py-1 hover:bg-red-50">
                  Withdraw
                </button>
              )}
              <button onClick={() => getShareLink(c.id)} className="text-xs border border-blue-300 text-blue-600 rounded px-3 py-1 hover:bg-blue-50">
                Share Link
              </button>
            </div>
            {shareLinks[c.id] && (
              <p className="mt-2 text-xs text-gray-600 bg-gray-50 rounded p-2 font-mono break-all">{shareLinks[c.id]}</p>
            )}
          </div>
        ))}
        {!loading && challenges.length === 0 && (
          <p className="text-gray-400 text-sm">No outgoing challenges.</p>
        )}
      </div>
    </main>
  );
}
