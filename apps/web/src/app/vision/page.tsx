'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { getDataMode, visionImg } from '@/lib/vision-data';

/* ── Destination config ─────────────────────────────────────────── */

const DESTINATIONS = [
  {
    href: '/vision/in-season',
    label: 'In-Season Home',
    sub: 'Matchday authority view with all 15 components',
    imageKey: 'football-stadium-hero',
    accent: '#1b3a6b',
    span: 'col-span-2',
  },
  {
    href: '/vision/matchday',
    label: 'Live Matchday',
    sub: 'Real-time scores, stats and fan reactions',
    imageKey: 'football-match-live',
    accent: '#e63946',
    span: '',
  },
  {
    href: '/vision/predict',
    label: 'Guess the Score',
    sub: 'Swipe-first prediction carousel',
    imageKey: 'football-prediction',
    accent: '#00843d',
    span: '',
  },
  {
    href: '/vision/fantasy',
    label: 'Fantasy Hub',
    sub: 'Pitch-view squad management',
    imageKey: 'football-fantasy',
    accent: '#1b3a6b',
    span: '',
  },
  {
    href: '/vision/clubs',
    label: 'Club Identity',
    sub: 'All 16 PSL clubs experience',
    imageKey: 'football-clubs',
    accent: '#ffd700',
    span: '',
  },
  {
    href: '/vision/player',
    label: 'Player Spotlight',
    sub: 'Featured player editorial',
    imageKey: 'football-player-hero',
    accent: '#00843d',
    span: '',
  },
  {
    href: '/vision/account',
    label: 'Fan Identity',
    sub: 'Fan Value, achievements and profile',
    imageKey: 'football-fan',
    accent: '#ffd700',
    span: '',
  },
];

/* ── Destination card ────────────────────────────────────────────── */

function DestCard({ dest, index }: { dest: (typeof DESTINATIONS)[0]; index: number }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className={dest.span}
    >
      <Link
        href={dest.href}
        className="group block rounded-card overflow-hidden relative bg-psl-midnight border border-white/10 shadow-card-md motion-safe:hover:shadow-card-xl motion-safe:hover:-translate-y-0.5 motion-safe:transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-psl-gold focus-visible:ring-offset-2 focus-visible:ring-offset-psl-dark"
        aria-label={`Open ${dest.label}`}
      >
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40 motion-safe:group-hover:opacity-50 motion-safe:group-hover:scale-105 motion-safe:transition-all motion-safe:duration-500"
          style={{ backgroundImage: `url(${visionImg(dest.imageKey, 800, 450)})` }}
          aria-hidden
        />
        {/* Scrim */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-psl-midnight via-psl-midnight/50 to-transparent"
          aria-hidden
        />
        {/* Accent stripe */}
        <div
          className="absolute top-0 left-0 right-0 h-0.5"
          style={{ backgroundColor: dest.accent }}
          aria-hidden
        />

        {/* Content */}
        <div className="relative z-10 p-5 min-h-[160px] flex flex-col justify-end">
          <h2 className="text-sm font-black text-white leading-tight">{dest.label}</h2>
          <p className="text-[11px] text-white/50 mt-1 leading-relaxed">{dest.sub}</p>
          <div className="mt-3 flex items-center gap-1 text-[10px] font-bold" style={{ color: dest.accent }}>
            Open
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ── Page ───────────────────────────────────────────────────────── */

export default function VisionHubPage() {
  const dataMode = getDataMode();

  return (
    <main className="min-h-[100dvh] bg-psl-dark text-white">

      {/* ── Header ──────────────────────────────────────────────── */}
      <header className="bg-psl-midnight border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 pt-8 pb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-white/40 hover:text-white/70 text-xs motion-safe:transition-colors mb-8 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30 rounded"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Live site
          </Link>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 bg-psl-gold/15 border border-psl-gold/30 rounded-pill px-3 py-1 mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-psl-gold" aria-hidden />
                <span className="text-[10px] font-bold tracking-widest text-psl-gold uppercase">Vision Studio</span>
              </div>
              <h1 className="text-display-xl text-white leading-none">PSL One</h1>
              <p className="text-display-sm text-white/40 leading-none mt-1">Design Review</p>
            </div>
            <div className="md:text-right">
              <div className="inline-flex items-center gap-2 bg-white/8 border border-white/15 rounded-pill px-3 py-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${dataMode === 'LIVE_BETA_DATA' ? 'bg-psl-green motion-safe:animate-live-pulse' : 'bg-amber-400'}`} aria-hidden />
                <span className="text-[10px] font-bold tracking-wide text-white/70 uppercase">
                  {dataMode === 'LIVE_BETA_DATA' ? 'Live Beta Data' : 'Design Review Data'}
                </span>
              </div>
              <p className="text-xs text-white/30 mt-2">
                Points only · No real money · Internal review
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ── Destinations grid ───────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-6">8 Screens</p>

        {/* Asymmetric grid: featured first (col-span-2), then 3-col and 2-col rows */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {DESTINATIONS.map((d, i) => (
            <DestCard key={d.href} dest={d} index={i} />
          ))}
        </div>
      </div>

      {/* ── Design tokens reference ──────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 pb-10" aria-label="Design tokens">
        <div className="border-t border-white/10 pt-8">
          <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-5">Visual Language</p>
          <div className="flex flex-wrap gap-5">
            {[
              { label: 'Navy',     hex: '#1b3a6b' },
              { label: 'Midnight', hex: '#0d1b2e' },
              { label: 'Gold',     hex: '#ffd700' },
              { label: 'Green',    hex: '#00843d' },
              { label: 'Live',     hex: '#ef4444' },
            ].map(t => (
              <div key={t.label} className="flex items-center gap-2.5">
                <div
                  className="w-7 h-7 rounded-card-sm shadow-inner"
                  style={{ backgroundColor: t.hex }}
                  aria-hidden
                />
                <div>
                  <div className="text-xs font-semibold text-white/70">{t.label}</div>
                  <div className="text-[10px] font-mono text-white/30">{t.hex}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="max-w-7xl mx-auto px-6 py-5 border-t border-white/8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <p className="text-[11px] text-white/30">
            PSL One Vision Studio · Internal review only · Not for public distribution
          </p>
          <p className="text-[11px] text-white/30">
            Disable:{' '}
            <code className="font-mono bg-white/8 px-1.5 py-0.5 rounded text-[10px] text-psl-gold">
              NEXT_PUBLIC_VISION_STUDIO_ENABLED=false
            </code>
          </p>
        </div>
      </footer>

    </main>
  );
}
