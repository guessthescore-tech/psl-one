'use client';

import { useEffect, useMemo, useState, use } from 'react';
import Link from 'next/link';
import { clsx } from 'clsx';
import { WC_FIXTURES, getDataMode, isLiveDataMode, type ExpFixture } from '@/lib/data';
import { MatchHeader } from '@/components/football/MatchHeader';
import { MatchTimeline } from '@/components/football/MatchTimeline';
import type { MatchTimelineEvent } from '@/components/football/MatchTimeline';
import { MatchStatsPanel } from '@/components/football/MatchStatsPanel';
import { LineupPitch, MOCK_HOME_LINEUP, MOCK_AWAY_LINEUP } from '@/components/football/LineupPitch';
import { getMatchCentre, type MatchCentre } from '@/lib/football-api';
import { liveTeamToExpClub } from '@/lib/live-mappers';

type Tab = 'overview' | 'stats' | 'lineups' | 'timeline';

interface PageProps {
  params: Promise<{ fixtureId: string }>;
}

function liveMatchToFixture(match: MatchCentre): ExpFixture {
  return {
    id: match.fixture.id,
    homeClub: liveTeamToExpClub(match.homeTeam),
    awayClub: liveTeamToExpClub(match.awayTeam),
    homeScore: match.fixture.homeScore,
    awayScore: match.fixture.awayScore,
    status: match.fixture.status === 'POSTPONED' || match.fixture.status === 'CANCELLED'
      ? 'SCHEDULED'
      : match.fixture.status,
    minute: match.fixture.currentMinute,
    kickoffAt: match.fixture.kickoffAt,
    venue: match.fixture.venue?.name ?? 'Venue TBD',
    competition: match.fixture.season.competition.name,
    group: match.fixture.gameweek?.name ?? undefined,
  };
}

function buildLiveTimeline(match: MatchCentre): MatchTimelineEvent[] {
  return match.events.map((event) => ({
    id: event.id,
    type: (
      event.eventType === 'GOAL' ? 'GOAL'
      : event.eventType === 'YELLOW_CARD' ? 'YELLOW_CARD'
      : event.eventType === 'RED_CARD' ? 'RED_CARD'
      : event.eventType === 'SUBSTITUTION' ? 'SUBSTITUTION'
      : event.eventType === 'OWN_GOAL' ? 'OWN_GOAL'
      : 'PENALTY'
    ) as MatchTimelineEvent['type'],
    minute: event.minute,
    playerName: event.player?.name ?? event.description ?? 'Event',
    teamSide: event.teamId === match.homeTeam.id ? 'HOME' : 'AWAY',
    detail: event.description ?? undefined,
  }));
}

function buildLiveStats(match: MatchCentre) {
  const base = match.playerStats.reduce(
    (acc, stat) => {
      const side = stat.teamId === match.homeTeam.id ? 'home' : 'away';
      acc[side].goals += stat.goals;
      acc[side].assists += stat.assists;
      acc[side].yellowCards += stat.yellowCards;
      acc[side].redCards += stat.redCards;
      acc[side].saves += stat.saves;
      acc[side].shotsOnTarget += stat.shotsOnTarget;
      acc[side].tackles += stat.tacklesWon;
      acc[side].interceptions += stat.interceptions;
      return acc;
    },
    {
      home: { goals: 0, assists: 0, yellowCards: 0, redCards: 0, saves: 0, shotsOnTarget: 0, tackles: 0, interceptions: 0 },
      away: { goals: 0, assists: 0, yellowCards: 0, redCards: 0, saves: 0, shotsOnTarget: 0, tackles: 0, interceptions: 0 },
    },
  );

  return {
    possession: { home: 50, away: 50 },
    shots: { home: base.home.shotsOnTarget + base.home.goals, away: base.away.shotsOnTarget + base.away.goals },
    shotsOnTarget: { home: base.home.shotsOnTarget, away: base.away.shotsOnTarget },
    corners: {
      home: Math.max(0, Math.round(base.home.shotsOnTarget / 2 + base.home.tackles / 8)),
      away: Math.max(0, Math.round(base.away.shotsOnTarget / 2 + base.away.tackles / 8)),
    },
    fouls: {
      home: base.home.yellowCards + base.home.redCards + Math.max(0, Math.round(base.home.interceptions / 6)),
      away: base.away.yellowCards + base.away.redCards + Math.max(0, Math.round(base.away.interceptions / 6)),
    },
    yellowCards: { home: base.home.yellowCards, away: base.away.yellowCards },
    redCards: { home: base.home.redCards, away: base.away.redCards },
    offsides: {
      home: Math.max(0, Math.round(base.home.shotsOnTarget / 4)),
      away: Math.max(0, Math.round(base.away.shotsOnTarget / 4)),
    },
  };
}

