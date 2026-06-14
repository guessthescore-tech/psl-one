'use client';

import { use, useEffect, useState } from 'react';
import { fanGetListing, fanAcceptDirectChallenge, fanDeclineDirectChallenge, fanWithdrawDirectChallenge, fanGetShareLink } from '@/lib/social-prediction-client';
import { getBetaToken } from '@/lib/auth-client';

interface ChallengeDetail {
  id: string;
  fanUserId: string;
  challengedUserId?: string;
  challengeMode: string;
  invitationStatus?: string;
  status: string;
  supportingSelection: string;
  opposingSelection: string;
  committedPoints: number;
  potentialPointsAward: number;
  createdAt: string;
  fixtureMarket?: { marketType: string; fixture?: { homeTeam?: { name: string }; awayTeam?: { name: string }; kickoffAt: string } };
}

export default function ChallengeDetailPage({ params }: { params: Promise<{ challengeId: string }> }) {
  const { challengeId } = use(params);
  const [challenge, setChallenge] = useState<ChallengeDetail | null>(null);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fanGetListing(getBetaToken(), challengeId)
      .then(d => setChallenge(d))
      .catch(e => setMsg(String(e)))
      .finally(() => setLoading(false));
  }, [challengeId]);

  async function accept() {
    try {
      await fanAcceptDirectChallenge(getBetaToken(), challengeId);
      setMsg('Challenge accepted!');
    } catch (e) { setMsg(String(e)); }
  }

  async function decline() {
    try {
      await fanDeclineDirectChallenge(getBetaToken(), challengeId);
      setMsg('Challenge declined.');
    } catch (e) { setMsg(String(e)); }
  }

  async function withdraw() {
    try {
      await fanWithdrawDirectChallenge(getBetaToken(), challengeId);
      setMsg('Challenge withdrawn.');
    } catch (e) { setMsg(String(e)); }
  }

  async function getLink() {
    try {
      const d = await fanGetShareLink(getBetaToken(), challengeId);
      setShareLink(d.shareLink);
    } catch (e) { setMsg(String(e)); }
  }

  if (loading) return <main className="max-w-lg mx-auto p-6"><p className="text-gray-400 text-sm">Loading…</p></main>;

  return (
    <main className="max-w-lg mx-auto p-6">
      <a href="/social-challenges" className="text-xs text-blue-600 underline mb-4 inline-block">← Challenges</a>
      <h1 className="text-2xl font-bold mb-4">Challenge Detail</h1>

      <p className="text-xs text-gray-500 mb-4">Gameplay points only — cannot be exchanged for money.</p>

      {msg && <p className="mb-4 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded p-2">{msg}</p>}

      {challenge && (
        <div className="border rounded-lg p-5 bg-white shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-sm">{challenge.fixtureMarket?.marketType?.replace(/_/g, ' ')}</span>
            <span className="text-xs text-gray-400">{new Date(challenge.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="text-xs text-gray-600">
            {challenge.fixtureMarket?.fixture?.homeTeam?.name} vs {challenge.fixtureMarket?.fixture?.awayTeam?.name}
          </div>
          <div className="text-xs space-y-1">
            <div>Mode: <span className="font-medium">{challenge.challengeMode?.replace(/_/g, ' ')}</span></div>
            {challenge.invitationStatus && <div>Invitation: <span className="font-medium">{challenge.invitationStatus}</span></div>}
            <div>Supporting: <strong>{challenge.supportingSelection}</strong></div>
            <div>Opposing: <strong>{challenge.opposingSelection}</strong></div>
            <div>Committed: <strong>{challenge.committedPoints} pts</strong></div>
            <div>Potential award: <strong>{challenge.potentialPointsAward} pts</strong></div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {challenge.invitationStatus === 'PENDING' && challenge.challengedUserId && (
              <>
                <button onClick={accept} className="text-xs bg-green-600 text-white rounded px-3 py-1 hover:bg-green-700">Accept</button>
                <button onClick={decline} className="text-xs border border-red-300 text-red-600 rounded px-3 py-1 hover:bg-red-50">Decline</button>
              </>
            )}
            {challenge.invitationStatus === 'PENDING' && !challenge.challengedUserId && (
              <button onClick={withdraw} className="text-xs border border-red-300 text-red-600 rounded px-3 py-1 hover:bg-red-50">Withdraw</button>
            )}
            <button onClick={getLink} className="text-xs border border-blue-300 text-blue-600 rounded px-3 py-1 hover:bg-blue-50">Get Share Link</button>
          </div>

          {shareLink && (
            <div className="bg-gray-50 rounded p-3 text-xs font-mono break-all text-gray-700">
              {shareLink}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
