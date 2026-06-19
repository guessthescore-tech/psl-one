import Link from 'next/link';
import { WC_PLAYERS, getDataMode } from '@/lib/data';
import { AwardCard } from '@/components/football/AwardCard';
import type { Award } from '@/components/football/AwardCard';

// DESIGN_REVIEW_DATA only — no awards model
const MOCK_AWARDS: Award[] = [
  {
    id:               'award-goal-of-tournament',
    title:            'Goal of the Tournament',
    recipient:        'Kylian Mbappe',
    recipientImageKey:'wc-player-mbappe-portrait',
    matchContext:     'France vs Brazil · Matchday 1',
    description:      'A stunning solo run from the halfway line, leaving four defenders in his wake before slotting home with his weaker foot. Pure genius.',
    icon:             '⚽',
  },
  {
    id:               'award-save-of-tournament',
    title:            'Save of the Tournament',
    recipient:        'Yassine Bounou',
    recipientImageKey:'wc-player-bounou-portrait',
    matchContext:     'Morocco vs Spain · Matchday 2',
    description:      'A full-stretch fingertip save in the dying minutes that defied physics and denied an almost certain goal to preserve a historic clean sheet.',
    icon:             '🧤',
  },
  {
    id:               'award-young-player',
    title:            'Young Player of the Tournament',
    recipient:        'Pedri',
    recipientImageKey:'wc-player-pedri-portrait',
    matchContext:     'Spain · Group A',
    description:      'The Barcelona midfielder has been the creative heartbeat of the tournament, combining technical excellence with remarkable maturity beyond his years.',
    icon:             '⭐',
  },
  {
    id:               'award-golden-boot',
    title:            'Golden Boot Leader',
    recipient:        'Kylian Mbappe',
    recipientImageKey:'wc-player-mbappe-portrait',
    matchContext:     'France · 5 goals',
    description:      'Leading the race for the Golden Boot with five goals in just three matches, Mbappe is on track to claim the individual honour to match his team\'s brilliance.',
    icon:             '🥾',
  },
];

const BEST_XI_PLAYERS = [
  { name: 'Maignan',    pos: 'GK',  club: 'FRA' },
  { name: 'Hakimi',     pos: 'RB',  club: 'MAR' },
  { name: 'Ruben Dias', pos: 'CB',  club: 'POR' },
  { name: 'Upamecano', pos: 'CB',  club: 'FRA' },
  { name: 'Theo',       pos: 'LB',  club: 'FRA' },
  { name: 'Pedri',      pos: 'CM',  club: 'ESP' },
  { name: 'Bellingham', pos: 'CM',  club: 'ENG' },
  { name: 'Camavinga', pos: 'CM',  club: 'FRA' },
  { name: 'Mbappe',     pos: 'RW',  club: 'FRA' },
  { name: 'Vinicius',   pos: 'ST',  club: 'BRA' },
  { name: 'Sané',      pos: 'LW',  club: 'GER' },
];

export default function AwardsPage() {
  const mode = getDataMode();
  const mbappe = WC_PLAYERS.find((p) => p.id === 'mbappe');

  return (
    <div className="min-h-[100dvh] bg-exp-surface">
      {/* Design review banner */}
      {mode === 'DESIGN_REVIEW_DATA' && (
        <div
          role="banner"
          className="bg-purple-700 text-white text-center text-xs py-1.5 px-4 font-mono sticky top-0 z-50"
        >
          DESIGN_REVIEW_DATA — awards (no awards model yet)
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

      {/* Page header */}
      <div className="bg-exp-navy border-b border-exp-border-dk px-4 pt-6 pb-5">
        <div className="max-w-2xl mx-auto">
          <div className="text-label-sm text-exp-gold font-bold uppercase tracking-wider mb-1">
            FIFA World Cup 2026
          </div>
          <h1 className="text-display-lg text-white font-black">Tournament Awards</h1>
          <p className="text-body-sm text-exp-muted mt-1">
            Recognising excellence at WC 2026
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">
        {/* Award cards */}
        <section aria-label="Tournament awards">
          <div className="space-y-4">
            {MOCK_AWARDS.map((award, i) => (
              <AwardCard key={award.id} award={award} index={i} />
            ))}
          </div>
        </section>

        {/* Best XI */}
        <section aria-label="Best XI">
          <h2 className="text-display-sm text-exp-navy font-black mb-4">Best XI</h2>
          <div className="bg-exp-navy rounded-card border border-exp-border-dk p-5">
            <div className="relative bg-pitch-dark rounded-card-sm p-4 min-h-64" aria-label="Best XI formation">
              {/* Simple list — no complex pitch needed here */}
              <div className="grid grid-cols-3 gap-2">
                {BEST_XI_PLAYERS.map((p) => (
                  <div
                    key={p.name}
                    className="bg-exp-ink/80 border border-exp-border-dk rounded-card-sm px-2 py-1.5 text-center"
                  >
                    <div className="text-body-sm font-bold text-white truncate">{p.name}</div>
                    <div className="text-label-sm text-exp-muted">{p.pos} · {p.club}</div>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-label-sm text-exp-muted text-center mt-3">
              Best XI as voted by PSL One editorial team · design review only
            </p>
          </div>
        </section>

        {/* Golden Boot contenders */}
        <section aria-label="Golden Boot contenders">
          <h2 className="text-display-sm text-exp-navy font-black mb-4">Golden Boot Race</h2>
          <div className="space-y-2">
            {[...WC_PLAYERS]
              .sort((a, b) => b.goalsThisTournament - a.goalsThisTournament)
              .map((p, i) => (
                <Link
                  key={p.id}
                  href={`/players/${p.id}`}
                  className="flex items-center gap-3 bg-exp-navy rounded-card-sm border border-exp-border-dk px-4 py-3 hover:border-exp-gold/40 transition-colors min-h-[44px] focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2"
                  aria-label={`${p.name}: ${p.goalsThisTournament} goals`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-label-sm font-black flex-shrink-0 ${
                      i === 0 ? 'bg-yellow-400/20 text-yellow-400' :
                      i === 1 ? 'bg-gray-400/20 text-gray-300' :
                      i === 2 ? 'bg-amber-700/20 text-amber-600' :
                      'bg-exp-ink text-exp-muted'
                    }`}
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-semibold text-body-sm truncate">{p.name}</div>
                    <div className="text-exp-muted text-label-sm">{p.club.name}</div>
                  </div>
                  <div className="text-exp-gold font-black text-stat-md tabular-nums">
                    {p.goalsThisTournament}
                    <span className="text-label-sm text-exp-muted ml-1">G</span>
                  </div>
                </Link>
              ))}
          </div>
        </section>
      </div>
    </div>
  );
}
