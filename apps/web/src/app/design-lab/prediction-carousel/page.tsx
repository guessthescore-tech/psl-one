'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DesignLabProvider, useDesignLab } from '@/components/design-lab/DesignLabToolbar';
import {
  FixturePredictionCarousel,
  type CarouselFixture,
  type PredictionOutcome,
} from '@/components/design-lab/FixturePredictionCarousel';
import { footballClient, type Fixture } from '@/lib/football-client';
import { predictionsClient } from '@/lib/predictions-client';

/* ── Fixture adapter ───────────────────────────────────────────── */
function toCarouselFixture(f: Fixture, i: number): CarouselFixture {
  return {
    id: f.id,
    homeTeam: f.homeTeam,
    awayTeam: f.awayTeam,
    kickoffAt: f.kickoffAt,
    status: f.status,
    homeScore: f.homeScore ?? null,
    awayScore: f.awayScore ?? null,
    group: f.group ?? null,
    userPrediction: null,
    community:
      i % 3 === 0
        ? null
        : {
            totalPredictions: 1_240 + i * 87,
            homePct: 45 + (i % 10),
            drawPct: 25 - (i % 5),
            awayPct: 30 - (i % 5),
          },
  };
}

/* ── Points breakdown ──────────────────────────────────────────── */
function PointsBreakdown({ dark }: { dark: boolean }) {
  const surface = dark ? 'bg-white/5' : 'bg-[#f5f7fb]';
  const muted   = dark ? 'text-white/40' : 'text-psl-muted';
  return (
    <div className="grid grid-cols-3 gap-3 text-center">
      {[
        { label: 'Correct outcome', pts: '+3 pts' },
        { label: 'Exact score',     pts: '+5 pts' },
        { label: 'Close score',     pts: '+1 pt'  },
      ].map(r => (
        <div key={r.label} className={`rounded-card-sm p-3 ${surface}`}>
          <div className="text-sm font-black text-psl-gold mb-0.5">{r.pts}</div>
          <div className={`text-[10px] ${muted}`}>{r.label}</div>
        </div>
      ))}
    </div>
  );
}

/* ── Progress bar ──────────────────────────────────────────────── */
function ProgressBar({ total, predicted }: { total: number; predicted: number }) {
  const pct = total > 0 ? Math.round((predicted / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 rounded-full bg-[#e8eaf0] overflow-hidden">
        <div
          className="h-full bg-psl-green rounded-full motion-safe:transition-all motion-safe:duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-bold text-psl-navy tabular-nums w-10 text-right">{pct}%</span>
    </div>
  );
}

/* ── Main content ──────────────────────────────────────────────── */
function PredictionCarouselContent() {
  const { dataState, theme } = useDesignLab();

  const [fixtures, setFixtures] = useState<CarouselFixture[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [predictedCount, setPredictedCount] = useState(0);

  useEffect(() => {
    if (dataState === 'loading') { setLoading(true); return; }
    if (dataState === 'empty')   { setLoading(false); setFixtures([]); return; }
    if (dataState === 'error')   { setLoading(false); setError('API unavailable — design lab error state'); return; }

    setLoading(true);
    setError(null);

    footballClient
      .getActiveSeason()
      .then(s => footballClient.listFixtures({ seasonSlug: s.slug }))
      .then(list => setFixtures(list.slice(0, 8).map(toCarouselFixture)))
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
  }, [dataState]);

  const isDark = theme === 'dark';
  const bg     = isDark ? 'bg-psl-dark'    : 'bg-psl-surface';
  const card   = isDark ? 'bg-psl-card-dk border-white/10' : 'bg-white border-[#e8eaf0]';
  const text   = isDark ? 'text-white'     : 'text-psl-navy';
  const muted  = isDark ? 'text-white/40'  : 'text-psl-muted';

  async function handleSubmit(
    fixtureId: string,
    _outcome: PredictionOutcome,
    homeScore: number | null,
    awayScore: number | null,
  ) {
    await predictionsClient.createPrediction(fixtureId, homeScore ?? 0, awayScore ?? 0);
    setPredictedCount(c => c + 1);
  }

  return (
    <div className={`min-h-screen ${bg} pb-20 md:pb-0`}>
      {/* Header */}
      <header className="bg-psl-midnight text-white sticky top-0 z-40 shadow-inner-top">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-black text-base leading-tight">Predict</h1>
            <p className="text-[10px] text-white/40">Points only · no stakes · no wagers</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/leaderboards" className="text-xs text-white/40 hover:text-white motion-safe:transition-colors">
              Leaderboard →
            </Link>
            <Link href="/predictions/me" className="text-xs font-semibold text-psl-gold hover:text-yellow-300 motion-safe:transition-colors">
              My picks →
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

        {/* Progress strip */}
        {!loading && fixtures.length > 0 && (
          <div className={`rounded-card border ${card} px-5 py-4`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className={`text-stat-md ${text} tabular-nums leading-none`}>{fixtures.length}</div>
                  <div className={`text-[10px] ${muted} mt-0.5`}>Fixtures</div>
                </div>
                <div className="w-px h-8 bg-[#e8eaf0]" />
                <div className="text-center">
                  <div className="text-stat-md text-psl-green tabular-nums leading-none">{predictedCount}</div>
                  <div className={`text-[10px] ${muted} mt-0.5`}>Predicted</div>
                </div>
                <div className="w-px h-8 bg-[#e8eaf0]" />
                <div className="text-center">
                  <div className={`text-stat-md ${muted} tabular-nums leading-none`}>{fixtures.length - predictedCount}</div>
                  <div className={`text-[10px] ${muted} mt-0.5`}>Remaining</div>
                </div>
              </div>
            </div>
            <ProgressBar total={fixtures.length} predicted={predictedCount} />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-card-sm bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>
        )}

        {/* Carousel */}
        <FixturePredictionCarousel
          fixtures={fixtures}
          onSubmitPrediction={handleSubmit}
          loading={loading}
        />

        {/* About predictions */}
        {!loading && (
          <div className={`rounded-card border ${card} p-5`}>
            <h2 className={`text-label-md ${muted} mb-3`}>About Predictions</h2>
            <p className={`text-xs leading-relaxed ${muted} mb-4`}>
              PSL One predictions are <strong className={text}>points-only</strong>. You earn fan value points for
              correct outcomes and exact scores. There are no wagers, no stakes, no cash prizes, and no betting
              mechanics. This is a fan engagement feature.
            </p>
            <PointsBreakdown dark={isDark} />
          </div>
        )}

        {/* Back link */}
        <div className="text-center pb-4">
          <Link
            href="/design-lab/in-season-home"
            className={`text-xs ${muted} hover:${text} motion-safe:transition-colors`}
          >
            ← Back to League Matchday
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PredictionCarouselPage() {
  return (
    <DesignLabProvider defaultMode="IN_SEASON">
      <PredictionCarouselContent />
    </DesignLabProvider>
  );
}
