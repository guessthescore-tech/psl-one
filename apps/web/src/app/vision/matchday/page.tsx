'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { LiveScoreRibbon, SponsorMoment } from '@/components/vision';
import { PSL_FIXTURES, PSL_PLAYERS, visionImg } from '@/lib/vision-data';

function StatBar({ label, home, away }: { label: string; home: number; away: number }) {
  const total = home + away || 1;
  const homePct = Math.round((home / total) * 100);
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1.5 text-xs">
        <span className="font-bold text-psl-navy tabular-nums w-8">{home}</span>
        <span className="text-psl-muted text-[10px]">{label}</span>
        <span className="font-bold text-psl-navy tabular-nums w-8 text-right">{away}</span>
      </div>
      <div className="flex h-1 rounded-full overflow-hidden gap-0.5">
        <div className="bg-psl-navy rounded-full" style={{ width: `${homePct}%` }} aria-hidden />
        <div className="bg-psl-muted/30 flex-1 rounded-full" aria-hidden />
      </div>
    </div>
  );
}

export default function VisionMatchdayPage() {
  const reduce = useReducedMotion();
  const liveFixture = PSL_FIXTURES[0]!;
  const topScorer = PSL_PLAYERS[1]!;

  return (
    <main className="min-h-[100dvh] bg-psl-surface">

      {/* Vision nav */}
      <nav className="bg-psl-midnight border-b border-white/10 px-6 py-3 flex items-center justify-between" aria-label="Vision studio nav">
        <Link href="/vision" className="text-[10px] font-bold text-white/40 hover:text-white/70 motion-safe:transition-colors flex items-center gap-1.5 focus-visible:outline-none">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Vision Hub
        </Link>
        <span className="text-[10px] font-bold uppercase tracking-widest text-psl-gold">Live Matchday</span>
        <span className="text-[10px] text-white/30 uppercase tracking-wide">Design Review</span>
      </nav>

      {/* Live score ribbon */}
      <LiveScoreRibbon fixtures={PSL_FIXTURES} />

      {/* Hero match card */}
      <section
        className="relative bg-psl-midnight text-white overflow-hidden"
        aria-label={`Live: ${liveFixture.homeClub.name} vs ${liveFixture.awayClub.name}`}
      >
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${visionImg('football-stadium-night-sa', 1440, 600)})` }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-b from-psl-midnight/80 to-psl-midnight" aria-hidden />

        <div className="relative z-10 max-w-3xl mx-auto px-6 py-12 text-center">
          {/* Live indicator */}
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="w-2 h-2 rounded-full bg-psl-live motion-safe:animate-live-pulse" aria-hidden />
            <span className="text-xs font-black uppercase tracking-widest text-psl-live">
              LIVE · {liveFixture.minute}&apos;
            </span>
          </div>

          {/* Scoreline */}
          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center justify-center gap-8 mb-6"
          >
            <div className="text-center">
              <div
                className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-sm font-black"
                style={{ backgroundColor: liveFixture.homeClub.primaryColor, color: liveFixture.homeClub.accentColor }}
                aria-hidden
              >{liveFixture.homeClub.abbr}</div>
              <div className="text-sm font-bold">{liveFixture.homeClub.shortName}</div>
            </div>

            <div>
              <div className="text-stat-2xl font-black text-psl-live tabular-nums">
                {liveFixture.homeScore} - {liveFixture.awayScore}
              </div>
              <div className="text-xs text-white/40 text-center mt-1">{liveFixture.venue}</div>
            </div>

            <div className="text-center">
              <div
                className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-sm font-black"
                style={{ backgroundColor: liveFixture.awayClub.primaryColor, color: liveFixture.awayClub.accentColor }}
                aria-hidden
              >{liveFixture.awayClub.abbr}</div>
              <div className="text-sm font-bold">{liveFixture.awayClub.shortName}</div>
            </div>
          </motion.div>

          {/* Match actions */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="/vision/predict"
              className="inline-flex items-center gap-2 bg-psl-gold text-psl-midnight text-xs font-black px-5 py-2.5 rounded-pill hover:bg-yellow-300 motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-psl-gold min-h-[44px]"
            >
              Predict this match
            </Link>
            <Link
              href="/social-challenges/new"
              className="inline-flex items-center gap-2 border border-white/30 bg-white/10 text-white text-xs font-semibold px-5 py-2.5 rounded-pill hover:bg-white/20 motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 min-h-[44px]"
            >
              Challenge a fan
            </Link>
          </div>

          <p className="mt-5 text-[10px] text-white/25">Points only · no real money · No financial value</p>
        </div>
      </section>

      {/* Match stats */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        <h2 className="text-sm font-black text-psl-navy mb-5">Match Statistics</h2>
        <div className="bg-white rounded-card border border-[#e8eaf0] shadow-card p-5">
          <StatBar label="Possession %" home={58} away={42} />
          <StatBar label="Shots" home={12} away={7} />
          <StatBar label="Shots on target" home={6} away={3} />
          <StatBar label="Corners" home={7} away={4} />
          <StatBar label="Fouls" home={9} away={13} />
        </div>
      </div>

      {/* Top scorer feature */}
      <div className="max-w-3xl mx-auto px-6 pb-8">
        <div className="bg-psl-navy rounded-card p-5 text-white flex items-center gap-4">
          <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-white/10">
            <img src={visionImg(topScorer.imageKey, 96, 96)} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-psl-gold mb-0.5">Top scorer this GW</p>
            <p className="text-sm font-black text-white">{topScorer.name}</p>
            <p className="text-xs text-white/50">{topScorer.club.shortName} · {topScorer.goalsThisSeason} goals this season</p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-stat-md font-black text-psl-gold tabular-nums">{topScorer.fantasyPoints}</div>
            <div className="text-[10px] text-white/40">FPL pts</div>
          </div>
        </div>
      </div>

      <SponsorMoment />
    </main>
  );
}
