'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { clsx } from 'clsx';
import { WC_PLAYERS, getDataMode } from '@/lib/data';
import { PlayerProfileHero } from '@/components/football/PlayerProfileHero';
import { PlayerStatGrid } from '@/components/football/PlayerStatGrid';
import { PlayerGameweekTable, MOCK_GAMEWEEK_ROWS } from '@/components/football/PlayerGameweekTable';
import type { PlayerStat } from '@/components/football/PlayerStatGrid';

type Tab = 'season' | 'fantasy' | 'matches';

interface PageProps {
  params: Promise<{ playerId: string }>;
}

export default function PlayerProfilePage({ params }: PageProps) {
  const { playerId } = use(params);
  const [activeTab, setActiveTab] = useState<Tab>('season');
  const mode = getDataMode();

  const player = WC_PLAYERS.find((p) => p.id === playerId);

  if (!player) {
    return (
      <div className="min-h-[100dvh] bg-exp-surface flex items-center justify-center">
        <div className="text-center px-4">
          <div className="text-4xl mb-4" aria-hidden>⚽</div>
          <div className="text-display-md text-exp-navy font-black mb-2">Player not found</div>
          <p className="text-body-md text-exp-muted mb-6">
            We couldn't find a player with that ID.
          </p>
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

  const seasonStats: PlayerStat[] = [
    { label: 'Goals',       value: player.goalsThisTournament,   highlight: true  },
    { label: 'Assists',     value: player.assistsThisTournament                   },
    { label: 'Clean Sheets',value: player.position === 'GK' ? 2 : player.position === 'DEF' ? 1 : 0 },
    { label: 'Appearances', value: 3                                              },
    { label: 'Avg Rating',  value: '8.1'                                         },
    { label: 'Form',        value: '↑↑↑'                                          },
  ];

  const fantasyStats: PlayerStat[] = [
    { label: 'Price',       value: `£${player.fantasyPrice}m`,  highlight: true  },
    { label: 'Ownership',   value: '42%'                                          },
    { label: 'Total Pts',   value: player.fantasyPoints,        highlight: true  },
    { label: 'Last GW Pts', value: Math.round(player.fantasyPoints / 3)          },
  ];

  const tabs: Array<{ id: Tab; label: string }> = [
    { id: 'season',  label: 'Season'  },
    { id: 'fantasy', label: 'Fantasy' },
    { id: 'matches', label: 'Matches' },
  ];

  return (
    <div className="min-h-[100dvh] bg-exp-surface">
      {/* Design review banner */}
      {mode === 'DESIGN_REVIEW_DATA' && (
        <div
          role="banner"
          className="bg-purple-700 text-white text-center text-xs py-1.5 px-4 font-mono sticky top-0 z-50"
        >
          DESIGN_REVIEW_DATA — {player.name}
        </div>
      )}

      {/* Back nav */}
      <div className="bg-exp-navy border-b border-exp-border-dk px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link
            href="/players"
            className="inline-flex items-center gap-1.5 text-label-md text-exp-muted hover:text-exp-gold transition-colors focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2 rounded"
          >
            ← Players
          </Link>
          <Link
            href={`/players/${playerId}/stats`}
            className="text-label-md text-exp-gold hover:underline focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2 rounded"
          >
            Full stats →
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-6 pb-10 space-y-6">
        {/* Hero */}
        <PlayerProfileHero player={player} rating={8.1} />

        {/* Season stats */}
        <section aria-label="Season statistics">
          <h2 className="text-label-lg text-exp-muted font-bold uppercase tracking-wider mb-3">
            Tournament Stats
          </h2>
          <PlayerStatGrid stats={seasonStats} columns={3} />
        </section>

        {/* Fantasy section */}
        <section
          aria-label="Fantasy statistics"
          className="bg-exp-navy rounded-card border border-exp-border-dk p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl" aria-hidden>⚡</span>
            <h2 className="text-label-lg text-exp-gold font-bold uppercase tracking-wider">
              Fantasy
            </h2>
            <span className="ml-auto text-label-sm text-exp-muted">
              Points only · no real money
            </span>
          </div>
          <PlayerStatGrid stats={fantasyStats} columns={4} />
        </section>

        {/* Tabs */}
        <div>
          <div className="flex gap-1 border-b border-exp-border mb-5" role="tablist" aria-label="Player detail tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`player-panel-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'px-4 py-2.5 text-label-md font-bold transition-all min-h-[44px]',
                  'focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2',
                  activeTab === tab.id
                    ? 'text-exp-navy border-b-2 border-exp-gold'
                    : 'text-exp-muted hover:text-exp-navy',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div id={`player-panel-${activeTab}`} role="tabpanel">
            {/* Season tab */}
            {activeTab === 'season' && (
              <div className="space-y-4">
                <h3 className="text-label-lg text-exp-muted font-bold uppercase tracking-wider">
                  Gameweek by gameweek
                </h3>
                <PlayerGameweekTable rows={MOCK_GAMEWEEK_ROWS} />
              </div>
            )}

            {/* Fantasy tab */}
            {activeTab === 'fantasy' && (
              <div className="space-y-4">
                {/* Price history placeholder */}
                <div className="bg-exp-navy rounded-card border border-exp-border-dk p-5">
                  <h3 className="text-label-lg text-exp-muted font-bold uppercase tracking-wider mb-3">
                    Price history
                  </h3>
                  <div className="h-24 bg-exp-ink rounded-card-sm flex items-center justify-center border border-exp-border-dk">
                    <span className="text-label-sm text-exp-muted">
                      Price chart — live data required
                    </span>
                  </div>
                </div>

                {/* Ownership trend placeholder */}
                <div className="bg-exp-navy rounded-card border border-exp-border-dk p-5">
                  <h3 className="text-label-lg text-exp-muted font-bold uppercase tracking-wider mb-3">
                    Ownership trend
                  </h3>
                  <div className="h-16 bg-exp-ink rounded-card-sm flex items-center justify-center border border-exp-border-dk">
                    <span className="text-label-sm text-exp-muted">Ownership chart — live data required</span>
                  </div>
                </div>
              </div>
            )}

            {/* Matches tab */}
            {activeTab === 'matches' && (
              <div className="space-y-2">
                <h3 className="text-label-lg text-exp-muted font-bold uppercase tracking-wider mb-3">
                  Last 5 matches
                </h3>
                {MOCK_GAMEWEEK_ROWS.map((row) => (
                  <div
                    key={row.gameweek}
                    className="flex items-center justify-between bg-exp-navy rounded-card-sm border border-exp-border-dk px-4 py-3"
                  >
                    <div>
                      <div className="text-white font-semibold text-body-sm">{row.opponent}</div>
                      <div className="text-exp-muted text-label-sm">{row.minutesPlayed} min</div>
                    </div>
                    <div className="flex items-center gap-3 text-body-sm">
                      <span className="text-white">{row.goals}G · {row.assists}A</span>
                      <span
                        className={clsx(
                          'font-bold',
                          row.rating >= 7.5 ? 'text-exp-green' : 'text-white',
                        )}
                      >
                        {row.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CTA */}
        <Link
          href="/fantasy/team/transfers"
          className={clsx(
            'flex items-center justify-center gap-2 bg-exp-gold text-exp-void font-black text-label-lg',
            'py-4 rounded-card-sm hover:bg-exp-gold-2 transition-colors min-h-[44px]',
            'focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2',
          )}
        >
          Add to Fantasy Team →
        </Link>
        <p className="text-label-sm text-exp-muted text-center -mt-3">
          Points only · no real money · no financial value
        </p>
      </div>
    </div>
  );
}