export default function MatchDetailPage({ params }: PageProps) {
  const { fixtureId } = use(params);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const mode = getDataMode();
  const [liveMatch, setLiveMatch] = useState<MatchCentre | null>(null);
  const [loading, setLoading] = useState(isLiveDataMode(mode));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!isLiveDataMode(mode)) {
      setLiveMatch(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    getMatchCentre(fixtureId)
      .then((data) => {
        if (!cancelled) setLiveMatch(data);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load live match data');
        setLiveMatch(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [fixtureId, mode]);

  const fixture = useMemo(() => {
    if (liveMatch) {
      return liveMatchToFixture(liveMatch);
    }
    if (mode === 'DESIGN_REVIEW_DATA') {
      return WC_FIXTURES.find((f) => f.id === fixtureId) ?? WC_FIXTURES[0]!;
    }
    return null;
  }, [fixtureId, liveMatch, mode]);

  if (!fixture && !loading && !error) {
    return (
      <div className="min-h-[100dvh] bg-exp-surface">
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
        <div className="max-w-2xl mx-auto px-4 py-8 text-exp-muted">
          Match data unavailable.
        </div>
      </div>
    );
  }

  const resolvedFixture = fixture as ExpFixture;
  const isLive = resolvedFixture.status === 'LIVE' || resolvedFixture.status === 'HALF_TIME';
  const liveSummary = liveMatch ? buildLiveStats(liveMatch) : null;
  const liveTimeline = liveMatch ? buildLiveTimeline(liveMatch) : null;
  const liveHomeLineup = useMemo(
    () =>
      liveMatch
        ? {
            teamName: liveMatch.homeTeam.name,
            formation: '4-3-3',
            startingXI: liveMatch.lineups.home.filter((l) => l.isStarter).map((l) => ({
              id: l.id,
              name: l.player.name,
              number: l.player.number ?? 0,
              position: l.player.position,
            })),
            substitutes: liveMatch.lineups.home.filter((l) => l.isSubstitute).map((l) => ({
              id: l.id,
              name: l.player.name,
              number: l.player.number ?? 0,
              position: l.player.position,
            })),
          }
        : null,
    [liveMatch],
  );
  const liveAwayLineup = useMemo(
    () =>
      liveMatch
        ? {
            teamName: liveMatch.awayTeam.name,
            formation: '4-3-3',
            startingXI: liveMatch.lineups.away.filter((l) => l.isStarter).map((l) => ({
              id: l.id,
              name: l.player.name,
              number: l.player.number ?? 0,
              position: l.player.position,
            })),
            substitutes: liveMatch.lineups.away.filter((l) => l.isSubstitute).map((l) => ({
              id: l.id,
              name: l.player.name,
              number: l.player.number ?? 0,
              position: l.player.position,
            })),
          }
        : null,
    [liveMatch],
  );

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
          DESIGN_REVIEW_DATA — {resolvedFixture.homeClub.name} vs {resolvedFixture.awayClub.name}
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
        {loading && (
          <div className="rounded-card border border-exp-border-dk bg-exp-navy px-4 py-3 text-exp-muted text-body-sm">
            Loading live match data…
          </div>
        )}
        {error && !liveMatch && (
          <div className="rounded-card border border-exp-live/30 bg-exp-live/10 px-4 py-3 text-exp-muted text-body-sm">
            {error}
          </div>
        )}

        {/* Match header */}
        <MatchHeader fixture={resolvedFixture} />

        {/* MOTM link */}
        {(resolvedFixture.status === 'FINISHED' || isLive) && (
          <Link
            href={`/matches/${resolvedFixture.id}/motm`}
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
                <div className="text-body-sm text-white font-semibold">
                  {liveMatch?.playerRatings[0]?.player.name ?? 'Live match rating'}
                  {liveMatch?.playerRatings[0] ? ` · ${liveMatch.playerRatings[0].performanceRating.toFixed(1)}/10` : ''}
                </div>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    {liveTimeline?.filter((event) => event.type === 'GOAL' && event.teamSide === 'HOME').length
                      ? liveTimeline
                          ?.filter((event) => event.type === 'GOAL' && event.teamSide === 'HOME')
                          .map((event) => (
                            <div key={event.id} className="flex items-center gap-2 py-1">
                              <span className="text-sm" aria-hidden>⚽</span>
                              <span className="text-body-sm text-white">{event.minute}' {event.playerName}</span>
                            </div>
                          ))
                      : <p className="text-body-sm text-exp-muted">No home goals recorded yet.</p>}
                  </div>
                  <div className="space-y-2 sm:text-right">
                    {liveTimeline?.filter((event) => event.type === 'GOAL' && event.teamSide === 'AWAY').length
                      ? liveTimeline
                          ?.filter((event) => event.type === 'GOAL' && event.teamSide === 'AWAY')
                          .map((event) => (
                            <div key={event.id} className="flex items-center gap-2 py-1 sm:justify-end">
                              <span className="text-body-sm text-white">{event.minute}' {event.playerName}</span>
                              <span className="text-sm" aria-hidden>⚽</span>
                            </div>
                          ))
                      : <p className="text-body-sm text-exp-muted">No away goals recorded yet.</p>}
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
                    <span className="text-white font-medium">{resolvedFixture.venue}</span>
                  </div>
                  <div className="flex items-center justify-between text-body-sm">
                    <span className="text-exp-muted">Attendance</span>
                    <span className="text-white font-medium">{liveMatch ? 'Live data unavailable' : '82,400'}</span>
                  </div>
                  <div className="flex items-center justify-between text-body-sm">
                    <span className="text-exp-muted">Competition</span>
                    <span className="text-white font-medium">{resolvedFixture.competition}</span>
                  </div>
                  {resolvedFixture.group && (
                    <div className="flex items-center justify-between text-body-sm">
                      <span className="text-exp-muted">Group</span>
                      <span className="text-white font-medium">{resolvedFixture.group}</span>
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
                    {(liveMatch ? liveMatch.playerRatings.slice(0, 3).map((rating) => ({
                      playerName: rating.player.name,
                      estimatedPoints: Math.round(rating.performanceRating * 1.5),
                      goals: liveMatch.playerStats.find((stat) => stat.playerId === rating.playerId)?.goals ?? 0,
                      assists: liveMatch.playerStats.find((stat) => stat.playerId === rating.playerId)?.assists ?? 0,
                    })) : [
                      { playerName: 'Live data unavailable', estimatedPoints: 0, goals: 0, assists: 0 },
                    ]).map((player) => (
                      <div
                        key={player.playerName ?? 'live-preview'}
                        className="flex items-center justify-between py-1.5 border-b border-exp-border-dk last:border-0"
                      >
                        <span className="text-white font-medium text-body-sm">{player.playerName ?? 'Unknown player'}</span>
                        <span className="text-exp-muted text-label-sm">
                          {player.goals}G · {player.assists}A
                        </span>
                        <span className="text-exp-gold font-black text-body-sm">+{player.estimatedPoints}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Stats */}
          {activeTab === 'stats' && (
            liveSummary ? (
              <MatchStatsPanel
                stats={liveSummary}
                homeTeamName={resolvedFixture.homeClub.shortName}
                awayTeamName={resolvedFixture.awayClub.shortName}
              />
            ) : (
              <div className="rounded-card border border-exp-border-dk bg-exp-navy p-5 text-exp-muted text-body-sm">
                Live match stats are not available for this fixture yet.
              </div>
            )
          )}

          {/* Lineups */}
          {activeTab === 'lineups' && (
            liveHomeLineup && liveAwayLineup ? (
              <LineupPitch home={liveHomeLineup} away={liveAwayLineup} />
            ) : (
              <LineupPitch home={MOCK_HOME_LINEUP} away={MOCK_AWAY_LINEUP} />
            )
          )}

          {/* Timeline */}
          {activeTab === 'timeline' && (
            liveTimeline ? (
              <MatchTimeline
                events={liveTimeline}
                homeTeamName={resolvedFixture.homeClub.name}
                awayTeamName={resolvedFixture.awayClub.name}
              />
            ) : (
              <MatchTimeline
                events={[]}
                homeTeamName={resolvedFixture.homeClub.name}
                awayTeamName={resolvedFixture.awayClub.name}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}
