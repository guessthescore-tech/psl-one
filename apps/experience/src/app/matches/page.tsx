'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { clsx } from 'clsx';
import { WC_FIXTURES, getDataMode } from '@/lib/data';
import type { ExpFixture } from '@/lib/data';
import { MatchHeader } from '@/components/football/MatchHeader';
import { MatchStateBadge } from '@/components/football/MatchStateBadge';

type Tab = 'results' | 'fixtures' | 'live';

function formatDateGroup(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const isTomorrow = d.toDateString() === tomorrow.toDateString();

  if (isToday) return 'Today';
  if (isTomorrow) return 'Tomorrow';
  return d.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' });
}

function formatKickoff(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' });
}

function groupByDate(fixtures: ExpFixture[]): Map<string, ExpFixture[]> {
  const map = new Map<string, ExpFixture[]>();
  for (const f of fixtures) {
    const key = formatDateGroup(f.kickoffAt);
    const existing = map.get(key) ?? [];
    existing.push(f);
    map.set(key, existing);
  }
  return map;
}

function FixtureRow({ fixture }: { fixture: ExpFixture }) {
  const isLive = fixture.status === 'LIVE' || fixture.status === 'HALF_TIME';
  const isFinished = fixture.status === 'FINISHED';

  return (
    <Link
      href={`/matches/${fixture.id}`}
      className={clsx(
        'flex items-center gap-3 px-4 py-3 rounded-card-sm border transition-colors',
        'min-h-[44px] focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2',
        isLive
          ? 'bg-exp-navy border-exp-live/30 hover:border-exp-live/50'
          : 'bg-exp-card border-exp-border hover:border-exp-muted/40',
      )}
      aria-label={`${fixture.homeClub.name} vs ${fixture.awayClub.name}, ${isFinished ? `Result: ${fixture.homeScore}-${fixture.awayScore}` : isLive ? `Live: ${fixture.homeScore}-${fixture.awayScore}, minute ${fixture.minute}` : `Kick off ${formatKickoff(fixture.kickoffAt)}`}`}
    >
      {/* Home */}
      <div className="flex-1 flex items-center justify-end gap-2 min-w-0">
        <span className={clsx('font-semibold truncate', isLive ? 'text-white' : 'text-exp-navy')}>
          {fixture.homeClub.shortName}
        </span>
        <div
          className="w-3 h-3 rounded-full flex-shrink-0 border border-white/10"
          style={{ backgroundColor: fixture.homeClub.primaryColor }}
          aria-hidden
        />
      </div>

      {/* Score / status */}
      <div className="flex-shrink-0 text-center w-24">
        {isLive || isFinished ? (
          <span
            className={clsx(
              'text-score-md font-black tabular-nums',
              isLive ? 'text-white' : 'text-exp-navy',
            )}
          >
            {fixture.homeScore} – {fixture.awayScore}
          </span>
        ) : (
          <span className="text-label-sm text-exp-muted font-bold">
            {formatKickoff(fixture.kickoffAt)}
          </span>
        )}
        <div className="mt-0.5 flex justify-center">
          <MatchStateBadge status={fixture.status} minute={fixture.minute} size="sm" />
        </div>
      </div>

      {/* Away */}
      <div className="flex-1 flex items-center gap-2 min-w-0">
        <div
          className="w-3 h-3 rounded-full flex-shrink-0 border border-white/10"
          style={{ backgroundColor: fixture.awayClub.primaryColor }}
          aria-hidden
        />
        <span className={clsx('font-semibold truncate', isLive ? 'text-white' : 'text-exp-navy')}>
          {fixture.awayClub.shortName}
        </span>
      </div>
    </Link>
  );
}

