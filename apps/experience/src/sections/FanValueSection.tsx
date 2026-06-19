import type { ExperienceData } from '@/lib/data';
import { SectionHeader } from '@/components/ui/SectionHeader';

interface FanValueSectionProps {
  data: ExperienceData;
}

const CATEGORIES = [
  { key: 'predictions', label: 'Predictions', color: 'bg-exp-gold' },
  { key: 'fantasy',     label: 'Fantasy',     color: 'bg-exp-green' },
  { key: 'social',      label: 'Social',      color: 'bg-blue-400' },
  { key: 'streaks',     label: 'Streaks',     color: 'bg-purple-400' },
] as const;

export function FanValueSection({ data }: FanValueSectionProps) {
  const { fanValue } = data;
  if (!fanValue) return null;

  const categoryTotals: Record<string, number> = {
    predictions: Math.round(fanValue.total * 0.35),
    fantasy:     Math.round(fanValue.total * 0.40),
    social:      Math.round(fanValue.total * 0.15),
    streaks:     Math.round(fanValue.total * 0.10),
  };

  return (
    <section
      className="bg-exp-navy-2 py-12"
      aria-label="Fan Value dashboard"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Fan Value"
          subtitle="Your engagement score"
          dark
          href="/profile/fan-value"
          linkLabel="Full breakdown"
        />

        {/* Total + level */}
        <div className="mt-6 flex items-end gap-4 mb-8">
          <div>
            <p
              className="text-score-xl font-black text-white tabular-nums leading-none"
              aria-label={`Total fan value: ${fanValue.total.toLocaleString()} points`}
            >
              {fanValue.total.toLocaleString()}
            </p>
            <p className="text-label-md text-white/40 mt-1">total points</p>
          </div>
          <div className="mb-1.5 ml-2 inline-flex items-center gap-2 bg-exp-gold/15 border border-exp-gold/30 rounded-pill px-4 py-1.5">
            <span className="text-label-md font-black text-exp-gold">{fanValue.level}</span>
          </div>
        </div>

        {/* Category breakdown bars */}
        <div className="space-y-4" role="list" aria-label="Fan value category breakdown">
          {CATEGORIES.map(cat => {
            const pts = categoryTotals[cat.key] ?? 0;
            const pct = Math.round((pts / fanValue.total) * 100);
            return (
              <div key={cat.key} role="listitem">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-label-md text-white/70">{cat.label}</span>
                  <span
                    className="text-label-md font-bold text-white tabular-nums"
                    aria-label={`${pts.toLocaleString()} points`}
                  >
                    {pts.toLocaleString()}
                    <span className="text-white/35 font-normal text-xs ml-0.5">pts</span>
                  </span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`${cat.color} h-full rounded-full transition-all duration-700`}
                    style={{ width: `${pct}%` }}
                    role="progressbar"
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${cat.label}: ${pct}%`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-label-sm text-white/25 text-center mt-6">
          Points only - no real money - no financial value
        </p>
      </div>
    </section>
  );
}
