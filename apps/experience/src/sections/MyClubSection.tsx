import type { ExperienceData } from '@/lib/data';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { TeamIdentity } from '@/components/ui/TeamIdentity';
import Link from 'next/link';

interface MyClubSectionProps {
  data: ExperienceData;
}

export function MyClubSection({ data }: MyClubSectionProps) {
  const myClub = data.clubs[0];
  if (!myClub) return null;

  const standing = data.standings.find(s => s.club.id === myClub.id);
  const nextFixture = data.fixtures.find(
    f => (f.homeClub.id === myClub.id || f.awayClub.id === myClub.id) && f.status === 'SCHEDULED',
  );
  const opponent = nextFixture
    ? nextFixture.homeClub.id === myClub.id
      ? nextFixture.awayClub
      : nextFixture.homeClub
    : null;

  return (
    <section
      className="bg-exp-surface py-12 border-t border-exp-border"
      aria-label="My club preview"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="My Club"
          subtitle="Quick look"
          href="/players"
          linkLabel={`${myClub.name} hub`}
        />

        <div className="mt-6 bg-white rounded-card shadow-card overflow-hidden">
          {/* Club header stripe */}
          <div
            className="h-2"
            style={{ background: `linear-gradient(to right, ${myClub.primaryColor}, ${myClub.secondaryColor})` }}
            aria-hidden
          />

          <div className="p-6 flex flex-col sm:flex-row gap-6">
            {/* Identity + standing */}
            <div className="flex items-center gap-4">
              <TeamIdentity club={myClub} size="xl" />
              <div>
                <p className="text-display-sm font-black text-exp-navy leading-tight">{myClub.name}</p>
                {standing && (
                  <p className="text-body-md text-exp-muted mt-0.5">
                    {standing.position === 1 ? '1st' : standing.position === 2 ? '2nd' : standing.position === 3 ? '3rd' : `${standing.position}th`}
                    {' in '}{data.competitionName}
                  </p>
                )}
              </div>
            </div>

            {/* Stats */}
            {standing && (
              <div
                className="flex-1 grid grid-cols-3 gap-3 sm:justify-end"
                role="list"
                aria-label="Club statistics"
              >
                {[
                  { label: 'Played', value: standing.played },
                  { label: 'Points', value: standing.points },
                  { label: 'GD',     value: standing.goalDifference > 0 ? `+${standing.goalDifference}` : standing.goalDifference },
                ].map(stat => (
                  <div
                    key={stat.label}
                    role="listitem"
                    className="bg-exp-surface rounded-card-sm p-3 text-center"
                  >
                    <p className="text-stat-xl font-black text-exp-navy tabular-nums">{stat.value}</p>
                    <p className="text-label-sm text-exp-muted">{stat.label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Next fixture */}
          {nextFixture && opponent && (
            <div className="border-t border-exp-border px-6 py-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-label-sm text-exp-muted">Next match</p>
                <div className="flex items-center gap-2 mt-1">
                  <TeamIdentity club={opponent} size="sm" />
                  <p className="text-body-md font-bold text-exp-navy">vs {opponent.shortName}</p>
                </div>
                <p className="text-label-sm text-exp-muted mt-0.5">
                  {new Date(nextFixture.kickoffAt).toLocaleDateString('en-ZA', {
                    weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                  })}
                </p>
              </div>
              <Link
                href={`/predict?fixture=${nextFixture.id}`}
                className="bg-exp-gold text-exp-void text-label-md font-black px-5 py-2.5 rounded-pill hover:bg-exp-gold-2 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold min-h-[44px] flex items-center whitespace-nowrap"
              >
                Predict
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
