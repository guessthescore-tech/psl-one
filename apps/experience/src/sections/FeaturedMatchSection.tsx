import { expImg } from '@/lib/data';
import type { ExperienceData } from '@/lib/data';
import { TeamIdentity } from '@/components/ui/TeamIdentity';
import { ChallengeAction } from '@/components/actions/ChallengeAction';
import Link from 'next/link';

interface FeaturedMatchSectionProps {
  data: ExperienceData;
}

interface StatBarProps {
  label: string;
  home: number;
  away: number;
}

function StatBar({ label, home, away }: StatBarProps) {
  const total = home + away || 1;
  const homePct = Math.round((home / total) * 100);
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1.5 text-sm">
        <span className="font-bold text-white tabular-nums w-8">{home}</span>
        <span className="text-white/40 text-xs">{label}</span>
        <span className="font-bold text-white tabular-nums w-8 text-right">{away}</span>
      </div>
      <div className="flex h-1 rounded-full overflow-hidden">
        <div className="bg-exp-gold rounded-full transition-[width] duration-500 ease-out" style={{ width: `${homePct}%` }} aria-hidden />
        <div className="bg-white/20 flex-1 rounded-full" aria-hidden />
      </div>
    </div>
  );
}

export function FeaturedMatchSection({ data }: FeaturedMatchSectionProps) {
  const fixture = data.liveFixture ?? data.fixtures[0];
  if (!fixture) return null;

  return (
    <section
      className="relative bg-exp-void overflow-hidden py-16"
      aria-label={`Featured match: ${fixture.homeClub.shortName} vs ${fixture.awayClub.shortName}`}
    >
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={expImg('wc-2026-fanpark-stadium-lights', 1440, 600)}
          alt=""
          className="w-full h-full object-cover opacity-20"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-exp-void via-exp-void/80 to-exp-void" aria-hidden />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Live badge */}
        {fixture.status === 'LIVE' && (
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 bg-exp-live/15 border border-exp-live/30 rounded-pill px-4 py-1.5">
              <span className="w-2 h-2 rounded-full bg-exp-live animate-live-pulse" aria-hidden />
              <span className="text-label-md font-black text-exp-live">
                LIVE {fixture.minute}&apos;
              </span>
            </div>
          </div>
        )}

        {/* Scoreline */}
        <div className="flex items-center justify-center gap-8 sm:gap-16 mb-8">
          <TeamIdentity club={fixture.homeClub} size="xl" showName />

          <div className="text-center">
            {(fixture.status === 'LIVE' || fixture.status === 'FINISHED') ? (
              <div
                className="text-score-xl font-black text-white tabular-nums"
                aria-label={`Score: ${fixture.homeScore} to ${fixture.awayScore}`}
              >
                {fixture.homeScore} - {fixture.awayScore}
              </div>
            ) : (
              <div className="text-score-md font-black text-white/40">vs</div>
            )}
            <div className="text-label-sm text-white/30 mt-2">
              {fixture.venue.split(',')[0]}
            </div>
          </div>

          <TeamIdentity club={fixture.awayClub} size="xl" showName />
        </div>

        {/* Match stats */}
        {(fixture.status === 'LIVE' || fixture.status === 'FINISHED') && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/8 rounded-card p-5 mb-7">
            <h3 className="text-label-md text-white/50 mb-4 text-center">Match Statistics</h3>
            <StatBar label="Possession %" home={58} away={42} />
            <StatBar label="Shots" home={12} away={7} />
            <StatBar label="Shots on target" home={6} away={3} />
            <StatBar label="Corners" home={7} away={4} />
            <StatBar label="Fouls" home={9} away={13} />
          </div>
        )}

        {/* CTAs */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link
            href={`/predict?fixture=${fixture.id}`}
            className="bg-exp-gold text-exp-void text-sm font-black px-6 py-3 rounded-pill hover:bg-exp-gold-2 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold min-h-[44px] flex items-center"
          >
            Predict this match
          </Link>
          <ChallengeAction fixture={fixture} />
        </div>

        <p className="text-label-sm text-white/25 text-center mt-4">
          Points only - no real money - no deposits
        </p>
      </div>
    </section>
  );
}
