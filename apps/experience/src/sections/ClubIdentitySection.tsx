import type { ExperienceData } from '@/lib/data';
import { TeamIdentity } from '@/components/ui/TeamIdentity';
import { SectionHeader } from '@/components/ui/SectionHeader';
import Link from 'next/link';

interface ClubIdentitySectionProps {
  data: ExperienceData;
}

export function ClubIdentitySection({ data }: ClubIdentitySectionProps) {
  return (
    <section
      className="bg-white py-12 border-t border-exp-border"
      aria-label="Club directory"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Teams"
          subtitle={data.competitionName}
          href="/players"
          linkLabel="All players"
        />

        <div
          className="mt-6 flex gap-4 overflow-x-auto scrollbar-none snap-rail -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 pb-2"
          role="list"
          aria-label="Participating clubs"
        >
          {data.clubs.map(club => (
            <Link
              key={club.id}
              href="/players"
              role="listitem"
              className="flex-shrink-0 snap-start flex flex-col items-center gap-2.5 p-4 w-28 rounded-card hover:bg-exp-surface border border-transparent hover:border-exp-border transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-green group"
              aria-label={`${club.name} club page`}
            >
              <div className="group-hover:scale-[1.06] transition-transform duration-200 motion-reduce:transform-none">
                <TeamIdentity club={club} size="xl" />
              </div>
              <span className="text-label-sm font-bold text-exp-navy text-center leading-tight">
                {club.shortName}
              </span>
            </Link>
          ))}
          <div className="w-4 flex-shrink-0" aria-hidden />
        </div>
      </div>
    </section>
  );
}
