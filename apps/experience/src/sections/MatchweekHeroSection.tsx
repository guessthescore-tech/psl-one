'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { expImg } from '@/lib/data';
import type { ExperienceData } from '@/lib/data';
import { TeamIdentity } from '@/components/ui/TeamIdentity';

interface MatchweekHeroSectionProps {
  data: ExperienceData;
}

export function MatchweekHeroSection({ data }: MatchweekHeroSectionProps) {
  const reduce = useReducedMotion();
  const { gameweek, liveFixture, competitionName } = data;
  const fixture = liveFixture ?? data.fixtures.find(f => f.status === 'SCHEDULED') ?? data.fixtures[0];

  return (
    <section
      className="relative min-h-[100dvh] lg:min-h-[80dvh] bg-exp-void flex items-end overflow-hidden"
      aria-label="Matchweek overview"
    >
      {/* Background photography */}
      <div className="absolute inset-0">
        <img
          src={expImg('psl-match-night-stadium-floodlit', 1440, 900)}
          alt=""
          className="w-full h-full object-cover object-center"
          fetchPriority="high"
        />
        {/* Layered gradient scrim */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, rgba(6,13,25,0.55) 0%, rgba(6,13,25,0.25) 40%, rgba(6,13,25,0.92) 80%, rgba(6,13,25,1) 100%)',
          }}
          aria-hidden
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-end">

          {/* Left: matchweek context */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Competition label */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 rounded-full bg-exp-gold" aria-hidden />
              <span className="text-label-md text-exp-gold uppercase tracking-widest">
                {competitionName}
              </span>
            </div>

            {/* Matchweek heading */}
            <h1 className="text-display-xl text-white font-black mb-2">
              {gameweek.label}
            </h1>
            <p className="text-body-lg text-white/60 mb-6">
              {gameweek.status === 'ACTIVE' ? 'In progress' : 'Upcoming'}
              {' — '}deadline{' '}
              {new Date(gameweek.deadlineAt).toLocaleDateString('en-ZA', {
                weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
              })}
            </p>

            {/* Stats row */}
            <div
              className="grid grid-cols-3 gap-3 max-w-sm"
              role="list"
              aria-label="Matchweek statistics"
            >
              {[
                { label: 'High score',   value: gameweek.highestPoints,  unit: 'pts' },
                { label: 'Average',      value: gameweek.averagePoints,   unit: 'pts' },
                { label: 'Predictions',  value: gameweek.totalPredictions.toLocaleString(), unit: '' },
              ].map(s => (
                <div
                  key={s.label}
                  className="bg-white/8 backdrop-blur-sm border border-white/10 rounded-card-sm p-3"
                  role="listitem"
                >
                  <div className="text-stat-md font-black text-white tabular-nums">{s.value}</div>
                  <div className="text-label-sm text-white/45 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: featured fixture */}
          {fixture && (
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              <div
                className="bg-white/6 backdrop-blur-md border border-white/12 rounded-card p-6 shadow-inner-top"
                role="region"
                aria-label={`Featured fixture: ${fixture.homeClub.shortName} vs ${fixture.awayClub.shortName}`}
              >
                {/* Status */}
                <div className="flex items-center justify-between mb-5">
                  {fixture.status === 'LIVE' ? (
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full bg-exp-live animate-live-pulse"
                        aria-hidden
                      />
                      <span className="text-label-md font-black text-exp-live">
                        LIVE {fixture.minute}&apos;
                      </span>
                    </div>
                  ) : fixture.status === 'FINISHED' ? (
                    <span className="text-label-md text-white/40">Full time</span>
                  ) : (
                    <span className="text-label-md text-white/40">
                      {new Date(fixture.kickoffAt).toLocaleDateString('en-ZA', {
                        weekday: 'short', day: 'numeric', month: 'short',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                  )}
                  {fixture.group && (
                    <span className="text-label-sm text-white/30">{fixture.group}</span>
                  )}
                </div>

                {/* Scoreline */}
                <div className="flex items-center justify-between gap-4">
                  <TeamIdentity club={fixture.homeClub} size="lg" showName />

                  <div className="text-center">
                    {(fixture.status === 'LIVE' || fixture.status === 'FINISHED' || fixture.status === 'HALF_TIME') ? (
                      <div
                        className="text-score-lg font-black text-white tabular-nums"
                        aria-label={`Score ${fixture.homeScore} to ${fixture.awayScore}`}
                      >
                        {fixture.homeScore} - {fixture.awayScore}
                      </div>
                    ) : (
                      <div className="text-display-md font-black text-white/40">vs</div>
                    )}
                    <div className="text-label-sm text-white/30 mt-1">{fixture.venue.split(',')[0]}</div>
                  </div>

                  <TeamIdentity club={fixture.awayClub} size="lg" showName />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
