'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function AdminSeasonStatsPage() {
  const { seasonId } = useParams<{ seasonId: string }>();

  const SUB_PAGES = [
    { href: `readiness`, label: 'Readiness Report', description: 'Status breakdown and coverage metrics' },
    { href: `/admin/player-stats?seasonId=${seasonId}&status=DRAFT`, label: 'Draft Entries', description: 'Stats awaiting verification' },
    { href: `/admin/player-stats?seasonId=${seasonId}&status=VERIFIED`, label: 'Verified Entries', description: 'Stats ready to publish' },
    { href: `/admin/player-stats?seasonId=${seasonId}&status=PUBLISHED`, label: 'Published Entries', description: 'Publicly visible stats' },
  ];

  return (
    <main className="max-w-2xl mx-auto p-4">
      <div className="flex items-center gap-2 mb-1 text-xs text-gray-400">
        <Link href="/admin/player-stats" className="hover:text-gray-600">Player Stats</Link>
        <span>/</span>
        <span className="text-gray-600">Season</span>
      </div>

      <h1 className="text-xl font-bold text-gray-900 mt-1 mb-4">Season Player Stats Admin</h1>

      <div className="space-y-2">
        {SUB_PAGES.map((p) => (
          <Link
            key={p.href}
            href={p.href.startsWith('/') ? p.href : `/admin/player-stats/season/${seasonId}/${p.href}`}
            className="block bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300"
          >
            <p className="font-semibold text-sm">{p.label}</p>
            <p className="text-xs text-gray-500 mt-0.5">{p.description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
