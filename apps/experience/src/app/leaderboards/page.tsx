'use client';

/**
 * Leaderboards hub — client component (needs token for API calls).
 *
 * PSL_INACTIVE · GTS_POINTS_ONLY · FANTASY_POINTS_ONLY · NO_REAL_MONEY
 *
 * Shows overview cards linking to global, fantasy, and GTS leaderboards.
 * Does not call a live API directly — all data comes via the admin or fan
 * endpoints when a token is present.
 */

import Link from 'next/link';
import { getToken } from '@/lib/auth';
import { useState, useEffect } from 'react';

interface LeaderEntry {
  rank: number;
  username: string;
  points: number;
}

export default function LeaderboardsPage() {
  const [topFans, setTopFans] = useState<LeaderEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    const apiBase = process.env['NEXT_PUBLIC_API_BASE_URL'] ?? 'http://localhost:4000';
    fetch(`${apiBase}/leaderboard/global?limit=5`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() as Promise<{ data?: LeaderEntry[]; entries?: LeaderEntry[] } | LeaderEntry[]> : Promise.resolve([]))
      .then(data => {
        if (Array.isArray(data)) setTopFans(data.slice(0, 5));
        else if (data && typeof data === 'object') {
          const entries = 'data' in data ? (data as { data: LeaderEntry[] }).data : (data as { entries: LeaderEntry[] }).entries;
          if (Array.isArray(entries)) setTopFans(entries.slice(0, 5));
        }
      })
      .catch(() => setError('Could not load leaderboard data.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      {/* Beta banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-center">
        <span className="text-xs text-amber-400/90 font-medium">
          BETA — PSL INACTIVE · Points only · No real-money prizes
        </span>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0a1628] via-[#071020] to-[#050505] border-b border-white/10 py-14 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🏅</span>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-400/10 px-3 py-1 rounded-full">
              Leaderboards
            </span>
            <span className="text-xs text-white/40 bg-white/5 px-3 py-1 rounded-full font-mono">BETA</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
            Fan <span className="text-emerald-400">Rankings</span>
          </h1>
          <p className="text-white/60 max-w-xl">
            Points-based rankings across Guess the Score and Fantasy Football.
            No real-money prizes — compete for glory!
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-10">

        {/* Leaderboard type cards */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {([
            {
              href: '/stats/season',
              title: 'Global Leaderboard',
              desc: 'Combined points across all PSL One games.',
              icon: '🌍',
              badge: 'GLOBAL',
              badgeColor: 'bg-emerald-500/10 text-emerald-400',
            },
            {
              href: '/fantasy/leagues',
              title: 'Fantasy Rankings',
              desc: 'Fantasy team points — gameweek and season totals.',
              icon: '⚽',
              badge: 'FANTASY',
              badgeColor: 'bg-blue-500/10 text-blue-400',
            },
            {
              href: '/predict',
              title: 'Prediction Rankings',
              desc: 'Guess the Score accuracy leaderboard.',
              icon: '🎯',
              badge: 'GTS',
              badgeColor: 'bg-purple-500/10 text-purple-400',
            },
          ] as const).map(({ href, title, desc, icon, badge, badgeColor }) => (
            <Link
              key={href}
              href={href}
              className="block rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.05] p-6 transition-colors group"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl">{icon}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full font-mono ${badgeColor}`}>{badge}</span>
              </div>
              <h3 className="font-semibold text-sm text-white group-hover:text-emerald-400 transition-colors mb-1">{title}</h3>
              <p className="text-xs text-white/40">{desc}</p>
              <p className="text-xs text-emerald-400 mt-3">View rankings →</p>
            </Link>
          ))}
        </section>

        {/* Top 5 preview */}
        <section>
          <h2 className="text-sm font-bold uppercase tracking-widest text-white/60 mb-5">Top Fans This Season</h2>

          {loading && (
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center text-white/40 text-sm">
              Loading leaderboard…
            </div>
          )}

          {error && !loading && (
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center text-white/40 text-sm">
              {error}
            </div>
          )}

          {!loading && !error && topFans.length > 0 && (
            <div className="rounded-xl border border-white/10 overflow-hidden">
              {topFans.map((fan, idx) => (
                <div
                  key={fan.rank ?? idx}
                  className="flex items-center gap-4 px-5 py-3.5 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
                >
                  <span className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold flex-shrink-0 ${
                    idx === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                    idx === 1 ? 'bg-slate-400/20 text-slate-300' :
                    idx === 2 ? 'bg-orange-500/20 text-orange-400' :
                    'bg-white/5 text-white/50'
                  }`}>
                    {fan.rank ?? idx + 1}
                  </span>
                  <span className="flex-1 text-sm font-medium text-white/90">{fan.username}</span>
                  <span className="text-sm font-mono text-emerald-400">{fan.points.toLocaleString()} pts</span>
                </div>
              ))}
            </div>
          )}

          {!loading && !error && topFans.length === 0 && (
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-10 text-center">
              <div className="text-3xl mb-3">🏅</div>
              <p className="text-white/50 text-sm">
                Sign in to see the global leaderboard.
              </p>
              <div className="mt-4">
                <Link
                  href="/sign-in"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-sm font-medium hover:bg-emerald-500/25 transition-colors"
                >
                  Sign In →
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* No real money notice */}
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-amber-400/80">
          <strong>Points only:</strong> All leaderboard scores are points-based.
          No real-money prizes are offered during the beta period. PSL season is INACTIVE.
        </div>
      </div>
    </main>
  );
}
