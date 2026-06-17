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

/* ─── adapt football fixture to carousel fixture ────────────────── */
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
    /* Synthetic community distribution — demo only */
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

/* ─── Demo stats panel ─────────────────────────────────────────── */
function StatsPanel({ total, predicted }: { total: number; predicted: number }) {
  return (
    <div className="flex gap-4 text-center">
      <div>
        <div className="text-2xl font-black text-psl-navy">{total}</div>
        <div className="text-[10px] text-gray-400">Fixtures</div>
      </div>
      <div className="w-px bg-gray-100" />
      <div>
        <div className="text-2xl font-black text-psl-green">{predicted}</div>
        <div className="text-[10px] text-gray-400">Predicted</div>
      </div>
      <div className="w-px bg-gray-100" />
      <div>
        <div className="text-2xl font-black text-gray-300">{total - predicted}</div>
        <div className="text-[10px] text-gray-400">Remaining</div>
      </div>
    </div>
  );
}

/* ─── Demo content ─────────────────────────────────────────────── */
function PredictionCarouselContent() {
  const { dataState, theme } = useDesignLab();

  const [fixtures, setFixtures] = useState<CarouselFixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [predictedCount, setPredictedCount] = useState(0);

  useEffect(() => {
    if (dataState === 'loading') { setLoading(true); return; }
    if (dataState === 'empty')   { setLoading(false); setFixtures([]); return; }
    if (dataState === 'error')   { setLoading(false); setError('Demo error state'); return; }

    setLoading(true);
    setError(null);

    footballClient
      .getActiveSeason()
      .then(s => footballClient.listFixtures({ seasonSlug: s.slug }))
      .then(list => setFixtures(list.slice(0, 8).map(toCarouselFixture)))
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
  }, [dataState]);

  const bg     = theme === 'dark' ? 'bg-psl-dark'  : 'bg-gray-50';
  const card   = theme === 'dark' ? 'bg-white/5 border-white/10'  : 'bg-white border-gray-100';
  const text   = theme === 'dark' ? 'text-white'   : 'text-psl-navy';

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
      <div className="bg-psl-navy text-white px-4 py-4 border-b border-white/10">
        <div className="mx-auto max-w-2xl flex items-center justify-between">
          <div>
            <h1 className={`text-xl font-black`}>Predictions</h1>
            <p className="text-xs text-white/50">Points-only · no stakes · no wagers</p>
          </div>
          <Link href="/predictions/me" className="text-xs text-psl-gold hover:text-yellow-300 transition-colors">
            My predictions →
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-6">
        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Stats row */}
        {!loading && fixtures.length > 0 && (
          <div className={`rounded-xl border ${card} px-5 py-3 mb-6 flex items-center justify-between`}>
            <StatsPanel total={fixtures.length} predicted={predictedCount} />
            <Link href="/leaderboards" className="text-xs text-psl-navy/60 hover:text-psl-navy transition-colors">
              Leaderboard →
            </Link>
          </div>
        )}

        {/* Carousel */}
        <FixturePredictionCarousel
          fixtures={fixtures}
          onSubmitPrediction={handleSubmit}
          loading={loading}
        />

        {/* Non-financial notice */}
        <div className={`mt-8 rounded-xl border ${card} p-4`}>
          <h2 className={`text-xs font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-white/50' : 'text-gray-400'} mb-2`}>
            About Predictions
          </h2>
          <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-white/60' : 'text-gray-500'}`}>
            PSL One predictions are <strong className={text}>points-only</strong>. You earn fan value points for
            correct outcomes and exact scores. There are no wagers, no stakes, no cash prizes, and no betting or
            gambling mechanics. This is a fan engagement feature, not a gambling product.
          </p>
          <div className="mt-3 grid grid-cols-3 gap-3 text-center">
            {[
              { label: 'Correct outcome', pts: '+3 pts' },
              { label: 'Exact score', pts: '+5 pts' },
              { label: 'Close score', pts: '+1 pt' },
            ].map(r => (
              <div key={r.label} className={`rounded-lg p-2 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
                <div className="text-sm font-black text-psl-gold">{r.pts}</div>
                <div className={`text-[10px] ${theme === 'dark' ? 'text-white/40' : 'text-gray-400'}`}>{r.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────────── */
export default function PredictionCarouselPage() {
  return (
    <DesignLabProvider defaultMode="IN_SEASON">
      <PredictionCarouselContent />
    </DesignLabProvider>
  );
}
