'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { footballClient, type Fixture } from '@/lib/football-client';
import { getCountryFlag } from '@/components/ui/TeamCrest';
import { ShareButton } from '@/components/share';

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('en-ZA', {
    weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

function Countdown({ kickoffAt }: { kickoffAt: string }) {
  const [label, setLabel] = useState('');

  useEffect(() => {
    function tick() {
      const diff = new Date(kickoffAt).getTime() - Date.now();
      if (diff <= 0) { setLabel('Starting soon'); return; }
      const d = Math.floor(diff / 86_400_000);
      const h = Math.floor((diff % 86_400_000) / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      if (d > 0) setLabel(`${d}d ${h}h`);
      else if (h > 0) setLabel(`${h}h ${m}m`);
      else setLabel(`${m}m`);
    }
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [kickoffAt]);

  return <span>{label}</span>;
}

function FixtureCard({ fixture, index }: { fixture: Fixture; index: number }) {
  const homeFlag = getCountryFlag(fixture.homeTeam.shortName);
  const awayFlag = getCountryFlag(fixture.awayTeam.shortName);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, delay: index * 0.04, ease: [0.32, 0.72, 0, 1] }}
      className="rounded-card border border-[#e8eaf0] bg-white shadow-card overflow-hidden"
    >
      {/* Date + countdown row */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-[#f0f2f7]">
        <span className="text-[11px] text-psl-muted font-medium">{fmtDate(fixture.kickoffAt)}</span>
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-psl-gold uppercase tracking-wide">
          <svg viewBox="0 0 16 16" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
            <circle cx="8" cy="8" r="6" />
            <path strokeLinecap="round" d="M8 5v3l2 2" />
          </svg>
          <Countdown kickoffAt={fixture.kickoffAt} />
        </span>
      </div>

      {/* Teams */}
      <div className="px-4 py-4 flex items-center gap-3">
        <div className="flex-1 text-center">
          <div className="text-2xl leading-none mb-1" aria-hidden>
            {homeFlag || fixture.homeTeam.shortName.slice(0, 2)}
          </div>
          <div className="text-xs font-bold text-psl-navy truncate">{fixture.homeTeam.shortName}</div>
        </div>
        <div className="flex-shrink-0 px-4">
          <div className="text-[10px] font-bold text-psl-muted uppercase tracking-widest">vs</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-2xl leading-none mb-1" aria-hidden>
            {awayFlag || fixture.awayTeam.shortName.slice(0, 2)}
          </div>
          <div className="text-xs font-bold text-psl-navy truncate">{fixture.awayTeam.shortName}</div>
        </div>
      </div>

      {/* Action row — Predict + Share + Challenge */}
      <div className="grid grid-cols-3 border-t border-[#f0f2f7]">
        <Link
          href={`/predictions/fixtures/${fixture.id}`}
          className="flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-bold text-psl-green hover:bg-psl-surface transition-colors focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-psl-green min-h-[44px] justify-center"
          aria-label={`Predict ${fixture.homeTeam.shortName} vs ${fixture.awayTeam.shortName}`}
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          Predict
        </Link>

        <ShareButton
          fixtureId={fixture.id}
          homeTeam={fixture.homeTeam.shortName}
          awayTeam={fixture.awayTeam.shortName}
          kickoffAt={fixture.kickoffAt}
          variant="card-footer"
        />

        <Link
          href={`/social-challenges/new?fixtureId=${fixture.id}`}
          className="flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-bold text-psl-muted hover:text-psl-navy hover:bg-psl-surface transition-colors focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-psl-navy min-h-[44px] justify-center"
          aria-label={`Challenge a friend on ${fixture.homeTeam.shortName} vs ${fixture.awayTeam.shortName}`}
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
          </svg>
          Challenge
        </Link>
      </div>
    </motion.div>
  );
}

function CardSkeleton() {
  return (
    <div className="rounded-card border border-[#e8eaf0] bg-white shadow-card overflow-hidden">
      <div className="px-4 pt-3 pb-2 border-b border-[#f0f2f7] flex justify-between">
        <div className="h-3 w-32 bg-gray-100 rounded motion-safe:animate-shimmer bg-shimmer-base bg-[length:200%_100%]" />
        <div className="h-3 w-16 bg-gray-100 rounded motion-safe:animate-shimmer bg-shimmer-base bg-[length:200%_100%]" />
      </div>
      <div className="px-4 py-4 flex items-center gap-3">
        <div className="flex-1 flex flex-col items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-100 motion-safe:animate-shimmer bg-shimmer-base bg-[length:200%_100%]" />
          <div className="h-2.5 w-10 bg-gray-100 rounded motion-safe:animate-shimmer bg-shimmer-base bg-[length:200%_100%]" />
        </div>
        <div className="w-8 h-3 bg-gray-100 rounded motion-safe:animate-shimmer bg-shimmer-base bg-[length:200%_100%]" />
        <div className="flex-1 flex flex-col items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-100 motion-safe:animate-shimmer bg-shimmer-base bg-[length:200%_100%]" />
          <div className="h-2.5 w-10 bg-gray-100 rounded motion-safe:animate-shimmer bg-shimmer-base bg-[length:200%_100%]" />
        </div>
      </div>
      <div className="grid grid-cols-3 border-t border-[#f0f2f7]">
        {[0, 1, 2].map(i => (
          <div key={i} className="flex items-center justify-center h-11">
            <div className="h-3 w-12 bg-gray-100 rounded motion-safe:animate-shimmer bg-shimmer-base bg-[length:200%_100%]" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PredictionFixturesPage() {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    footballClient.listFixtures()
      .then(all => {
        const now = Date.now();
        setFixtures(all.filter(f => f.status === 'SCHEDULED' && new Date(f.kickoffAt).getTime() > now));
        setLoading(false);
      })
      .catch(() => {
        setError('Could not load fixtures. Please try again.');
        setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen bg-psl-surface">
      {/* Page header */}
      <div className="bg-white border-b border-[#e8eaf0]">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 mb-1 text-xs text-psl-muted">
            <Link href="/predictions" className="hover:text-psl-navy transition-colors focus-visible:underline">
              Predictions
            </Link>
            <span>/</span>
            <span className="text-psl-navy font-semibold">Upcoming Fixtures</span>
          </div>
          <h1 className="text-display-sm text-psl-navy">Guess the Score</h1>
          <p className="text-xs text-psl-muted mt-0.5">Points only · no real money · predictions close at kick-off</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-4 rounded-card border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : fixtures.length === 0 ? (
          <div className="rounded-card border border-[#e8eaf0] bg-white p-10 text-center shadow-card">
            <div className="text-3xl mb-3" aria-hidden>⚽</div>
            <p className="text-sm font-semibold text-psl-navy mb-1">No upcoming fixtures</p>
            <p className="text-xs text-psl-muted mb-4">Check back soon for new prediction opportunities.</p>
            <Link href="/matches" className="text-xs font-semibold text-psl-navy hover:underline focus-visible:underline">
              Browse all matches →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {fixtures.map((f, i) => <FixtureCard key={f.id} fixture={f} index={i} />)}
          </div>
        )}
      </div>
    </main>
  );
}
