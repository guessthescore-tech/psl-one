import Link from 'next/link';
import { WC_PLAYERS, getDataMode } from '@/lib/data';
import { PlayerStatGrid } from '@/components/football/PlayerStatGrid';
import { PlayerGameweekTable, MOCK_GAMEWEEK_ROWS } from '@/components/football/PlayerGameweekTable';
import type { PlayerStat } from '@/components/football/PlayerStatGrid';

interface PageProps {
  params: Promise<{ playerId: string }>;
}

export default async function PlayerStatsPage({ params }: PageProps) {
  const { playerId } = await params;
  const mode = getDataMode();

  const player = WC_PLAYERS.find((p) => p.id === playerId);

  if (!player) {
    return (
      <div className="min-h-[100dvh] bg-exp-surface flex items-center justify-center">
        <div className="text-center px-4">
          <div className="text-4xl mb-4" aria-hidden>⚽</div>
          <div className="text-display-md text-exp-navy font-black mb-2">Player not found</div>
          <Link
            href="/players"
            className="inline-flex items-center gap-2 bg-exp-gold text-exp-void font-bold px-6 py-3 rounded-card-sm hover:bg-exp-gold-2 transition-colors min-h-[44px] focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2"
          >
            Browse all players
          </Link>
        </div>
      </div>
    );
  }

  const allStats: PlayerStat[] = [
    { label: 'Goals',           value: player.goalsThisTournament,   highlight: true  },
    { label: 'Assists',         value: player.assistsThisTournament                   },
    { label: 'Appearances',     value: 3                                              },
    { label: 'Mins Played',     value: 252                                            },
    { label: 'Shots',           value: 14                                             },
    { label: 'On Target',       value: 9                                              },
    { label: 'Key Passes',      value: 12                                             },
    { label: 'Pass Accuracy',   value: '88%'                                         },
    { label: 'Dribbles',        value: 18                                             },
    { label: 'Fouls Won',       value: 8                                              },
    { label: 'Yellow Cards',    value: 0                                              },
    { label: 'Clean Sheets',    value: player.position === 'GK' ? 2 : player.position === 'DEF' ? 1 : 0 },
  ];

  const fantasyBreakdown: PlayerStat[] = [
    { label: 'Goal Bonus',      value: player.goalsThisTournament * 6,  highlight: true },
    { label: 'Assist Bonus',    value: player.assistsThisTournament * 3              },
    { label: 'Appearance Pts',  value: 6                                              },
    { label: 'CS Bonus',        value: player.position === 'DEF' ? 12 : 0            },
    { label: 'Total Pts',       value: player.fantasyPoints,            highlight: true },
  ];

  return (
    <div className="min-h-[100dvh] bg-exp-surface">
      {/* Design review banner */}
      {mode === 'DESIGN_REVIEW_DATA' && (
        <div
          role="banner"
          className="bg-purple-700 text-white text-center text-xs py-1.5 px-4 font-mono sticky top-0 z-50"
        >
          DESIGN_REVIEW_DATA — {player.name} detailed stats
        </div>
      )}

      {/* Back nav */}
      <div className="bg-exp-navy border-b border-exp-border-dk px-4 py-3">
        <div className="max-w-2xl mx-auto">
          <Link
            href={`/players/${playerId}`}
            className="inline-flex items-center gap-1.5 text-label-md text-exp-muted hover:text-exp-gold transition-colors focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2 rounded"
          >
            ← {player.name}
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-6 pb-10 space-y-8">
        {/* Page title */}
        <div>
          <div className="text-label-sm text-exp-gold font-bold uppercase tracking-wider mb-1">
            Season Statistics
          </div>
          <h1 className="text-display-lg text-exp-navy font-black">{player.name}</h1>
          <p className="text-body-sm text-exp-muted">{player.club.name} · {player.position}</p>
        </div>

        {/* All stats grid */}
        <section aria-label="All season stats">
          <h2 className="text-label-lg text-exp-muted font-bold uppercase tracking-wider mb-3">
            Performance
          </h2>
          <PlayerStatGrid stats={allStats} columns={4} />
        </section>

        {/* Radar chart placeholder (CSS-based) */}
        <section aria-label="Performance radar">
          <h2 className="text-label-lg text-exp-muted font-bold uppercase tracking-wider mb-3">
            Radar
          </h2>
          <div className="bg-exp-navy rounded-card border border-exp-border-dk p-6 flex flex-col items-center gap-4">
            {/* CSS hexagon approximation */}
            <div className="relative w-40 h-40" aria-hidden>
              <div className="absolute inset-0 border-2 border-exp-gold/30 rounded-full" />
              <div className="absolute inset-4 border border-exp-gold/20 rounded-full" />
              <div className="absolute inset-8 border border-exp-gold/10 rounded-full" />
              {/* Filled polygon approximation via background */}
              <div
                className="absolute inset-6 rounded-full"
                style={{
                  background:
                    'radial-gradient(circle, rgba(230,170,0,0.35) 0%, rgba(230,170,0,0.1) 70%, transparent 100%)',
                }}
              />
            </div>
            <div className="grid grid-cols-3 gap-2 w-full text-center text-label-sm text-exp-muted">
              <span>Shooting</span>
              <span>Passing</span>
              <span>Dribbling</span>
              <span>Defending</span>
              <span>Pace</span>
              <span>Physique</span>
            </div>
            <p className="text-label-sm text-exp-muted italic">
              Full radar chart requires live player data
            </p>
          </div>
        </section>

        {/* Match by match table */}
        <section aria-label="Match by match stats">
          <h2 className="text-label-lg text-exp-muted font-bold uppercase tracking-wider mb-3">
            Match by match
          </h2>
          <div className="bg-exp-navy rounded-card border border-exp-border-dk p-4">
            <PlayerGameweekTable rows={MOCK_GAMEWEEK_ROWS} />
          </div>
        </section>

        {/* Fantasy breakdown */}
        <section
          aria-label="Fantasy points breakdown"
          className="bg-exp-navy rounded-card border border-exp-gold/20 p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <span aria-hidden>⚡</span>
            <h2 className="text-label-lg text-exp-gold font-bold uppercase tracking-wider">
              Fantasy Points Breakdown
            </h2>
          </div>
          <PlayerStatGrid stats={fantasyBreakdown} columns={3} />
          <p className="text-label-sm text-exp-muted text-center mt-4">
            Points only · no real money · no financial value
          </p>
        </section>
      </div>
    </div>
  );
}