export default function MatchesPage() {
  const [activeTab, setActiveTab] = useState<Tab>('fixtures');
  const mode = getDataMode();

  const allFixtures = WC_FIXTURES;

  const results = useMemo(
    () => allFixtures.filter((f) => f.status === 'FINISHED'),
    [allFixtures],
  );
  const fixtures = useMemo(
    () => allFixtures.filter((f) => f.status === 'SCHEDULED'),
    [allFixtures],
  );
  const live = useMemo(
    () => allFixtures.filter((f) => f.status === 'LIVE' || f.status === 'HALF_TIME'),
    [allFixtures],
  );

  const activeFixtures: ExpFixture[] =
    activeTab === 'results' ? results : activeTab === 'live' ? live : fixtures;
  const grouped = groupByDate(activeFixtures);

  const tabs: Array<{ id: Tab; label: string; count: number }> = [
    { id: 'fixtures', label: 'Fixtures',  count: fixtures.length },
    { id: 'live',     label: 'Live',      count: live.length     },
    { id: 'results',  label: 'Results',   count: results.length  },
  ];

  return (
    <div className="min-h-[100dvh] bg-exp-surface">
      {/* Design review banner */}
      {mode === 'DESIGN_REVIEW_DATA' && (
        <div
          role="banner"
          className="bg-purple-700 text-white text-center text-xs py-1.5 px-4 font-mono sticky top-0 z-50"
        >
          DESIGN_REVIEW_DATA — WC 2026 mock fixtures
        </div>
      )}

      {/* Page header */}
      <div className="bg-exp-navy border-b border-exp-border-dk px-4 pt-6 pb-0">
        <div className="max-w-2xl mx-auto">
          <div className="text-label-sm text-exp-gold uppercase tracking-wider mb-1 font-bold">
            FIFA World Cup 2026
          </div>
          <h1 className="text-display-lg text-white font-black mb-4">Matches</h1>

          {/* Tabs */}
          <div className="flex gap-1" role="tablist" aria-label="Match tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`panel-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'px-4 py-2.5 text-label-md font-bold rounded-t-card-sm transition-all min-h-[44px] relative',
                  'focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2',
                  activeTab === tab.id
                    ? 'text-exp-gold bg-exp-surface'
                    : 'text-exp-muted hover:text-white',
                )}
              >
                {tab.label}
                {tab.id === 'live' && tab.count > 0 && (
                  <span className="ml-1.5 inline-flex items-center gap-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-exp-live animate-live-pulse" aria-hidden />
                    <span className="text-exp-live tabular-nums">{tab.count}</span>
                  </span>
                )}
                {tab.id !== 'live' && tab.count > 0 && (
                  <span className="ml-1.5 text-exp-muted tabular-nums">({tab.count})</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div
          id={`panel-${activeTab}`}
          role="tabpanel"
          aria-label={tabs.find((t) => t.id === activeTab)?.label}
        >
          {activeTab === 'live' && live.length === 0 && (
            <div className="py-16 text-center">
              <div className="text-4xl mb-4" aria-hidden>⚽</div>
              <div className="text-display-sm text-exp-navy font-black mb-2">
                No live matches right now
              </div>
              <p className="text-body-md text-exp-muted">
                Check back when the next match kicks off.
              </p>
            </div>
          )}

          {activeTab !== 'live' && activeFixtures.length === 0 && (
            <div className="py-16 text-center">
              <div className="text-4xl mb-4" aria-hidden>📅</div>
              <div className="text-display-sm text-exp-navy font-black mb-2">
                No {activeTab} yet
              </div>
              <p className="text-body-md text-exp-muted">
                Check back soon for more matches.
              </p>
            </div>
          )}

          {/* Live: show full MatchHeader cards */}
          {activeTab === 'live' && live.length > 0 && (
            <div className="space-y-4">
              {live.map((f) => (
                <Link key={f.id} href={`/matches/${f.id}`} className="block focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2 rounded-card">
                  <MatchHeader fixture={f} compact />
                </Link>
              ))}
            </div>
          )}

          {/* Results & Fixtures: grouped by date */}
          {activeTab !== 'live' && grouped.size > 0 && (
            <div className="space-y-6">
              {Array.from(grouped.entries()).map(([dateLabel, dayFixtures]) => (
                <section key={dateLabel} aria-label={dateLabel}>
                  {/* Sticky date header */}
                  <div className="sticky top-8 z-10 bg-exp-surface/95 backdrop-blur-sm py-2 -mx-4 px-4 mb-3 border-b border-exp-border">
                    <h2 className="text-label-lg text-exp-muted font-bold uppercase tracking-wider">
                      {dateLabel}
                    </h2>
                  </div>
                  <div className="space-y-2">
                    {dayFixtures.map((f) => (
                      <FixtureRow key={f.id} fixture={f} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
