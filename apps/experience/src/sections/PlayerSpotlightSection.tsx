import type { ExperienceData } from '@/lib/data';
import { PlayerPortrait } from '@/components/ui/PlayerPortrait';
import { SectionHeader } from '@/components/ui/SectionHeader';

interface PlayerSpotlightSectionProps {
  data: ExperienceData;
}

export function PlayerSpotlightSection({ data }: PlayerSpotlightSectionProps) {
  const [featured, ...rest] = data.players;
  if (!featured) return null;

  return (
    <section
      className="bg-exp-void py-12"
      aria-label="Top player spotlight"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Top Performers"
          subtitle="Gameweek stars"
          dark
          href="/players"
          linkLabel="All players"
        />

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6 items-start">
          {/* Featured full-card */}
          <div className="w-full max-w-xs mx-auto lg:mx-0">
            <PlayerPortrait player={featured} />
          </div>

          {/* Top performers list */}
          <div>
            <h3 className="text-label-md text-white/40 mb-3 uppercase tracking-widest">
              This gameweek
            </h3>
            <div className="space-y-2" role="list">
              {rest.slice(0, 5).map((player, i) => (
                <div
                  key={player.id}
                  role="listitem"
                  className="flex items-center gap-4 bg-white/4 hover:bg-white/7 border border-white/8 rounded-card-sm px-4 py-3 transition-colors duration-100"
                >
                  <span
                    className="text-label-lg font-black text-white/25 w-5 tabular-nums text-right flex-shrink-0"
                    aria-label={`Rank ${i + 2}`}
                  >
                    {i + 2}
                  </span>
                  <PlayerPortrait player={player} compact />
                  <div className="ml-auto text-right">
                    <p
                      className="text-stat-md font-black text-exp-gold tabular-nums"
                      aria-label={`${player.fantasyPoints} fantasy points`}
                    >
                      {player.fantasyPoints}
                      <span className="text-label-sm text-white/40 font-normal ml-0.5">pts</span>
                    </p>
                    <p className="text-label-sm text-white/35">
                      {player.goalsThisTournament}G {player.assistsThisTournament}A
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
