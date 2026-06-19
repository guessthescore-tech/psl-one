'use client';

import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Minus, Plus, Trophy } from '@phosphor-icons/react';
import type { ExperienceData } from '@/lib/data';
import { TeamIdentity } from '@/components/ui/TeamIdentity';
import { SectionHeader } from '@/components/ui/SectionHeader';

interface GuessTheScoreSectionProps {
  data: ExperienceData;
}

interface ScoreStepperProps {
  value: number;
  onChange: (v: number) => void;
  label: string;
}

function ScoreStepper({ value, onChange, label }: ScoreStepperProps) {
  const reduce = useReducedMotion();
  const [dir, setDir] = useState<1 | -1>(1);

  function step(delta: 1 | -1) {
    setDir(delta);
    onChange(Math.max(0, value + delta));
  }

  return (
    <div className="flex flex-col items-center gap-3" aria-label={`${label} score`}>
      <button
        onClick={() => step(1)}
        className="w-12 h-12 rounded-full bg-white/10 border border-white/15 text-white flex items-center justify-center hover:bg-white/18 active:scale-[0.97] transition-colors duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold"
        aria-label={`Increase ${label} score`}
      >
        <Plus size={20} weight="bold" aria-hidden />
      </button>

      <div className="relative h-16 w-14 flex items-center justify-center overflow-hidden" aria-live="polite">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            initial={reduce ? false : { y: dir * -32, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduce ? {} : { y: dir * 32, opacity: 0 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute text-score-xl font-black text-white tabular-nums"
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </div>

      <button
        onClick={() => step(-1)}
        disabled={value === 0}
        className="w-12 h-12 rounded-full bg-white/10 border border-white/15 text-white flex items-center justify-center hover:bg-white/18 active:scale-[0.97] transition-colors duration-100 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold"
        aria-label={`Decrease ${label} score`}
      >
        <Minus size={20} weight="bold" aria-hidden />
      </button>
    </div>
  );
}

export function GuessTheScoreSection({ data }: GuessTheScoreSectionProps) {
  const fixtures = data.fixtures.filter(f => f.status === 'SCHEDULED');
  const [activeIdx, setActiveIdx] = useState(0);
  const [homeScore, setHomeScore] = useState(1);
  const [awayScore, setAwayScore] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const fixture = fixtures[activeIdx] ?? data.fixtures[0];
  if (!fixture) return null;

  function handleSubmit() {
    setSubmitted(true);
  }

  return (
    <section
      className="bg-exp-navy py-14"
      aria-label="Guess the Score prediction game"
    >
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <SectionHeader
          title="Guess the Score"
          subtitle="Predict the exact scoreline to earn bonus points"
          dark
          href="/predict"
          linkLabel="All predictions"
        />

        {/* Fixture selector dots */}
        {fixtures.length > 1 && (
          <div className="flex items-center justify-center gap-2 mb-8" role="tablist" aria-label="Select fixture">
            {fixtures.map((f, i) => (
              <button
                key={f.id}
                role="tab"
                aria-selected={i === activeIdx}
                onClick={() => { setActiveIdx(i); setSubmitted(false); setHomeScore(1); setAwayScore(1); }}
                className={`transition-all duration-150 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold ${
                  i === activeIdx
                    ? 'w-6 h-2 bg-exp-gold'
                    : 'w-2 h-2 bg-white/25 hover:bg-white/40'
                }`}
                aria-label={`${f.homeClub.shortName} vs ${f.awayClub.shortName}`}
              />
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="submitted"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="bg-exp-green/15 border border-exp-green/30 rounded-card p-8 text-center"
            >
              <Trophy size={40} weight="fill" className="text-exp-gold mx-auto mb-3" aria-hidden />
              <p className="text-display-sm font-black text-white mb-1">Prediction locked in!</p>
              <p className="text-body-md text-white/60">
                {fixture.homeClub.shortName} {homeScore} - {awayScore} {fixture.awayClub.shortName}
              </p>
              <p className="text-label-sm text-white/35 mt-3">
                Points only - no real money - no financial value
              </p>
              <button
                onClick={() => { setSubmitted(false); setHomeScore(1); setAwayScore(1); }}
                className="mt-5 text-label-md text-exp-gold underline underline-offset-2 hover:text-exp-gold-2 transition-colors duration-100"
              >
                Change prediction
              </button>
            </motion.div>
          ) : (
            <motion.div
              key={fixture.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white/5 border border-white/8 rounded-card p-6 sm:p-8"
            >
              {/* Teams */}
              <div className="flex items-center justify-between mb-6">
                <TeamIdentity club={fixture.homeClub} size="md" showName />
                <span className="text-label-sm text-white/30">vs</span>
                <TeamIdentity club={fixture.awayClub} size="md" showName />
              </div>

              {/* Steppers */}
              <div className="flex items-center justify-center gap-6 sm:gap-12 mb-8">
                <ScoreStepper value={homeScore} onChange={setHomeScore} label={fixture.homeClub.shortName} />
                <div className="text-display-xl font-black text-white/20 select-none">-</div>
                <ScoreStepper value={awayScore} onChange={setAwayScore} label={fixture.awayClub.shortName} />
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                className="w-full bg-exp-gold text-exp-void font-black py-3.5 rounded-pill hover:bg-exp-gold-2 active:scale-[0.97] transition-all duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold min-h-[44px]"
              >
                Lock in prediction
              </button>

              <p className="text-label-sm text-white/30 text-center mt-3">
                Points only - no real money - no financial value
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
