import { clsx } from 'clsx';
import type { ExpStanding } from '@/lib/data';

interface LeagueTableProps {
  standings: ExpStanding[];
  compact?: boolean;
}

const FORM_COLOR: Record<'W' | 'D' | 'L', string> = {
  W: 'bg-exp-green',
  D: 'bg-exp-gold',
  L: 'bg-exp-live',
};

const FORM_LABEL: Record<'W' | 'D' | 'L', string> = {
  W: 'Win', D: 'Draw', L: 'Loss',
};

export function LeagueTable({ standings, compact = false }: LeagueTableProps) {
  const rows = compact ? standings.slice(0, 5) : standings;

  return (
    <div
      className="overflow-hidden rounded-card border border-exp-border bg-exp-card shadow-card"
      role="region"
      aria-label="League standings"
    >
      {/* Header */}
      <div className="grid grid-cols-[2.5rem_1fr_2rem_2rem_2rem_2.5rem_auto] gap-x-2 px-4 py-2 border-b border-exp-border bg-exp-surface">
        <span className="text-label-sm text-exp-muted text-center">#</span>
        <span className="text-label-sm text-exp-muted">Club</span>
        <span className="text-label-sm text-exp-muted text-center">P</span>
        <span className="text-label-sm text-exp-muted text-center">W</span>
        <span className="text-label-sm text-exp-muted text-center">GD</span>
        <span className="text-label-sm text-exp-muted text-center font-bold">Pts</span>
        <span className="text-label-sm text-exp-muted text-right">Form</span>
      </div>

      {/* Rows */}
      {rows.map((s, i) => {
        const isChampions = s.position <= 2;
        const isQualifier = s.position === 3;

        return (
          <div
            key={s.club.id}
            className={clsx(
              'grid grid-cols-[2.5rem_1fr_2rem_2rem_2rem_2.5rem_auto] gap-x-2 px-4 py-3 items-center',
              'border-b border-exp-border last:border-b-0 relative',
              isChampions ? 'bg-exp-green/5' : isQualifier ? 'bg-exp-gold/5' : '',
            )}
          >
            {/* Champions/qualifier stripe */}
            {(isChampions || isQualifier) && (
              <div
                className={clsx(
                  'absolute left-0 top-0 bottom-0 w-0.5',
                  isChampions ? 'bg-exp-green' : 'bg-exp-gold',
                )}
                aria-hidden
              />
            )}

            {/* Position */}
            <span className="text-sm font-bold text-exp-muted tabular-nums text-center">
              {s.position}
            </span>

            {/* Club */}
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[8px] font-black"
                style={{ backgroundColor: s.club.primaryColor, color: s.club.textColor }}
                aria-hidden
              >
                {s.club.abbr.slice(0, 2)}
              </div>
              <span className="text-sm font-semibold text-exp-navy truncate">
                {s.club.shortName}
              </span>
            </div>

            {/* Stats */}
            <span className="text-sm text-exp-muted tabular-nums text-center">{s.played}</span>
            <span className="text-sm text-exp-muted tabular-nums text-center">{s.won}</span>
            <span className={clsx(
              'text-sm tabular-nums text-center font-medium',
              s.goalDifference > 0 ? 'text-exp-green' : s.goalDifference < 0 ? 'text-exp-live' : 'text-exp-muted',
            )}>
              {s.goalDifference > 0 ? '+' : ''}{s.goalDifference}
            </span>
            <span className="text-sm font-black text-exp-navy tabular-nums text-center">{s.points}</span>

            {/* Form dots */}
            <div className="flex gap-0.5 justify-end">
              {s.form.slice(-3).map((result, j) => (
                <span
                  key={j}
                  className={clsx('w-2 h-2 rounded-full', FORM_COLOR[result])}
                  title={FORM_LABEL[result]}
                  aria-label={FORM_LABEL[result]}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
