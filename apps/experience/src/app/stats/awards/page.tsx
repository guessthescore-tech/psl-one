'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { WC_PLAYERS, getDataMode, isLiveDataMode } from '@/lib/data';
import { AwardCard } from '@/components/football/AwardCard';
import type { Award } from '@/components/football/AwardCard';
import { getContext } from '@/lib/football-api';
import { getTopPerformers, type TopPerformer } from '@/lib/players-api';
import { topPerformerToExpPlayer } from '@/lib/live-mappers';

const MOCK_AWARDS: Award[] = [
  {
    id: 'award-goal-of-tournament',
    title: 'Goal of the Tournament',
    recipient: 'Kylian Mbappe',
    recipientImageKey: 'wc-player-mbappe-portrait',
    matchContext: 'France vs Brazil · Matchday 1',
    description: 'A stunning solo run from the halfway line, leaving four defenders in his wake before slotting home with his weaker foot. Pure genius.',
    icon: '⚽',
  },
  {
    id: 'award-save-of-tournament',
    title: 'Save of the Tournament',
    recipient: 'Yassine Bounou',
    recipientImageKey: 'wc-player-bounou-portrait',
    matchContext: 'Morocco vs Spain · Matchday 2',
    description: 'A full-stretch fingertip save in the dying minutes that defied physics and denied an almost certain goal to preserve a historic clean sheet.',
    icon: '🧤',
  },
  {
    id: 'award-young-player',
    title: 'Young Player of the Tournament',
    recipient: 'Pedri',
    recipientImageKey: 'wc-player-pedri-portrait',
    matchContext: 'Spain · Group A',
    description: 'The Barcelona midfielder has been the creative heartbeat of the tournament, combining technical excellence with remarkable maturity beyond his years.',
    icon: '⭐',
  },
  {
    id: 'award-golden-boot',
    title: 'Golden Boot Leader',
    recipient: 'Kylian Mbappe',
    recipientImageKey: 'wc-player-mbappe-portrait',
    matchContext: 'France · 5 goals',
    description: "Leading the race for the Golden Boot with five goals in just three matches, Mbappe is on track to claim the individual honour to match his team's brilliance.",
    icon: '🥾',
  },
];

const BEST_XI_PLAYERS = [
  { name: 'Maignan', pos: 'GK', club: 'FRA' },
  { name: 'Hakimi', pos: 'RB', club: 'MAR' },
  { name: 'Ruben Dias', pos: 'CB', club: 'POR' },
  { name: 'Upamecano', pos: 'CB', club: 'FRA' },
  { name: 'Theo', pos: 'LB', club: 'FRA' },
  { name: 'Pedri', pos: 'CM', club: 'ESP' },
  { name: 'Bellingham', pos: 'CM', club: 'ENG' },
  { name: 'Camavinga', pos: 'CM', club: 'FRA' },
  { name: 'Mbappe', pos: 'RW', club: 'FRA' },
  { name: 'Vinicius', pos: 'ST', club: 'BRA' },
  { name: 'Sané', pos: 'LW', club: 'GER' },
];

function buildLiveAwards(performers: TopPerformer[]): Award[] {
  const byGoals = [...performers].sort((a, b) => b.goals - a.goals || b.fantasyPoints - a.fantasyPoints);
  const byAssists = [...performers].sort((a, b) => b.assists - a.assists || b.fantasyPoints - a.fantasyPoints);
  const byFantasy = [...performers].sort((a, b) => b.fantasyPoints - a.fantasyPoints);
  const byCleanSheets = [...performers].sort((a, b) => b.cleanSheets - a.cleanSheets || b.fantasyPoints - a.fantasyPoints);

  const scorer = byGoals[0];
  const assister = byAssists[0];
  const fantasyLeader = byFantasy[0];
  const cleanSheetLeader = byCleanSheets[0];

  if (!scorer || !assister || !fantasyLeader || !cleanSheetLeader) return [];

  return [
    {
      id: `live-goal-${scorer.playerId}`,
      title: 'Goal of the Tournament',
      recipient: scorer.playerName,
      recipientImageKey: `wc-player-${scorer.playerId}`,
      matchContext: `${scorer.teamName} · ${scorer.goals} goals`,
      description: `${scorer.playerName} leads the tournament scoring chart with ${scorer.goals} goals and ${scorer.fantasyPoints} fantasy points.`,
      icon: '⚽',
    },
    {
      id: `live-assist-${assister.playerId}`,
      title: 'Assist Leader',
      recipient: assister.playerName,
      recipientImageKey: `wc-player-${assister.playerId}`,
      matchContext: `${assister.teamName} · ${assister.assists} assists`,
      description: `${assister.playerName} has created ${assister.assists} goals so far and is driving the attack for ${assister.teamName}.`,
      icon: '🅰️',
    },
    {
      id: `live-fantasy-${fantasyLeader.playerId}`,
      title: 'Fantasy Leader',
      recipient: fantasyLeader.playerName,
      recipientImageKey: `wc-player-${fantasyLeader.playerId}`,
      matchContext: `${fantasyLeader.teamName} · ${fantasyLeader.fantasyPoints} pts`,
      description: `${fantasyLeader.playerName} is the current fantasy leader with ${fantasyLeader.fantasyPoints} points and consistent tournament returns.`,
      icon: '⭐',
    },
    {
      id: `live-clean-${cleanSheetLeader.playerId}`,
      title: 'Clean Sheet Leader',
      recipient: cleanSheetLeader.playerName,
      recipientImageKey: `wc-player-${cleanSheetLeader.playerId}`,
      matchContext: `${cleanSheetLeader.teamName} · ${cleanSheetLeader.cleanSheets} clean sheets`,
      description: `${cleanSheetLeader.playerName} anchors the tournament's best defensive record with ${cleanSheetLeader.cleanSheets} clean sheets.`,
      icon: '🧤',
    },
  ];
}

