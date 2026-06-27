'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { WC_STANDINGS, getDataMode, isLiveDataMode, type ExpStanding } from '@/lib/data';
import { StandingsTable } from '@/components/football/StandingsTable';
import { getContext, getStandings, type StandingGroup } from '@/lib/football-api';
import { liveTeamToExpClub } from '@/lib/live-mappers';

function mapLiveStandings(groups: StandingGroup[]): ExpStanding[] {
  const rows: ExpStanding[] = [];
  let position = 1;
  for (const group of groups) {
    for (const row of group.standings) {
      rows.push({
        position,
        club: liveTeamToExpClub(row.team),
        played: row.played,
        won: row.won,
        drawn: row.drawn,
        lost: row.lost,
        goalsFor: row.goalsFor,
        goalsAgainst: row.goalsAgainst,
        goalDifference: row.goalsFor - row.goalsAgainst,
        points: row.points,
        form: [],
      });
      position += 1;
    }
  }
  return rows;
}

export default function StandingsPage() {
  const mode = getDataMode();
  const [standings, setStandings] = useState<ExpStanding[]>(mode === 'DESIGN_REVIEW_DATA' ? WC_STANDINGS : []);
  const [loading, setLoading] = useState(isLiveDataMode(mode));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLiveDataMode(mode)) {
      setStandings(WC_STANDINGS);
      setLoading(false);
      return;
    }

    let cancelled = false;
    async function load() {
      try {
        const season = await getContext();
        const groups = await getStandings({ seasonSlug: season.slug });
        if (cancelled) return;
        setStandings(mapLiveStandings(groups));
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load standings');
          setStandings([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [mode]);

  const visibleStandings = useMemo(() => standings, [standings]);

  return (
    <div className="min-h-[100dvh] bg-exp-surface">
      {mode === 'DESIGN_REVIEW_DATA' && (
        <div role="banner" className="bg-purple-700 text-white text-center text-xs py-1.5 px-4 font-mono sticky top-0 z-50">
          DESIGN_REVIEW_DATA — WC 2026 standings
        </div>
      )}

      <div className="bg-exp-navy border-b border-exp-border-dk px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/" className="inline-flex items-center gap-1.5 text-label-md text-exp-muted hover:text-exp-gold transition-colors focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2 rounded">
            ← Home
          </Link>
          <span className="text-exp-border-dk" aria-hidden>|</span>
          <Link href="/stats/season" className="text-label-md text-exp-muted hover:text-exp-gold transition-colors focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2 rounded">
            Season Stats
          </Link>
        </div>
      </div>

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
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1" role="group" aria-label="Group selector">
          {['Overall', 'Group A', 'Group B', 'Group C', 'Group D'].map((g, i) => (
            <button
              key={g}
              type="button"
              className={`flex-shrink-0 px-3 py-1.5 rounded-pill text-label-md font-bold transition-all min-h-[44px] focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2 ${
                i === 0 ? 'bg-exp-gold text-exp-void' : 'bg-exp-navy border border-exp-border-dk text-exp-muted hover:text-white hover:border-exp-gold/40'
              }`}
              aria-pressed={i === 0}
            >
              {g}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="rounded-card border border-exp-border-dk bg-exp-navy px-4 py-10 text-center text-exp-muted">
            Loading live standings…
          </div>
        ) : error && visibleStandings.length === 0 ? (
          <div className="rounded-card border border-exp-live/30 bg-exp-live/10 px-4 py-10 text-center text-exp-muted">
            {error}
          </div>
        ) : (
          <div className="bg-exp-navy rounded-card border border-exp-border-dk overflow-hidden">
            <StandingsTable standings={visibleStandings} qualificationSpots={4} dangerZone={0} />
          </div>
        )}

        <p className="text-label-sm text-exp-muted mt-4 text-center">
          WC 2026 group stage · Top 2 from each group advance
        </p>
      </div>
    </div>
  );
}
