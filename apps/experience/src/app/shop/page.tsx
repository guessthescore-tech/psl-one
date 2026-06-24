'use client';
/**
 * Fan-facing club shop discovery page.
 * CATALOGUE_ONLY — no checkout, no real-money, no wallet production.
 * Browse club merchandise listings from all 16 PSL clubs.
 */

const CLUBS = [
  { slug: 'kaizer-chiefs', name: 'Kaizer Chiefs', badge: '⚫🟡', colour: 'gold' },
  { slug: 'orlando-pirates', name: 'Orlando Pirates', badge: '💀', colour: 'slate' },
  { slug: 'mamelodi-sundowns', name: 'Mamelodi Sundowns', badge: '🌟', colour: 'yellow' },
  { slug: 'cape-town-city', name: 'Cape Town City', badge: '💙', colour: 'blue' },
  { slug: 'stellenbosch-fc', name: 'Stellenbosch FC', badge: '🍷', colour: 'red' },
  { slug: 'supersport-united', name: 'SuperSport United', badge: '⚽', colour: 'green' },
];

export default function ShopPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="py-12 px-4 max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="text-xs font-semibold text-amber-500 uppercase tracking-widest mb-2">
            CATALOGUE ONLY — Browse Only
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Club Shop</h1>
          <p className="text-slate-400">
            Browse official PSL club merchandise. Purchase links are coming soon.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CLUBS.map((club) => (
            <a
              key={club.slug}
              href={`/club/shop?club=${club.slug}`}
              className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-600 transition-colors group"
              aria-label={`Browse ${club.name} shop`}
            >
              <div className="text-4xl mb-3">{club.badge}</div>
              <h2 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                {club.name}
              </h2>
              <p className="text-slate-500 text-sm mt-1">View merchandise →</p>
            </a>
          ))}
        </div>

        <div className="mt-8 p-4 bg-amber-950/30 border border-amber-800/40 rounded-xl">
          <p className="text-amber-400 text-sm font-medium">
            🛒 Checkout coming soon — This is a merchandise catalogue preview.
            No purchases can be made at this time.
          </p>
        </div>
      </section>
    </main>
  );
}
