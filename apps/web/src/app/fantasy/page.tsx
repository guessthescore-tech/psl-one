'use client';

import Link from 'next/link';

const LINKS = [
  { href: '/fantasy/team', title: 'My Squad', desc: 'View and manage your 15-player squad' },
  { href: '/fantasy/team/create', title: 'Build Squad', desc: 'Pick your 15 players from the full pool' },
  { href: '/fantasy/transfers', title: 'Transfers', desc: 'Swap players in and out of your squad' },
  { href: '/fantasy/player-pool', title: 'Player Pool', desc: 'Browse all 1,200 World Cup players' },
  { href: '/fantasy/leaderboard', title: 'Leaderboard', desc: 'See global fantasy rankings' },
  { href: '/gameweeks', title: 'Gameweeks', desc: 'Deadlines, lock state, and fixture schedule' },
];

export default function FantasyPage() {
  return (
    <main className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Fantasy Football</h1>
      <p className="text-gray-600">
        Pick your 15-player World Cup squad and score FPL-style points.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {LINKS.map(l => (
          <Link
            key={l.href}
            href={l.href}
            className="block p-5 rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-md transition"
          >
            <div className="text-base font-semibold">{l.title}</div>
            <div className="text-sm text-gray-500 mt-1">{l.desc}</div>
          </Link>
        ))}
      </div>

      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600 space-y-1">
        <div className="font-semibold text-gray-700">Squad rules</div>
        <ul className="list-disc list-inside space-y-0.5">
          <li>15 players: 2 GK · 5 DEF · 5 MID · 3 FWD</li>
          <li>Starting XI of 11 (1 GK, min 3 DEF, min 2 MID, min 1 FWD)</li>
          <li>Formations: 3-4-3 · 3-5-2 · 4-3-3 · 4-4-2 · 4-5-1 · 5-3-2 · 5-4-1</li>
          <li>Max 3 players from the same team</li>
          <li>Captain scores double points</li>
        </ul>
      </div>
    </main>
  );
}
