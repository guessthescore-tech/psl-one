'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { footballClient, type Team } from '@/lib/football-client';

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    footballClient.listTeams()
      .then(setTeams)
      .catch(() => setError('Could not load teams'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-psl-navy">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <nav className="text-gray-400 text-sm mb-6">
          <Link href="/football" className="hover:text-white transition">Football</Link>
          <span className="mx-2">›</span>
          <span className="text-white">Teams</span>
        </nav>

        <h1 className="text-2xl font-bold text-white mb-6">Teams</h1>

        {loading && <p className="text-gray-400 text-sm">Loading…</p>}
        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="space-y-2">
          {teams.map(t => (
            <Link
              key={t.id}
              href={`/football/teams/${t.slug}`}
              className="flex items-center justify-between bg-white rounded-lg px-5 py-4 hover:bg-gray-50 transition"
            >
              <div>
                <p className="font-semibold text-psl-navy">{t.name}</p>
                <p className="text-xs text-gray-500">{t.country} · {t.shortName}</p>
              </div>
              <span className="text-gray-400">›</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
