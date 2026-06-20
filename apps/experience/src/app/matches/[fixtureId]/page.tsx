'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { clsx } from 'clsx';
import { WC_FIXTURES, getDataMode } from '@/lib/data';
import { MatchHeader } from '@/components/football/MatchHeader';
import { MatchTimeline, MOCK_TIMELINE_EVENTS } from '@/components/football/MatchTimeline';
import { MatchStatsPanel, MOCK_MATCH_STATS } from '@/components/football/MatchStatsPanel';
import { LineupPitch, MOCK_HOME_LINEUP, MOCK_AWAY_LINEUP } from '@/components/football/LineupPitch';

type Tab = 'overview' | 'stats' | 'lineups' | 'timeline';

interface PageProps {
  params: Promise<{ fixtureId: string }>;
}

export default function MatchDetailPage({ params }: PageProps) {
  const { fixtureId } = use(params);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const mode = getDataMode();

  // Find fixture — fall back to first fixture for DESIGN_REVIEW_DATA
  const fixture =
    WC_FIXTURES.find((f) => f.id === fixtureId) ?? WC_FIXTURES[0]!;

  const isLive = fixture.status === 'LIVE' || fixture.status === 'HALF_TIME';

  const tabs: Array<{ id: Tab; label: string }> = [
    { id: 'overview',  label: 'Overview'  },
    { id: 'stats',     label: 'Stats'     },
    { id: 'lineups',   label: 'Lineups'   },
    { id: 'timeline',  label: 'Timeline'  },
  ];

  return (
    <div className="min-h-[100dvh] bg-exp-surface">
      {/* Design review banner */}
      {mode === 'DESIGN_REVIEW_DATA' && (
        <div
          role="banner"
          className="bg-purple-700 text-white text-center text-xs py-1.5 px-4 font-mono sticky top-0 z-50"
        >
          DESIGN_REVIEW_DATA — {fixture.homeClub.name} vs {fixture.awayClub.name}
        </div>
      )}

      {/* Back nav */}
      <div className="bg-exp-navy border-b border-exp-border-dk px-4 py-3">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/matches"
            className="inline-flex items-center gap-1.5 text-label-md text-exp-muted hover:text-exp-gold transition-colors focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2 rounded"
            aria-label="Back to all matches"
          >
            ← Matches
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-6 pb-8 space-y-6">
        {/* Match header */}
        <MatchHeader fixture={fixture} />

        {/* MOTM link */}
        {(fixture.status === 'FINISHED' || isLive) && (
          <Link
            href={`/matches/${fixture.id}/motm`}
            className={clsx(
              'flex items-center justify-between gap-3 bg-exp-navy rounded-card border border-exp-gold/30 px-4 py-3',
              'hover:border-exp-gold/60 transition-colors min-h-[44px]',
              'focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2',
            )}
            aria-label="View Man of the Match"
          >
            <div className="flex items-center gap-2">
              <span className="text-xl" aria-hidden>⭐</span>
              <div>
                <div className="text-label-sm text-exp-gold font-bold uppercase tracking-wider">Man of the Match</div>
                <div className="text-body-sm text-white font-semibold">Kylian Mbappe · 9.2/10</div>
              </div>
            </div>
            <span className="text-exp-gold" aria-hidden>→</span>
          </Link>
        )}

        {/* Tabs */}
        <div className="flex gap-1 border-b border-exp-border" role="tablist" aria-label="Match details tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`match-panel-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'px-3 py-2.5 text-label-md font-bold transition-all relative min-h-[44px]',
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

        {/* Tab panels */}
        <div id={`match-panel-${activeTab}`} role="tabpanel">
          {/* Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Scorers */}
              <div className="bg-exp-navy rounded-card border border-exp-border-dk p-5">
                <h2 className="text-label-lg text-exp-muted font-bold uppercase tracking-wider mb-4">
                  Goal scorers
                </h2>
                <div className="flex justify-between gap-4">
                  {/* Home scorers */}
                  <div className="flex-1">
                    {['Mbappe 12\'', 'Mbappe 34\''].map((scorer) => (
                      <div key={scorer} className="flex items-center gap-2 py-1">
                        <span className="text-sm" aria-hidden>⚽</span>
                        <span className="text-body-sm text-white">{scorer}</span>
                      </div>
                    ))}
                  </div>
                  {/* Away scorers */}
                  <div className="flex-1 text-right">
                    {['51\' Sané'].map((scorer) => (
                      <div key={scorer} className="flex items-center justify-end gap-2 py-1">
                        <span className="text-body-sm text-white">{scorer}</span>
                        <span className="text-sm" aria-hidden>⚽</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Venue */}
              <div className="bg-exp-navy rounded-card border border-exp-border-dk p-5">
                <h2 className="text-label-lg text-exp-muted font-bold uppercase tracking-wider mb-3">
                  Match info
                </h2>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-body-sm">
                    <span className="text-exp-muted">Venue</span>
                    <span className="text-white font-medium">{fixture.venue}</span>
                  </div>
                  <div className="flex items-center justify-between text-body-sm">
                    <span className="text-exp-muted">Attendance</span>
                    <span className="text-white font-medium">82,400</span>
                  </div>
                  <div className="flex items-center justify-between text-body-sm">
                    <span className="text-exp-muted">Competition</span>
                    <span className="text-white font-medium">{fixture.competition}</span>
                  </div>
                  {fixture.group && (
                    <div className="flex items-center justify-between text-body-sm">
                      <span className="text-exp-muted">Group</span>
                      <span className="text-white font-medium">{fixture.group}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-body-sm">
                    <span className="text-exp-muted">Referee</span>
                    <span className="text-white font-medium">Szymon Marciniak (Poland)</span>
                  </div>
                </div>
              </div>

              {/* Fantasy impact (LIVE only) */}
              {isLive && (
                <div className="bg-exp-navy rounded-card border border-exp-gold/20 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl" aria-hidden>⚡</span>
                    <h2 className="text-label-lg text-exp-gold font-bold uppercase tracking-wider">
                      Fantasy Impact
                    </h2>
                  </div>
                  <p className="text-body-sm text-exp-muted mb-3">
                    Points only · no real money · no financial value
                  </p>
                  <div className="space-y-2">
                    {[
                      { name: 'Mbappe', pts: '+12', event: '2 goals' },
                      { name: 'Sané',   pts: '+6',  event: '1 goal'  },
                    ].map((player) => (
                      <div
                        key={player.name}
                        className="flex items-center justify-between py-1.5 border-b border-exp-border-dk last:border-0"
                      >
                        <span className="text-white font-medium text-body-sm">{player.name}</span>
                        <span className="text-exp-muted text-label-sm">{player.event}</span>
                        <span className="text-exp-gold font-black text-body-sm">{player.pts}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Stats */}
          {activeTab === 'stats' && (
            <MatchStatsPanel
              stats={MOCK_MATCH_STATS}
              homeTeamName={fixture.homeClub.shortName}
              awayTeamName={fixture.awayClub.shortName}
            />
          )}

          {/* Lineups */}
          {activeTab === 'lineups' && (
            <LineupPitch home={MOCK_HOME_LINEUP} away={MOCK_AWAY_LINEUP} />
          )}

          {/* Timeline */}
          {activeTab === 'timeline' && (
            <MatchTimeline
              events={MOCK_TIMELINE_EVENTS}
              homeTeamName={fixture.homeClub.name}
              awayTeamName={fixture.awayClub.name}
            />
          )}
        </div>
      </div>
    </div>
  );
}
