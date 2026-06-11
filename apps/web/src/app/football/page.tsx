import Link from 'next/link';

const sections = [
  { href: '/football/fixtures', label: 'Fixtures', description: 'Match schedule and results' },
  { href: '/football/standings', label: 'Standings', description: 'Group table' },
  { href: '/football/teams', label: 'Teams', description: 'All participating squads' },
  { href: '/football/players', label: 'Players', description: 'Player profiles' },
  { href: '/football/competitions', label: 'Competitions', description: 'All competitions' },
  { href: '/football/seasons', label: 'Seasons', description: 'Season history' },
];

export default function FootballHubPage() {
  return (
    <main className="min-h-screen bg-psl-navy">
      <div className="mx-auto max-w-2xl px-4 py-16">
        <h1 className="text-3xl font-bold text-white mb-2">Football</h1>
        <p className="text-psl-gold text-sm mb-10">FIFA World Cup 2026 — Beta</p>

        <div className="grid gap-3">
          {sections.map(s => (
            <Link
              key={s.href}
              href={s.href}
              className="flex items-center justify-between bg-white rounded-lg px-5 py-4 hover:bg-gray-50 transition"
            >
              <div>
                <p className="font-semibold text-psl-navy">{s.label}</p>
                <p className="text-xs text-gray-500">{s.description}</p>
              </div>
              <span className="text-gray-400">›</span>
            </Link>
          ))}
        </div>

        <p className="mt-10 text-center">
          <Link href="/" className="text-gray-400 text-sm hover:text-white transition">← Home</Link>
        </p>
      </div>
    </main>
  );
}
