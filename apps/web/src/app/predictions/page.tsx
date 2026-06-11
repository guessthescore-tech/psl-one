'use client';

import Link from 'next/link';

export default function PredictionsHubPage() {
  return (
    <main className="min-h-screen bg-psl-navy p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Predictions</h1>
      <div className="grid gap-4 max-w-sm">
        <Link
          href="/predictions/fixtures"
          className="block bg-white rounded-lg p-5 hover:bg-gray-50 transition"
        >
          <p className="font-semibold text-psl-navy">Make a Prediction</p>
          <p className="text-sm text-gray-500 mt-1">Pick scores for upcoming fixtures</p>
        </Link>
        <Link
          href="/predictions/me"
          className="block bg-white rounded-lg p-5 hover:bg-gray-50 transition"
        >
          <p className="font-semibold text-psl-navy">My Predictions</p>
          <p className="text-sm text-gray-500 mt-1">View your submitted predictions</p>
        </Link>
        <Link
          href="/challenges"
          className="block bg-white rounded-lg p-5 hover:bg-gray-50 transition"
        >
          <p className="font-semibold text-psl-navy">Peer Challenges</p>
          <p className="text-sm text-gray-500 mt-1">Challenge another fan to a prediction duel</p>
        </Link>
        <Link
          href="/leaderboards/predictions"
          className="block bg-white rounded-lg p-5 hover:bg-gray-50 transition"
        >
          <p className="font-semibold text-psl-navy">Leaderboard</p>
          <p className="text-sm text-gray-500 mt-1">See who has earned the most points</p>
        </Link>
      </div>
    </main>
  );
}
