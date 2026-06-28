'use client';

import { useEffect, useMemo, useState } from 'react';
import { FantasyShell } from '@/components/fantasy/shared/FantasyShell';
import { FantasyPageHero } from '@/components/fantasy/shared/FantasyPageHero';
import { FantasyEmptyState } from '@/components/fantasy/shared/FantasyEmptyState';
import { FixtureDifficultyMatrix } from '@/components/fantasy/core/FixtureDifficultyMatrix';
import { FANTASY_MOCK_FDR, getDataMode, type ExpFDREntry } from '@/lib/data';
import { getContext, getFixtures, getStandings, type Fixture, type StandingGroup } from '@/lib/football-api';
import { liveTeamToExpClub } from '@/lib/live-mappers';

const GAMEWEEK_COUNT = 6;

function clampDifficulty(value: number): 1 | 2 | 3 | 4 | 5 {
  return Math.max(1, Math.min(5, Math.round(value))) as 1 | 2 | 3 | 4 | 5;
}

function computeDifficulty(teamRank: number, opponentRank: number, isHome: boolean): 1 | 2 | 3 | 4 | 5 {
  let difficulty = 3;
  const rankGap = opponentRank - teamRank;

  if (rankGap < 0) difficulty += 1;
  if (rankGap < -8) difficulty += 1;
  if (rankGap > 0) difficulty -= 1;
  if (rankGap > 8) difficulty -= 1;
  if (!isHome) difficulty += 1;

  return clampDifficulty(difficulty);
}

function buildLiveFixtureDifficulty(fixtures: Fixture[], standings: StandingGroup[]): ExpFDREntry[] {
  const teamRank = new Map<string, number>();
  const teamById = new Map<string, Fixture['homeTeam'] | Fixture['awayTeam']>();
  let rank = 1;

  for (const group of standings) {
    for (const row of group.standings) {
      teamRank.set(row.team.id, rank++);
      teamById.set(row.team.id, row.team);
    }
  }

  for (const fixture of fixtures) {
    teamById.set(fixture.homeTeam.id, fixture.homeTeam);
    teamById.set(fixture.awayTeam.id, fixture.awayTeam);
  }

  const byTeam = new Map<string, Array<{ fixture: Fixture; isHome: boolean }>>();
  for (const fixture of fixtures) {
    if (fixture.status === 'FINISHED' || fixture.status === 'POSTPONED' || fixture.status === 'CANCELLED') {
      continue;
    }

    const home = byTeam.get(fixture.homeTeam.id) ?? [];
    home.push({ fixture, isHome: true });
    byTeam.set(fixture.homeTeam.id, home);

    const away = byTeam.get(fixture.awayTeam.id) ?? [];
    away.push({ fixture, isHome: false });
    byTeam.set(fixture.awayTeam.id, away);
  }

  return [...teamById.values()]
    .sort((a, b) => {
      const rankA = teamRank.get(a.id) ?? 999;
      const rankB = teamRank.get(b.id) ?? 999;
      if (rankA !== rankB) return rankA - rankB;
      return a.shortName.localeCompare(b.shortName);
    })
    .map((team) => {
      const rankForTeam = teamRank.get(team.id) ?? 16;
      const fixturesForTeam = (byTeam.get(team.id) ?? [])
        .sort((left, right) => new Date(left.fixture.kickoffAt).getTime() - new Date(right.fixture.kickoffAt).getTime())
        .slice(0, GAMEWEEK_COUNT)
        .map(({ fixture, isHome }, index) => {
          const opponent = isHome ? fixture.awayTeam : fixture.homeTeam;
          const opponentRank = teamRank.get(opponent.id) ?? 16;
          return {
            gameweekNumber: index + 1,
            opponentAbbr: opponent.shortName.slice(0, 3).toUpperCase(),
            isHome,
            difficulty: computeDifficulty(rankForTeam, opponentRank, isHome),
          };
        });

      while (fixturesForTeam.length < GAMEWEEK_COUNT) {
        fixturesForTeam.push({
          gameweekNumber: fixturesForTeam.length + 1,
          opponentAbbr: 'TBD',
          isHome: true,
          difficulty: 3,
        });
      }

      return {
        club: liveTeamToExpClub(team),
        fixtures: fixturesForTeam,
      };
    });
}

export default function FixtureDifficultyPage() {
  const mode = getDataMode();
  const isDesignReview = mode === 'DESIGN_REVIEW_DATA';
  const [data, setData] = useState<ExpFDREntry[]>(isDesignReview ? FANTASY_MOCK_FDR : []);
  const [loading, setLoading] = useState(!isDesignReview);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isDesignReview) {
      setData(FANTASY_MOCK_FDR);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        const season = await getContext();
        const [fixtures, standings] = await Promise.all([
          getFixtures({ seasonSlug: season.slug }),
          getStandings({ seasonSlug: season.slug }),
        ]);

        if (cancelled) return;

        const liveData = buildLiveFixtureDifficulty(fixtures, standings);
        setData(liveData);
        setError(liveData.length > 0 ? null : 'Live fixture difficulty data is not available yet.');
      } catch (err) {
        if (!cancelled) {
          setData([]);
          setError(err instanceof Error ? err.message : 'Could not load live fixture difficulty data.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [isDesignReview]);

  const gameweekLabels = useMemo(
    () => Array.from({ length: GAMEWEEK_COUNT }, (_, index) => `GW${index + 1}`),
    [],
  );

  return (
    <FantasyShell title="Fixture Difficulty" back={{ href: '/fantasy/team', label: 'Back to Team' }}>
      <div className="pb-8">
        <FantasyPageHero
          title="Fixture Difficulty"
          subtitle="Next 6 gameweeks — plan your transfers and chip strategy"
          badge={isDesignReview ? 'DESIGN REVIEW DATA' : 'LIVE DATA'}
        />

        <div className="px-4 py-4 space-y-4">
          {loading ? (
            <div className="rounded-card border border-exp-border-dk bg-exp-navy px-4 py-10 text-center text-exp-muted">
              Loading live fixture difficulty…
            </div>
          ) : error && data.length === 0 ? (
            <FantasyEmptyState
              icon="📊"
              title="Fixture difficulty unavailable"
              message={error}
            />
          ) : (
            <>
              <FixtureDifficultyMatrix data={data} gameweekLabels={gameweekLabels} />
              <p className="text-label-sm text-exp-muted text-center">
                {isDesignReview
                  ? 'Design review preview data only.'
                  : 'Live fixture difficulty is derived from public fixtures and standings.'}
              </p>
            </>
          )}
        </div>

        <div className="px-4 pb-4 space-y-2">
          <div className="bg-exp-navy border border-exp-border-dk rounded-card-xs px-4 py-3">
            <p className="text-label-md text-white font-semibold mb-1">How to use FDR</p>
            <ul className="space-y-1 text-body-sm text-exp-muted">
              <li>• Green = easier fixture (target players from these teams)</li>
              <li>• Red = harder fixture (avoid or sell these players)</li>
              <li>• Use FDR to time your transfers and chips</li>
              <li>• H = home game · A = away game</li>
            </ul>
          </div>
          <p className="text-label-sm text-exp-muted text-center">
            Points only — no real money or financial value
          </p>
        </div>
      </div>
    </FantasyShell>
  );
}
