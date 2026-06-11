'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { challengesClient, type Challenge } from '@/lib/challenges-client';
import { me } from '@/lib/auth-client';

function PredictionBlock({
  label,
  home: teamHome,
  away: teamAway,
  predHome,
  predAway,
  points,
  isWinner,
}: {
  label: string;
  home: string;
  away: string;
  predHome: number;
  predAway: number;
  points: number | null;
  isWinner: boolean;
}) {
  return (
    <div className={`flex-1 rounded-lg p-4 border-2 ${isWinner ? 'border-psl-gold bg-yellow-50' : 'border-gray-100 bg-gray-50'}`}>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="font-mono font-bold text-xl text-psl-navy text-center my-2">
        {predHome}–{predAway}
      </p>
      <p className="text-xs text-gray-400 text-center">{teamHome} vs {teamAway}</p>
      {points !== null && (
        <p className={`text-center text-xs font-semibold mt-2 ${isWinner ? 'text-psl-gold' : 'text-gray-400'}`}>
          {points} pts {isWinner ? '🏆' : ''}
        </p>
      )}
    </div>
  );
}

export default function ChallengeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      challengesClient.getChallenge(id),
      me(),
    ])
      .then(([ch, user]) => {
        setChallenge(ch);
        setUserId(user.id);
        setLoading(false);
      })
      .catch(() => router.push('/login'));
  }, [id, router]);

  async function doAction(action: 'accept' | 'decline' | 'cancel') {
    setError(null);
    setActing(true);
    try {
      let updated: Challenge;
      if (action === 'accept') updated = await challengesClient.acceptChallenge(id);
      else if (action === 'decline') updated = await challengesClient.declineChallenge(id);
      else updated = await challengesClient.cancelChallenge(id);
      setChallenge(updated);
    } catch (e: unknown) {
      setError((e as Error).message ?? 'Action failed');
    } finally {
      setActing(false);
    }
  }

  if (loading || !challenge) {
    return (
      <main className="min-h-screen bg-psl-navy flex items-center justify-center">
        <p className="text-white text-sm">Loading…</p>
      </main>
    );
  }

  const isChallenger = userId === challenge.challengerUserId;
  const isOpponent = userId === challenge.opponentUserId;
  const { fixture } = challenge;
  const cPred = challenge.challengerPrediction;
  const oPred = challenge.opponentPrediction;

  return (
    <main className="min-h-screen bg-psl-navy p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/challenges" className="text-white/60 hover:text-white text-sm">Challenges</Link>
        <span className="text-white/30">/</span>
        <span className="text-white text-sm">
          {fixture.homeTeam.shortName} vs {fixture.awayTeam.shortName}
        </span>
      </div>

      <div className="bg-white rounded-xl p-5 max-w-sm mx-auto">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-gray-400">
            {new Date(fixture.kickoffAt).toLocaleDateString('en-ZA', {
              weekday: 'short', day: 'numeric', month: 'short',
            })}
          </p>
          <span className="text-xs font-medium text-psl-navy bg-gray-100 px-2 py-0.5 rounded-full">
            {challenge.status}
          </span>
        </div>

        {cPred && oPred ? (
          <div className="flex gap-3 mb-4">
            <PredictionBlock
              label="Challenger"
              home={fixture.homeTeam.shortName}
              away={fixture.awayTeam.shortName}
              predHome={cPred.predictedHomeScore}
              predAway={cPred.predictedAwayScore}
              points={challenge.pointsAwardedChallenger}
              isWinner={challenge.winnerUserId === challenge.challengerUserId}
            />
            <PredictionBlock
              label="Opponent"
              home={fixture.homeTeam.shortName}
              away={fixture.awayTeam.shortName}
              predHome={oPred.predictedHomeScore}
              predAway={oPred.predictedAwayScore}
              points={challenge.pointsAwardedOpponent}
              isWinner={challenge.winnerUserId === challenge.opponentUserId}
            />
          </div>
        ) : cPred ? (
          <div className="mb-4">
            <PredictionBlock
              label="Challenger prediction"
              home={fixture.homeTeam.shortName}
              away={fixture.awayTeam.shortName}
              predHome={cPred.predictedHomeScore}
              predAway={cPred.predictedAwayScore}
              points={null}
              isWinner={false}
            />
            {challenge.status === 'PENDING' && isOpponent && (
              <p className="text-xs text-amber-600 text-center mt-2">
                Submit your prediction before accepting
              </p>
            )}
          </div>
        ) : null}

        {challenge.status === 'SETTLED' && challenge.winnerUserId === null && (
          <p className="text-center text-xs text-gray-500 mb-3">It&apos;s a draw — bragging rights shared!</p>
        )}

        {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

        {challenge.status === 'PENDING' && isOpponent && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => doAction('accept')}
              disabled={acting}
              className="flex-1 bg-psl-navy text-white font-semibold py-2.5 rounded-lg hover:bg-psl-navy/90 disabled:opacity-50 transition text-sm"
            >
              Accept
            </button>
            <button
              type="button"
              onClick={() => doAction('decline')}
              disabled={acting}
              className="flex-1 bg-gray-100 text-gray-700 font-semibold py-2.5 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition text-sm"
            >
              Decline
            </button>
          </div>
        )}

        {challenge.status === 'PENDING' && isChallenger && (
          <button
            type="button"
            onClick={() => doAction('cancel')}
            disabled={acting}
            className="w-full bg-gray-100 text-gray-600 font-semibold py-2.5 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition text-sm"
          >
            Cancel Challenge
          </button>
        )}
      </div>
    </main>
  );
}
