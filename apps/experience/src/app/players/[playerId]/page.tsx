'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { clsx } from 'clsx';
import { WC_PLAYERS, getDataMode, isLiveDataMode } from '@/lib/data';
import type { ExpPlayer } from '@/lib/data';
import { PlayerProfileHero } from '@/components/football/PlayerProfileHero';
import { PlayerStatGrid } from '@/components/football/PlayerStatGrid';
import { PlayerGameweekTable } from '@/components/football/PlayerGameweekTable';
import type { PlayerStat } from '@/components/football/PlayerStatGrid';
import { getWorldCupSeason } from '@/lib/football-api';
import { getPlayerPrices } from '@/lib/fantasy-api';
import { getPlayerProfile, getPlayerSeasonStats } from '@/lib/players-api';
import { playerProfileToExpPlayer } from '@/lib/live-mappers';

type Tab = 'season' | 'fantasy' | 'matches';

interface PageProps {
  params: Promise<{ playerId: string }>;
}

export default function PlayerProfilePage({ params }: PageProps) {
  const [activeTab, setActiveTab] = useState<Tab>('season');
  const [player, setPlayer] = useState<ExpPlayer | null>(null);
  const [seasonStats, setSeasonStats] = useState<PlayerStat[]>([]);
  const [fantasyStats, setFantasyStats] = useState<PlayerStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Array<{ gameweek: number; label: string; opponent: string; points: number; goals: number; assists: number; minutesPlayed: number; rating: number }>>([]);
  const mode = getDataMode();
  const { playerId } = use(params);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!isLiveDataMode(mode)) {
        const local = WC_PLAYERS.find((p) => p.id === playerId) ?? null;
        if (cancelled) return;
        setPlayer(local);
        if (local) {
          setSeasonStats([
            { label: 'Goals', value: local.goalsThisTournament, highlight: true },
            { label: 'Assists', value: local.assistsThisTournament },
            { label: 'Clean Sheets', value: local.position === 'GK' ? 2 : local.position === 'DEF' ? 1 : 0 },
            { label: 'Appearances', value: 3 },
            { label: 'Avg Rating', value: '8.1' },
            { label: 'Form', value: '↑↑↑' },
          ]);
          setFantasyStats([
            { label: 'Price', value: `£${local.fantasyPrice}m`, highlight: true },
            { label: 'Ownership', value: '42%' },
            { label: 'Total Pts', value: local.fantasyPoints, highlight: true },
            { label: 'Last GW Pts', value: Math.round(local.fantasyPoints / 3) },
          ]);
        }
        if (!cancelled) setLoading(false);
        return;
      }

      try {
        const season = await getWorldCupSeason();
        const [profile, seasonSummary, prices] = await Promise.all([
          getPlayerProfile(playerId),
          getPlayerSeasonStats(playerId, season.id),
          getPlayerPrices(season.id).catch(() => []),
        ]);
        if (cancelled) return;

        const priceMap = new Map(prices.map((p) => [p.playerId, p.currentPrice]));
        const expPlayer = playerProfileToExpPlayer(profile, priceMap.get(profile.id));
        setPlayer(expPlayer);

        setSeasonStats([
          { label: 'Goals', value: seasonSummary.totals.goals, highlight: true },
          { label: 'Assists', value: seasonSummary.totals.assists },
          { label: 'Clean Sheets', value: seasonSummary.totals.cleanSheets },
          { label: 'Appearances', value: seasonSummary.totals.appearances },
          { label: 'Mins Played', value: seasonSummary.totals.minutesPlayed },
          { label: 'Red Cards', value: seasonSummary.totals.redCards },
        ]);
        setFantasyStats([
          { label: 'Total Pts', value: seasonSummary.totals.fantasyPoints, highlight: true },
          { label: 'Goals', value: seasonSummary.totals.goals },
          { label: 'Assists', value: seasonSummary.totals.assists },
          { label: 'Clean Sheets', value: seasonSummary.totals.cleanSheets },
        ]);
        setRows(
          seasonSummary.matches.map((match, index) => {
            const opponent =
              match.fixture.homeTeam.id === profile.team.id
                ? `vs ${match.fixture.awayTeam.shortName}`
                : `vs ${match.fixture.homeTeam.shortName}`;
            return {
              gameweek: index + 1,
              label: `GW ${index + 1}`,
              opponent,
              points: match.fantasyPoints,
              goals: match.goals,
              assists: match.assists,
              minutesPlayed: match.minutesPlayed,
              rating: match.fantasyPoints >= 10 ? 8.5 : match.fantasyPoints >= 5 ? 7.2 : 6.4,
            };
          }),
        );
        if (!cancelled) setLoading(false);
      } catch {
        if (!cancelled) {
          setPlayer(null);
          setRows([]);
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [mode, playerId]);

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-exp-surface flex items-center justify-center">
        <div className="text-exp-muted text-sm">Loading player profile…</div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="min-h-[100dvh] bg-exp-surface flex items-center justify-center">
        <div className="text-center px-4">
          <div className="text-4xl mb-4" aria-hidden>⚽</div>
          <div className="text-display-md text-exp-navy font-black mb-2">Player not found</div>
          <p className="text-body-md text-exp-muted mb-6">We couldn't find a player with that ID.</p>
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

  const tabs: Array<{ id: Tab; label: string }> = [
    { id: 'season', label: 'Season' },
    { id: 'fantasy', label: 'Fantasy' },
    { id: 'matches', label: 'Matches' },
  ];

  return (
    <div className="min-h-[100dvh] bg-exp-surface">
      {mode === 'DESIGN_REVIEW_DATA' && (
        <div role="banner" className="bg-purple-700 text-white text-center text-xs py-1.5 px-4 font-mono sticky top-0 z-50">
          DESIGN_REVIEW_DATA — {player.name}
        </div>
      )}

      <div className="bg-exp-navy border-b border-exp-border-dk px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/players" className="inline-flex items-center gap-1.5 text-label-md text-exp-muted hover:text-exp-gold transition-colors focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2 rounded">
            ← Players
          </Link>
          <Link href={`/players/${playerId}/stats`} className="text-label-md text-exp-gold hover:underline focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2 rounded">
            Full stats →
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-6 pb-10 space-y-6">
        <PlayerProfileHero player={player} rating={8.1} />

        <section aria-label="Season statistics">
          <h2 className="text-label-lg text-exp-muted font-bold uppercase tracking-wider mb-3">Tournament Stats</h2>
          <PlayerStatGrid stats={seasonStats} columns={3} />
        </section>

        <section aria-label="Fantasy statistics" className="bg-exp-navy rounded-card border border-exp-border-dk p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl" aria-hidden>⚡</span>
            <h2 className="text-label-lg text-exp-gold font-bold uppercase tracking-wider">Fantasy</h2>
            <span className="ml-auto text-label-sm text-exp-muted">Points only · no real money</span>
          </div>
          <PlayerStatGrid stats={fantasyStats} columns={4} />
        </section>

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
                  activeTab === tab.id ? 'text-exp-navy border-b-2 border-exp-gold' : 'text-exp-muted hover:text-exp-navy',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div id={`player-panel-${activeTab}`} role="tabpanel">
            {activeTab === 'season' && (
              <div className="space-y-4">
                <h3 className="text-label-lg text-exp-muted font-bold uppercase tracking-wider">
                  Gameweek by gameweek
                </h3>
                <PlayerGameweekTable rows={rows} />
              </div>
            )}

            {activeTab === 'fantasy' && (
              <div className="space-y-4">
                <div className="bg-exp-navy rounded-card border border-exp-border-dk p-5">
                  <h3 className="text-label-lg text-exp-muted font-bold uppercase tracking-wider mb-3">Price history</h3>
                  <div className="h-24 bg-exp-ink rounded-card-sm flex items-center justify-center border border-exp-border-dk">
                    <span className="text-label-sm text-exp-muted">Live price trend not yet exposed by the API</span>
                  </div>
                </div>

                <div className="bg-exp-navy rounded-card border border-exp-border-dk p-5">
                  <h3 className="text-label-lg text-exp-muted font-bold uppercase tracking-wider mb-3">Ownership trend</h3>
                  <div className="h-16 bg-exp-ink rounded-card-sm flex items-center justify-center border border-exp-border-dk">
                    <span className="text-label-sm text-exp-muted">Live ownership trend not yet exposed by the API</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'matches' && (
              <div className="space-y-2">
                <h3 className="text-label-lg text-exp-muted font-bold uppercase tracking-wider mb-3">Last matches</h3>
                {rows.map((row) => (
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
                      <span className={clsx('font-bold', row.rating >= 7.5 ? 'text-exp-green' : 'text-white')}>
                        {row.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

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
