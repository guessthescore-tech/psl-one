import Link from 'next/link';
import { getDataMode } from '@/lib/data';
import { HallOfFameCard } from '@/components/football/HallOfFameCard';
import type { HallOfFameEntry } from '@/components/football/HallOfFameCard';

// DESIGN_REVIEW_DATA only — no historical data
const TEASER_ENTRIES: HallOfFameEntry[] = [
  {
    id:          'hof-1',
    name:        'Lucas Radebe',
    nationality: 'South African',
    yearsActive: '1989 – 2005',
    achievement: 'Legendary Leeds United captain and South Africa\'s most decorated footballer. His leadership on the world stage inspired a generation of South African football fans and helped put PSL football on the global map.',
    imageKey:    'hof-radebe-portrait',
  },
  {
    id:          'hof-2',
    name:        'Benni McCarthy',
    nationality: 'South African',
    yearsActive: '1997 – 2012',
    achievement: 'All-time leading PSA and Bafana Bafana goalscorer, Champions League winner with Porto in 2004. The striker from Hanover Park became one of the most celebrated South African players in European football history.',
    imageKey:    'hof-mccarthy-portrait',
  },
];

export default function HallOfFamePage() {
  const mode = getDataMode();

  return (
    <div className="min-h-[100dvh] bg-exp-surface">
      {/* Design review banner */}
      {mode === 'DESIGN_REVIEW_DATA' && (
        <div
          role="banner"
          className="bg-purple-700 text-white text-center text-xs py-1.5 px-4 font-mono sticky top-0 z-50"
        >
          DESIGN_REVIEW_DATA — Hall of Fame (historical data requires tournament conclusion)
        </div>
      )}

      {/* Back nav */}
      <div className="bg-exp-navy border-b border-exp-border-dk px-4 py-3">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/stats/season"
            className="inline-flex items-center gap-1.5 text-label-md text-exp-muted hover:text-exp-gold transition-colors focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2 rounded"
          >
            ← Stats
          </Link>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-exp-navy border-b border-exp-border-dk px-4 pt-8 pb-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-4xl mb-3" aria-hidden>🏆</div>
          <div className="text-label-sm text-exp-gold font-bold uppercase tracking-wider mb-2">
            PSL One
          </div>
          <h1 className="text-display-xl text-white font-black mb-3">Hall of Fame</h1>
          <p className="text-body-md text-exp-muted max-w-lg mx-auto">
            Historical records will be available after the tournament concludes.
            The PSL One Hall of Fame will honour the legends who shaped South African football.
          </p>

          {/* Coming soon badge */}
          <div className="mt-5 inline-flex items-center gap-2 bg-exp-gold/10 border border-exp-gold/30 rounded-pill px-4 py-2">
            <span className="text-exp-gold text-xl" aria-hidden>🏅</span>
            <span className="text-label-md text-exp-gold font-bold">Coming after WC 2026</span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Design review notice */}
        <div
          className="bg-exp-gold/10 border border-exp-gold/30 rounded-card p-4 text-center"
          role="note"
          aria-label="Design review notice"
        >
          <span className="text-label-sm text-exp-gold font-bold">
            Design review — historical data requires tournament conclusion
          </span>
        </div>

        {/* Teaser cards */}
        <section aria-label="Hall of Fame preview">
          <h2 className="text-display-sm text-exp-navy font-black mb-4">
            Legends Preview
          </h2>
          <p className="text-body-sm text-exp-muted mb-4">
            A glimpse of the legends who will be inducted when the Hall of Fame opens.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {TEASER_ENTRIES.map((entry, i) => (
              <HallOfFameCard key={entry.id} entry={entry} index={i} />
            ))}
          </div>
        </section>

        {/* What to expect */}
        <section className="bg-exp-navy rounded-card border border-exp-border-dk p-6">
          <h2 className="text-display-sm text-white font-black mb-4">What to expect</h2>
          <ul className="space-y-3" aria-label="Hall of Fame features">
            {[
              { icon: '🏆', text: 'Complete career statistics for every inductee' },
              { icon: '🎬', text: 'Archive footage and match highlights' },
              { icon: '🗳️', text: 'Fan voting for each annual class' },
              { icon: '📖', text: 'In-depth player stories and interviews' },
              { icon: '🌍', text: 'PSL legends from all 16 clubs' },
            ].map((item) => (
              <li key={item.text} className="flex items-start gap-3 text-body-sm text-exp-muted">
                <span className="text-lg flex-shrink-0" aria-hidden>{item.icon}</span>
                {item.text}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
