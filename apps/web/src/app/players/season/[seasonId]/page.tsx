'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function PlayerSeasonIndexPage() {
  const { seasonId } = useParams<{ seasonId: string }>();

  return (
    <main className="max-w-2xl mx-auto p-4">
      <div className="flex items-center gap-2 mb-1 text-xs text-gray-400">
        <Link href="/players" className="hover:text-gray-600">Players</Link>
        <span>/</span>
        <span className="text-gray-600">Season</span>
      </div>
      <h1 className="text-xl font-bold text-gray-900 mt-1 mb-4">Season Player Stats</h1>
      <div className="space-y-2">
        <Link
          href={`/players/season/${seasonId}/top-performers`}
          className="block bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300"
        >
          <p className="font-semibold text-sm">Top Performers</p>
          <p className="text-xs text-gray-500 mt-0.5">Top scorers and assist providers for this season</p>
        </Link>
      </div>
    </main>
  );
}
