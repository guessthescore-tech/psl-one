'use client';

import Link from 'next/link';

export default function PlayersIndexPage() {
  return (
    <main className="max-w-2xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Players</h1>
        <Link href="/" className="text-sm text-blue-600 underline">Home</Link>
      </div>
      <div className="space-y-3">
        <div className="border border-gray-200 rounded-lg p-4 bg-white">
          <h2 className="font-semibold text-sm mb-1">Season Stats</h2>
          <p className="text-xs text-gray-500 mb-2">Browse top performers and match statistics per season.</p>
          <Link href="/players/season" className="text-xs text-blue-600 underline">View Season Stats →</Link>
        </div>
        <div className="border border-gray-200 rounded-lg p-4 bg-white">
          <h2 className="font-semibold text-sm mb-1">Gameweek Stats</h2>
          <p className="text-xs text-gray-500 mb-2">View player performance for individual gameweeks.</p>
          <Link href="/gameweeks" className="text-xs text-blue-600 underline">Browse Gameweeks →</Link>
        </div>
        <div className="border border-gray-200 rounded-lg p-4 bg-white">
          <h2 className="font-semibold text-sm mb-1">Club Squads</h2>
          <p className="text-xs text-gray-500 mb-2">View squad statistics by club for the current season.</p>
          <Link href="/clubs" className="text-xs text-blue-600 underline">Browse Clubs →</Link>
        </div>
      </div>
    </main>
  );
}
