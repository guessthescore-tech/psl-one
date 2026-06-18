'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { PredictionScoreCard, SharePredictionSheet } from '@/components/vision';
import { PSL_FIXTURES, type VisionFixture } from '@/lib/vision-data';

const UPCOMING = PSL_FIXTURES.filter(f => f.status === 'SCHEDULED');

/* ── Score stepper ──────────────────────────────────────────────── */

function ScoreStepper({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
}) {
  const reduce = useReducedMotion();
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">{label}</span>
      <motion.button
        whileTap={reduce ? {} : { scale: 0.92 }}
        onClick={() => onChange(Math.min(value + 1, 9))}
        className="w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 text-white font-black text-lg flex items-center justify-center motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-psl-gold"
        aria-label={`Increase ${label} score`}
      >+</motion.button>

      <AnimatePresence mode="popLayout">
        <motion.span
          key={value}
          initial={reduce ? false : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
          className="text-stat-xl font-black text-white tabular-nums w-16 text-center"
          aria-live="polite"
        >
          {value}
        </motion.span>
      </AnimatePresence>

      <motion.button
        whileTap={reduce ? {} : { scale: 0.92 }}
        onClick={() => onChange(Math.max(value - 1, 0))}
        className="w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 text-white font-black text-lg flex items-center justify-center motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-psl-gold"
        aria-label={`Decrease ${label} score`}
      >-</motion.button>
    </div>
  );
}

/* ── Swipe fixture card ─────────────────────────────────────────── */

function PredictCard({
  fixture,
  onPredict,
}: {
  fixture: VisionFixture;
  onPredict: (home: number, away: number) => void;
}) {
  const [home, setHome] = useState(0);
  const [away, setAway] = useState(0);

  return (
    <div className="relative overflow-hidden rounded-card bg-psl-midnight border border-white/10 shadow-card-xl p-6 text-white w-full max-w-sm mx-auto">
      {/* Club accent bars */}
      <div className="absolute top-0 left-0 w-1/2 h-0.5" style={{ backgroundColor: fixture.homeClub.primaryColor }} aria-hidden />
      <div className="absolute top-0 right-0 w-1/2 h-0.5" style={{ backgroundColor: fixture.awayClub.primaryColor }} aria-hidden />

      {/* Kickoff info */}
      <div className="text-center mb-6">
        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
          {new Date(fixture.kickoffAt).toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'short' })}
        </p>
        <p className="text-[10px] text-white/30 mt-0.5">{fixture.venue}</p>
      </div>

      {/* Score stepper row */}
      <div className="flex items-center justify-center gap-8 mb-8">
        <div className="text-center">
          <div
            className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-xs font-black"
            style={{ backgroundColor: fixture.homeClub.primaryColor, color: fixture.homeClub.accentColor }}
            aria-hidden
          >{fixture.homeClub.abbr}</div>
          <p className="text-xs font-bold text-white">{fixture.homeClub.shortName}</p>
        </div>

        <div className="flex items-center gap-4">
          <ScoreStepper value={home} onChange={setHome} label="Home" />
          <span className="text-white/20 font-bold text-lg">-</span>
          <ScoreStepper value={away} onChange={setAway} label="Away" />
        </div>

        <div className="text-center">
          <div
            className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-xs font-black"
            style={{ backgroundColor: fixture.awayClub.primaryColor, color: fixture.awayClub.accentColor }}
            aria-hidden
          >{fixture.awayClub.abbr}</div>
          <p className="text-xs font-bold text-white">{fixture.awayClub.shortName}</p>
        </div>
      </div>

      {/* Predict CTA */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => onPredict(home, away)}
        className="w-full bg-psl-gold text-psl-midnight font-black text-sm py-3.5 rounded-card-sm hover:bg-yellow-300 motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-psl-gold min-h-[44px]"
        aria-label={`Lock in prediction: ${fixture.homeClub.shortName} ${home} - ${away} ${fixture.awayClub.shortName}`}
      >
        Lock in prediction
      </motion.button>

      <p className="text-[10px] text-white/25 text-center mt-3">
        Points only · No real money · No financial value
      </p>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────────── */

export default function VisionPredictPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [prediction, setPrediction] = useState<{ home: number; away: number } | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const reduce = useReducedMotion();

  const fixture = UPCOMING[activeIndex] ?? UPCOMING[0];

  function handlePredict(home: number, away: number) {
    setPrediction({ home, away });
  }

  function handleNext() {
    setPrediction(null);
    setActiveIndex(i => Math.min(i + 1, UPCOMING.length - 1));
  }

  if (!fixture) return null;

  return (
    <main className="min-h-[100dvh] bg-psl-dark flex flex-col">

      {/* Vision nav */}
      <nav className="bg-psl-midnight border-b border-white/10 px-6 py-3 flex items-center justify-between flex-shrink-0" aria-label="Vision studio nav">
        <Link href="/vision" className="text-[10px] font-bold text-white/40 hover:text-white/70 motion-safe:transition-colors flex items-center gap-1.5 focus-visible:outline-none">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Vision Hub
        </Link>
        <span className="text-[10px] font-bold uppercase tracking-widest text-psl-gold">Guess the Score</span>
        <span className="text-[10px] text-white/30">{activeIndex + 1} / {UPCOMING.length}</span>
      </nav>

      {/* Header */}
      <div className="text-center px-6 pt-8 pb-6 flex-shrink-0">
        <h1 className="text-display-md text-white">Guess the Score</h1>
        <p className="text-xs text-white/40 mt-2">Points only · no real money · No deposits</p>
      </div>

      {/* Fixture indicator pills */}
      <div className="flex items-center justify-center gap-2 pb-6 flex-shrink-0">
        {UPCOMING.map((_, i) => (
          <button
            key={i}
            onClick={() => { setActiveIndex(i); setPrediction(null); }}
            className={`rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-psl-gold ${
              i === activeIndex ? 'w-5 h-2 bg-psl-gold' : 'w-2 h-2 bg-white/20 hover:bg-white/40'
            }`}
            aria-label={`Fixture ${i + 1}`}
          />
        ))}
      </div>

      {/* Card area */}
      <div className="flex-1 px-6 pb-8">
        <AnimatePresence mode="wait">
          {prediction ? (
            <motion.div
              key="result"
              initial={reduce ? false : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3 }}
            >
              <PredictionScoreCard
                fixture={fixture}
                homeScore={prediction.home}
                awayScore={prediction.away}
                points={10}
                onDismiss={handleNext}
                visible
              />
              <div className="flex gap-3 mt-4 max-w-sm mx-auto">
                <button
                  onClick={() => setShareOpen(true)}
                  className="flex-1 border border-white/20 text-white text-xs font-bold py-3 rounded-card-sm hover:bg-white/8 motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-psl-gold min-h-[44px]"
                >
                  Share
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 bg-psl-green text-white text-xs font-bold py-3 rounded-card-sm hover:bg-psl-success motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-psl-green min-h-[44px]"
                >
                  Next
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={`card-${activeIndex}`}
              initial={reduce ? false : { opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.3 }}
            >
              <PredictCard fixture={fixture} onPredict={handlePredict} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Share sheet */}
      {prediction && (
        <SharePredictionSheet
          open={shareOpen}
          onClose={() => setShareOpen(false)}
          fixtureId={fixture.id}
          homeScore={prediction.home}
          awayScore={prediction.away}
          homeTeam={fixture.homeClub.shortName}
          awayTeam={fixture.awayClub.shortName}
        />
      )}
    </main>
  );
}
