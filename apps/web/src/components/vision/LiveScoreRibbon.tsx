'use client';

import Link from 'next/link';
import { type VisionFixture } from '@/lib/vision-data';

interface LiveScoreRibbonProps {
  fixtures: VisionFixture[];
}

function ScoreChip({ fixture }: { fixture: VisionFixture }) {
  const isLive     = fixture.status === 'LIVE' || fixture.status === 'HALF_TIME';
  const isFinished = fixture.status === 'FINISHED';

  return (
    <Link
      href={`/vision/matchday?fixture=${fixture.id}`}
      className="flex items-center gap-3 px-4 py-2 flex-shrink-0 border-r border-white/10 last:border-0 hover:bg-white/8 motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-psl-gold"
      aria-label={`${fixture.homeClub.shortName} vs ${fixture.awayClub.shortName}`}
    >
      {isLive && (
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-psl-live motion-safe:animate-live-pulse" aria-hidden />
          <span className="text-[10px] font-bold text-psl-live">{fixture.minute}&apos;</span>
        </span>
      )}
      {isFinished && (
        <span className="text-[10px] font-bold text-white/40">FT</span>
      )}
      <span className="text-xs font-bold text-white whitespace-nowrap">
        {fixture.homeClub.abbr}
        {' '}
        <span className={`tabular-nums ${isLive ? 'text-psl-live' : 'text-white'}`}>
          {fixture.homeScore ?? '-'} {fixture.awayScore ?? '-'}
        </span>
        {' '}
        {fixture.awayClub.abbr}
      </span>
    </Link>
  );
}

export function LiveScoreRibbon({ fixtures }: LiveScoreRibbonProps) {
  const active = fixtures.filter(f => f.status === 'LIVE' || f.status === 'HALF_TIME' || f.status === 'FINISHED');
  if (active.length === 0) return null;

  return (
    <nav
      className="bg-psl-midnight border-b border-white/10 overflow-x-auto"
      aria-label="Live scores"
      style={{ scrollbarWidth: 'none' }}
    >
      <div className="flex items-center">
        <div className="flex items-center gap-2 px-4 py-2 border-r border-white/10 flex-shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-psl-live motion-safe:animate-live-pulse" aria-hidden />
          <span className="text-[10px] font-black uppercase tracking-widest text-psl-live">Live</span>
        </div>
        {active.map(f => <ScoreChip key={f.id} fixture={f} />)}
      </div>
    </nav>
  );
}
