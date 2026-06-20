'use client';

import { clsx } from 'clsx';

export interface GameweekScore {
  gameweek: number;
  label: string;
  opponent: string;
  points: number;
  goals: number;
  assists: number;
  minutesPlayed: number;
  rating: number;
}

interface PlayerGameweekTableProps {
  rows: GameweekScore[];
}

export function PlayerGameweekTable({ rows }: PlayerGameweekTableProps) {
  if (rows.length === 0) {
    return (
      <div className="py-8 text-center text-exp-muted text-body-md">
        No gameweek data available.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-1">
      <table
        className="w-full text-body-sm border-collapse"
        aria-label="Player gameweek history"
      >
        <thead>
          <tr className="border-b border-exp-border-dk">
            <th className="py-2 px-3 text-left text-label-sm text-exp-muted font-bold">GW</th>
            <th className="py-2 px-3 text-left text-label-sm text-exp-muted font-bold">vs</th>
            <th className="py-2 px-3 text-center text-label-sm text-exp-muted font-bold">G</th>
            <th className="py-2 px-3 text-center text-label-sm text-exp-muted font-bold">A</th>
            <th className="py-2 px-3 text-center text-label-sm text-exp-muted font-bold">Min</th>
            <th className="py-2 px-3 text-center text-label-sm text-exp-muted font-bold">Rtg</th>
            <th className="py-2 px-3 text-right text-label-sm text-exp-muted font-bold">Pts</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.gameweek}
              className={clsx(
                'border-b border-exp-border-dk transition-colors',
                i % 2 === 0 ? 'bg-transparent' : 'bg-exp-ink/40',
              )}
            >
              <td className="py-2.5 px-3 text-exp-muted tabular-nums">{row.label}</td>
              <td className="py-2.5 px-3 text-white font-medium">{row.opponent}</td>
              <td className="py-2.5 px-3 text-center text-white tabular-nums">{row.goals}</td>
              <td className="py-2.5 px-3 text-center text-white tabular-nums">{row.assists}</td>
              <td className="py-2.5 px-3 text-center text-exp-muted tabular-nums">{row.minutesPlayed}</td>
              <td className="py-2.5 px-3 text-center tabular-nums">
                <span
                  className={clsx(
                    'font-semibold',
                    row.rating >= 7.5
                      ? 'text-exp-green'
                      : row.rating >= 6.0
                      ? 'text-white'
                      : 'text-exp-live',
                  )}
                >
                  {row.rating.toFixed(1)}
                </span>
              </td>
              <td className="py-2.5 px-3 text-right">
                <span
                  className={clsx(
                    'font-black tabular-nums',
                    row.points >= 10
                      ? 'text-exp-gold'
                      : row.points >= 6
                      ? 'text-white'
                      : 'text-exp-muted',
                  )}
                >
                  {row.points}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Mock gameweek rows for DESIGN_REVIEW_DATA ──────────────────── */
export const MOCK_GAMEWEEK_ROWS: GameweekScore[] = [
  { gameweek: 1, label: 'MD 1', opponent: 'vs Brazil',   points: 18, goals: 2, assists: 1, minutesPlayed: 90, rating: 9.2 },
  { gameweek: 2, label: 'MD 2', opponent: 'vs Germany',  points: 14, goals: 1, assists: 1, minutesPlayed: 78, rating: 8.4 },
  { gameweek: 3, label: 'MD 3', opponent: 'vs Portugal', points: 11, goals: 1, assists: 0, minutesPlayed: 90, rating: 7.8 },
];