function buildLiveBestXi(performers: TopPerformer[]): Array<{ name: string; pos: string; club: string }> {
  return performers
    .slice(0, 11)
    .map((player) => topPerformerToExpPlayer(player))
    .map((player) => ({
      name: player.name,
      pos: player.position,
      club: player.club.abbr,
    }));
}

export default function AwardsPage() {
  const mode = getDataMode();
  const [awards, setAwards] = useState<Award[]>(mode === 'DESIGN_REVIEW_DATA' ? MOCK_AWARDS : []);
  const [bestXi, setBestXi] = useState<Array<{ name: string; pos: string; club: string }>>(
    mode === 'DESIGN_REVIEW_DATA' ? BEST_XI_PLAYERS : [],
  );
  const [loading, setLoading] = useState(isLiveDataMode(mode));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLiveDataMode(mode)) {
      setAwards(MOCK_AWARDS);
      setBestXi(BEST_XI_PLAYERS);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        const season = await getContext();
        const performers = await getTopPerformers(season.id, 24);
        if (cancelled) return;

        const liveAwards = buildLiveAwards(performers);
        setAwards(liveAwards);
        setBestXi(buildLiveBestXi(performers));
        if (liveAwards.length === 0) {
          setError('Live awards data is not available yet.');
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Could not load live awards data.');
          setAwards([]);
          setBestXi([]);
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

  const hasAwards = useMemo(() => awards.length > 0, [awards]);

  return (
    <div className="min-h-[100dvh] bg-exp-surface">
      {mode === 'DESIGN_REVIEW_DATA' && (
        <div
          role="banner"
          className="bg-purple-700 text-white text-center text-xs py-1.5 px-4 font-mono sticky top-0 z-50"
        >
          DESIGN_REVIEW_DATA — awards (no awards model yet)
        </div>
      )}

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

      <div className="bg-exp-navy border-b border-exp-border-dk px-4 pt-6 pb-5">
        <div className="max-w-2xl mx-auto">
          <div className="text-label-sm text-exp-gold font-bold uppercase tracking-wider mb-1">
            FIFA World Cup 2026
          </div>
          <h1 className="text-display-lg text-white font-black">Tournament Awards</h1>
          <p className="text-body-sm text-exp-muted mt-1">
            Recognising tournament leaders from live beta data
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">
        {loading ? (
          <div className="py-12 text-center text-exp-muted">Loading live awards…</div>
        ) : hasAwards ? (
          <>
            <section aria-label="Tournament awards">
              <div className="space-y-4">
                {awards.map((award, i) => (
                  <AwardCard key={award.id} award={award} index={i} />
                ))}
              </div>
            </section>

            <section aria-label="Best XI">
              <h2 className="text-display-sm text-exp-navy font-black mb-4">Best XI</h2>
              <div className="bg-exp-navy rounded-card border border-exp-border-dk p-5">
                <div className="relative bg-pitch-dark rounded-card-sm p-4 min-h-64" aria-label="Best XI formation">
                  <div className="grid grid-cols-3 gap-2">
                    {bestXi.map((p) => (
                      <div
                        key={`${p.name}-${p.club}`}
                        className="bg-exp-ink/80 border border-exp-border-dk rounded-card-sm px-2 py-1.5 text-center"
                      >
                        <div className="text-body-sm font-bold text-white truncate">{p.name}</div>
                        <div className="text-label-sm text-exp-muted">{p.pos} · {p.club}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-label-sm text-exp-muted text-center mt-3">
                  Live beta tournament leaders
                </p>
              </div>
            </section>
          </>
        ) : (
          <div className="rounded-card border border-exp-border-dk bg-exp-navy px-4 py-10 text-center text-exp-muted">
            {error ?? 'Awards will appear once live tournament data is available.'}
          </div>
        )}
      </div>
    </div>
  );
}
