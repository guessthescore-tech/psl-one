import Link from 'next/link';
import { WC_STANDINGS, getDataMode } from '@/lib/data';
import { StandingsTable } from '@/components/football/StandingsTable';

export default function StandingsPage() {
  const mode = getDataMode();
  const standings = WC_STANDINGS;

  return (
    <div className="min-h-[100dvh] bg-exp-surface">
      {/* Design review banner */}
      {mode === 'DESIGN_REVIEW_DATA' && (
        <div
          role="banner"
          className="bg-purple-700 text-white text-center text-xs py-1.5 px-4 font-mono sticky top-0 z-50"
        >
          DESIGN_REVIEW_DATA — WC 2026 standings
        </div>
      )}

      {/* Back nav */}
      <div className="bg-exp-navy border-b border-exp-border-dk px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-label-md text-exp-muted hover:text-exp-gold transition-colors focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2 rounded"
          >
            ← Home
          </Link>
          <span className="text-exp-border-dk" aria-hidden>|</span>
          <Link
            href="/stats/season"
            className="text-label-md text-exp-muted hover:text-exp-gold transition-colors focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2 rounded"
          >
            Season Stats
          </Link>
        </div>
      </div>

      {/* Page header */}
      <div className="bg-exp-navy border-b border-exp-border-dk px-4 pt-6 pb-5">
        <div className="max-w-2xl mx-auto">
          <div className="text-label-sm text-exp-gold font-bold uppercase tracking-wider mb-1">
            FIFA World Cup 2026
          </div>
          <h1 className="text-display-lg text-white font-black">Standings</h1>
          <p className="text-body-sm text-exp-muted mt-1">Overall tournament table</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Group selector placeholder */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1" role="group" aria-label="Group selector">
          {['Overall', 'Group A', 'Group B', 'Group C', 'Group D'].map((g, i) => (
            <button
              key={g}
              type="button"
              className={`flex-shrink-0 px-3 py-1.5 rounded-pill text-label-md font-bold transition-all min-h-[44px] focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2 ${
                i === 0
                  ? 'bg-exp-gold text-exp-void'
                  : 'bg-exp-navy border border-exp-border-dk text-exp-muted hover:text-white hover:border-exp-gold/40'
              }`}
              aria-pressed={i === 0}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Main standings table */}
        <div className="bg-exp-navy rounded-card border border-exp-border-dk overflow-hidden">
          <StandingsTable
            standings={standings}
            qualificationSpots={4}
            dangerZone={0}
          />
        </div>

        {/* Group note */}
        <p className="text-label-sm text-exp-muted mt-4 text-center">
          WC 2026 group stage · Top 2 from each group advance
        </p>
      </div>
    </div>
  );
}
