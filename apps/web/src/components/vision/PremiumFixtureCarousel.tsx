'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { type VisionFixture } from '@/lib/vision-data';

function statusLabel(f: VisionFixture): string {
  if (f.status === 'LIVE') return `${f.minute ?? 0}'`;
  if (f.status === 'HALF_TIME') return 'HT';
  if (f.status === 'FINISHED') return 'FT';
  return new Date(f.kickoffAt).toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short' });
}

function FixtureCard({ fixture, index }: { fixture: VisionFixture; index: number }) {
  const reduce  = useReducedMotion();
  const isLive  = fixture.status === 'LIVE' || fixture.status === 'HALF_TIME';
  const hasSore = fixture.homeScore !== null;

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        href={`/vision/predict?fixture=${fixture.id}`}
        className={`flex-shrink-0 w-52 rounded-card border p-4 block motion-safe:transition-all motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-card-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-psl-gold focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
          isLive
            ? 'bg-psl-midnight border-psl-live/30 shadow-card-md'
            : 'bg-white border-[#e8eaf0] shadow-card'
        }`}
        aria-label={`${fixture.homeClub.name} vs ${fixture.awayClub.name}`}
      >
        {/* Status */}
        <div className="flex items-center justify-between mb-4">
          {isLive ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-psl-live uppercase tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-psl-live motion-safe:animate-live-pulse" aria-hidden />
              {statusLabel(fixture)}
            </span>
          ) : (
            <span className={`text-[10px] font-semibold ${fixture.status === 'FINISHED' ? 'text-psl-muted' : 'text-psl-navy'}`}>
              {statusLabel(fixture)}
            </span>
          )}
          <span className="text-[10px] text-psl-muted truncate ml-2">{fixture.venue}</span>
        </div>

        {/* Home */}
        <div className="flex items-center justify-between mb-2">
          <div
            className="w-6 h-6 rounded-full flex-shrink-0"
            style={{ backgroundColor: fixture.homeClub.primaryColor }}
            aria-hidden
          />
          <span className={`text-xs font-bold flex-1 mx-2 truncate ${isLive ? 'text-white' : 'text-psl-navy'}`}>
            {fixture.homeClub.shortName}
          </span>
          <span className={`text-lg font-black tabular-nums w-6 text-right ${isLive ? 'text-psl-live' : 'text-psl-navy'}`}>
            {hasSore ? fixture.homeScore : ''}
          </span>
        </div>

        {/* Away */}
        <div className="flex items-center justify-between">
          <div
            className="w-6 h-6 rounded-full flex-shrink-0"
            style={{ backgroundColor: fixture.awayClub.primaryColor }}
            aria-hidden
          />
          <span className={`text-xs font-bold flex-1 mx-2 truncate ${isLive ? 'text-white' : 'text-psl-navy'}`}>
            {fixture.awayClub.shortName}
          </span>
          <span className={`text-lg font-black tabular-nums w-6 text-right ${isLive ? 'text-psl-live' : 'text-psl-navy'}`}>
            {hasSore ? fixture.awayScore : ''}
          </span>
        </div>

        {!hasSore && (
          <div className="mt-4 pt-3 border-t border-[#e8eaf0]">
            <span className="text-[10px] font-semibold text-psl-gold">Predict score</span>
          </div>
        )}
      </Link>
    </motion.div>
  );
}

interface PremiumFixtureCarouselProps {
  fixtures: VisionFixture[];
  label?: string;
}

export function PremiumFixtureCarousel({ fixtures, label = 'Fixtures' }: PremiumFixtureCarouselProps) {
  return (
    <section aria-label={label} className="py-8 px-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-display-sm text-psl-navy">{label}</h2>
        <Link href="/vision/predict" className="text-xs font-semibold text-psl-gold hover:underline focus-visible:outline-none">
          Predict all
        </Link>
      </div>
      <div
        className="flex gap-4 overflow-x-auto pb-3"
        style={{ scrollbarWidth: 'none', scrollSnapType: 'x mandatory' }}
        role="list"
      >
        {fixtures.map((f, i) => (
          <div key={f.id} role="listitem" style={{ scrollSnapAlign: 'start' }}>
            <FixtureCard fixture={f} index={i} />
          </div>
        ))}
      </div>
    </section>
  );
}
