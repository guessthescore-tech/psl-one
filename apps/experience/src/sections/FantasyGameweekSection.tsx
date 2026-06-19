import type { ExperienceData } from '@/lib/data';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { TeamIdentity } from '@/components/ui/TeamIdentity';
import Link from 'next/link';

interface FantasyGameweekSectionProps {
  data: ExperienceData;
}

export function FantasyGameweekSection({ data }: FantasyGameweekSectionProps) {
  const { fantasyTeam, gameweek } = data;
  const captain = fantasyTeam.captain;

  return (
    <section
      className="bg-exp-ink py-12"
      aria-label="Fantasy gameweek panel"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <SectionHeader
            title="Fantasy"
            subtitle={gameweek.label}
            dark
            href="/fantasy"
            linkLabel="My team"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Points card */}
          <div className="md:col-span-1 bg-exp-gold/10 border border-exp-gold/25 rounded-card p-5">
            <p className="text-label-md text-exp-gold mb-1">Gameweek points</p>
            <p
              className="text-score-xl font-black text-white tabular-nums"
              aria-label={`${fantasyTeam.gameweekPoints} points this gameweek`}
            >
              {fantasyTeam.gameweekPoints}
              <span className="text-label-lg text-white/40 font-normal ml-1">pts</span>
            </p>
            <p className="text-label-sm text-white/40 mt-2">
              Overall: {fantasyTeam.totalPoints.toLocaleString()} pts
            </p>
          </div>

          {/* Captain */}
          <div className="bg-white/5 border border-white/8 rounded-card p-5">
            <p className="text-label-md text-white/50 mb-3">Captain</p>
            <div className="flex items-center gap-3">
              <div className="relative">
                <TeamIdentity club={captain.club} size="md" />
                <div
                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-exp-gold flex items-center justify-center"
                  aria-hidden
                >
                  <span className="text-[9px] font-black text-exp-void">C</span>
                </div>
              </div>
              <div>
                <p className="text-body-md font-bold text-white leading-tight">
                  {captain.name}
                </p>
                <p className="text-label-sm text-white/40">
                  {captain.position} - {captain.club.shortName}
                </p>
                <p className="text-label-md text-exp-gold font-bold mt-0.5">
                  {captain.fantasyPoints}pts x2
                </p>
              </div>
            </div>
          </div>

          {/* Transfers */}
          <div className="bg-white/5 border border-white/8 rounded-card p-5">
            <p className="text-label-md text-white/50 mb-3">Transfers</p>
            <div className="flex items-end gap-2 mb-1">
              <span
                className="text-score-lg font-black text-white tabular-nums"
                aria-label={`${fantasyTeam.transfersRemaining} transfers remaining`}
              >
                {fantasyTeam.transfersRemaining}
              </span>
              <span className="text-body-md text-white/40 mb-1">remaining</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-1 mt-3 mb-4">
              <div
                className="bg-exp-green h-1 rounded-full transition-[width] duration-300 ease-out"
                style={{ width: `${(fantasyTeam.transfersRemaining / 2) * 100}%` }}
                aria-hidden
              />
            </div>
            <Link
              href="/fantasy/transfers"
              className="text-label-md text-exp-gold hover:text-exp-gold-2 transition-colors duration-100 focus-visible:outline-none focus-visible:underline"
            >
              Make transfers
            </Link>
          </div>
        </div>

        <p className="text-label-sm text-white/25 text-center mt-5">
          Points only - no real money - no financial value
        </p>
      </div>
    </section>
  );
}
