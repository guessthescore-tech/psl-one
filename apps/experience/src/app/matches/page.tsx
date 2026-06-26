'use client';

import { useState, useMemo, useEffect } from 'react';
import { clsx } from 'clsx';
import { getFixtures, type Fixture } from '@/lib/football-api';
import { WcFixtureCard } from '@/components/world-cup/WcFixtureCard';
import { getDataMode } from '@/lib/data';

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

function groupByDate(fixtures: Fixture[]): Map<string, Fixture[]> {
  const map = new Map<string, Fixture[]>();
  for (const f of fixtures) {
    const key = formatDateGroup(f.kickoffAt);
    const existing = map.get(key) ?? [];
    existing.push(f);
    map.set(key, existing);
  }
  return map;
}

function getRound(f: Fixture): string | null {
  return f.group?.name ?? f.season?.competition?.name ?? null;
}

export default function MatchesPage() {
  const [activeTab, setActiveTab] = useState<Tab>('fixtures');
  const [allFixtures, setAllFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mode = getDataMode();

  useEffect(() => {
    getFixtures({ seasonSlug: 'fifa-world-cup-2026' })
      .then(setAllFixtures)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load fixtures'))
      .finally(() => setLoading(false));
  }, []);

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

  const activeFixtures: Fixture[] =
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
          {loading && (
            <div className="py-16 text-center">
              <div className="text-exp-muted text-sm">Loading fixtures…</div>
            </div>
          )}

          {!loading && error && (
            <div className="py-16 text-center">
              <div className="text-4xl mb-4" aria-hidden>⚠️</div>
              <div className="text-display-sm text-exp-navy font-black mb-2">Unable to load fixtures</div>
              <p className="text-body-md text-exp-muted">{error}</p>
            </div>
          )}

          {!loading && !error && activeTab === 'live' && live.length === 0 && (
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

          {!loading && !error && activeTab !== 'live' && activeFixtures.length === 0 && (
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

          {!loading && !error && grouped.size > 0 && (
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
                      <WcFixtureCard
                        key={f.id}
                        id={f.id}
                        kickoffAt={f.kickoffAt}
                        status={f.status}
                        homeTeam={f.homeTeam}
                        awayTeam={f.awayTeam}
                        homeScore={f.homeScore}
                        awayScore={f.awayScore}
                        round={getRound(f)}
                        variant={f.status === 'LIVE' || f.status === 'HALF_TIME' ? 'live' : 'default'}
                      />
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
