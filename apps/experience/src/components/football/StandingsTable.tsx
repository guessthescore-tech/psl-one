'use client';

import { clsx } from 'clsx';
import type { ExpStanding } from '@/lib/data';

interface StandingsTableProps {
  standings: ExpStanding[];
  /** Number of teams highlighted in gold at the top (qualification spots) */
  qualificationSpots?: number;
  /** Number of teams highlighted in red at the bottom (elimination zone) */
  dangerZone?: number;
}

const FORM_COLOURS: Record<'W' | 'D' | 'L', string> = {
  W: 'bg-exp-green  text-white',
  D: 'bg-exp-muted  text-white',
  L: 'bg-exp-live   text-white',
};

export function StandingsTable({
  standings,
  qualificationSpots = 2,
  dangerZone = 0,
}: StandingsTableProps) {
  return (
    <div className="overflow-x-auto -mx-1" role="region" aria-label="League standings">
      <table className="w-full text-body-sm border-collapse" role="table">
        <thead>
          <tr className="border-b border-exp-border-dk">
            <th scope="col" className="py-2.5 px-3 text-left text-label-sm text-exp-muted font-bold w-8">#</th>
            <th scope="col" className="py-2.5 px-3 text-left text-label-sm text-exp-muted font-bold">Club</th>
            <th scope="col" className="py-2.5 px-3 text-center text-label-sm text-exp-muted font-bold">P</th>
            <th scope="col" className="py-2.5 px-3 text-center text-label-sm text-exp-muted font-bold">W</th>
            <th scope="col" className="py-2.5 px-3 text-center text-label-sm text-exp-muted font-bold">D</th>
            <th scope="col" className="py-2.5 px-3 text-center text-label-sm text-exp-muted font-bold">L</th>
            <th scope="col" className="py-2.5 px-3 text-center text-label-sm text-exp-muted font-bold hidden sm:table-cell">GD</th>
            <th scope="col" className="py-2.5 px-3 text-center text-label-sm text-exp-muted font-bold">Pts</th>
            <th scope="col" className="py-2.5 px-3 text-left text-label-sm text-exp-muted font-bold hidden md:table-cell">Form</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((row, i) => {
            const isQualification = row.position <= qualificationSpots;
            const isDanger =
              dangerZone > 0 && row.position > standings.length - dangerZone;

            return (
              <tr
                key={row.club.id}
                className={clsx(
                  'border-b border-exp-border-dk transition-colors hover:bg-exp-ink/40',
                  i % 2 === 1 && 'bg-exp-ink/20',
                )}
              >
                {/* Position */}
                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-1.5">
                    {/* Colour indicator */}
                    <div
                      className={clsx(
                        'w-0.5 h-4 rounded-full flex-shrink-0',
                        isQualification ? 'bg-exp-gold' : isDanger ? 'bg-exp-live' : 'bg-transparent',
                      )}
                      aria-hidden
                    />
                    <span
                      className={clsx(
                        'tabular-nums font-bold',
                        isQualification ? 'text-exp-gold' : isDanger ? 'text-exp-live' : 'text-exp-muted',
                      )}
                    >
                      {row.position}
                    </span>
                  </div>
                </td>

                {/* Club name */}
                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-2">
                    {/* Club colour swatch */}
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0 border border-white/10"
                      style={{ backgroundColor: row.club.primaryColor }}
                      aria-hidden
                    />
                    <span className="text-white font-semibold">{row.club.name}</span>
                    <span className="text-exp-muted text-label-sm hidden sm:inline">{row.club.abbr}</span>
                  </div>
                </td>

                <td className="py-2.5 px-3 text-center text-exp-muted tabular-nums">{row.played}</td>
                <td className="py-2.5 px-3 text-center text-white tabular-nums">{row.won}</td>
                <td className="py-2.5 px-3 text-center text-exp-muted tabular-nums">{row.drawn}</td>
                <td className="py-2.5 px-3 text-center text-exp-muted tabular-nums">{row.lost}</td>

                {/* GD */}
                <td className="py-2.5 px-3 text-center hidden sm:table-cell">
                  <span
                    className={clsx(
                      'tabular-nums',
                      row.goalDifference > 0
                        ? 'text-exp-green'
                        : row.goalDifference < 0
                        ? 'text-exp-live'
                        : 'text-exp-muted',
                    )}
                  >
                    {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                  </span>
                </td>

                {/* Pts */}
                <td className="py-2.5 px-3 text-center">
                  <span
                    className={clsx(
                      'font-black tabular-nums',
                      isQualification ? 'text-exp-gold' : 'text-white',
                    )}
                  >
                    {row.points}
                  </span>
                </td>

                {/* Form */}
                <td className="py-2.5 px-3 hidden md:table-cell">
                  <div className="flex items-center gap-0.5">
                    {row.form.map((result, fi) => (
                      <span
                        key={fi}
                        className={clsx(
                          'w-5 h-5 rounded-full flex items-center justify-center text-label-sm font-black',
                          FORM_COLOURS[result],
                        )}
                        aria-label={result === 'W' ? 'Win' : result === 'D' ? 'Draw' : 'Loss'}
                      >
                        {result}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 px-3 text-label-sm text-exp-muted">
        {qualificationSpots > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="w-0.5 h-3 rounded-full bg-exp-gold" aria-hidden />
            <span>Qualification</span>
          </div>
        )}
        {dangerZone > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="w-0.5 h-3 rounded-full bg-exp-live" aria-hidden />
            <span>Danger zone</span>
          </div>
        )}
      </div>
    </div>
  );
}
