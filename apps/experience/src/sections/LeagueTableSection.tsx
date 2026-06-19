import type { ExperienceData } from '@/lib/data';
import { LeagueTable } from '@/components/ui/LeagueTable';
import { SectionHeader } from '@/components/ui/SectionHeader';

interface LeagueTableSectionProps {
  data: ExperienceData;
}

export function LeagueTableSection({ data }: LeagueTableSectionProps) {
  return (
    <section
      className="bg-exp-surface py-12"
      aria-label="League standings"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <SectionHeader
            title="Standings"
            subtitle={data.competitionName}
            href="/table"
            linkLabel="Full table"
          />
        </div>

        <div className="bg-white rounded-card shadow-card overflow-hidden">
          <LeagueTable standings={data.standings} />
        </div>

        {/* Key */}
        <div className="flex items-center gap-6 mt-4 pl-1" aria-label="Table legend">
          <div className="flex items-center gap-2">
            <div className="w-0.5 h-4 rounded-full bg-exp-green" aria-hidden />
            <span className="text-label-sm text-exp-muted">Qualified</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-0.5 h-4 rounded-full bg-exp-gold" aria-hidden />
            <span className="text-label-sm text-exp-muted">Playoff</span>
          </div>
          <div className="flex items-center gap-4 ml-auto">
            {(['W', 'D', 'L'] as const).map(r => (
              <div key={r} className="flex items-center gap-1.5">
                <span
                  className={`w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center text-white ${
                    r === 'W' ? 'bg-exp-green' : r === 'D' ? 'bg-exp-gold' : 'bg-exp-live'
                  }`}
                  aria-hidden
                >
                  {r}
                </span>
                <span className="text-label-sm text-exp-muted">{r === 'W' ? 'Win' : r === 'D' ? 'Draw' : 'Loss'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
