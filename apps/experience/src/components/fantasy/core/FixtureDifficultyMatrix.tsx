'use client';

import { FixtureDifficultyCell } from './FixtureDifficultyCell';
import type { ExpFDREntry } from '@/lib/data';

interface FixtureDifficultyMatrixProps {
  data: ExpFDREntry[];
  gameweekLabels?: string[];
}

const LEGEND: Array<{ label: string; bg: string; text: string }> = [
  { label: '1 — Very Easy', bg: 'bg-green-600', text: 'text-white' },
  { label: '2 — Easy',      bg: 'bg-green-400', text: 'text-white' },
  { label: '3 — Medium',    bg: 'bg-amber-400', text: 'text-white' },
  { label: '4 — Hard',      bg: 'bg-orange-500', text: 'text-white' },
  { label: '5 — Very Hard', bg: 'bg-red-600',   text: 'text-white' },
];

export function FixtureDifficultyMatrix({
  data,
  gameweekLabels,
}: FixtureDifficultyMatrixProps) {
  const gwCount = data[0]?.fixtures.length ?? 6;
  const gwLabels = gameweekLabels ?? Array.from({ length: gwCount }, (_, i) => `GW${i + 1}`);

  return (
    <div className="space-y-4">
      {/* Missing API notice */}
      <div className="bg-purple-900/40 border border-purple-600/40 rounded-card-xs px-4 py-3">
        <p className="text-label-md text-purple-300 font-semibold">⚠️ Backend API not yet available</p>
        <p className="text-label-sm text-purple-400 mt-1">
          The FDR endpoint is pending backend implementation. This view uses design review mock data only.
        </p>
      </div>

      {/* Matrix table */}
      <div className="overflow-x-auto rounded-card border border-exp-border-dk">
        <table className="w-full border-collapse text-sm" aria-label="Fixture Difficulty Rating matrix">
          <thead>
            <tr className="bg-exp-navy">
              <th className="text-left px-3 py-2.5 text-label-md text-exp-muted uppercase tracking-widest w-24">
                Team
              </th>
              {gwLabels.map(gw => (
                <th key={gw} className="px-1 py-2.5 text-center text-label-md text-exp-muted uppercase tracking-widest">
                  {gw}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((entry, rowIdx) => (
              <tr key={entry.club.abbr} className={rowIdx % 2 === 0 ? 'bg-exp-ink' : 'bg-exp-navy'}>
                <td className="px-3 py-2 text-label-md text-white font-semibold whitespace-nowrap">
                  {entry.club.abbr}
                </td>
                {entry.fixtures.map((fx, fxIdx) => (
                  <FixtureDifficultyCell
                    key={fxIdx}
                    opponent={fx.opponentAbbr}
                    difficulty={fx.difficulty}
                    isHome={fx.isHome}
                  />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div>
        <p className="text-label-sm text-exp-muted mb-2 uppercase tracking-widest">Difficulty legend</p>
        <div className="flex flex-wrap gap-2">
          {LEGEND.map(l => (
            <span key={l.label} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-pill text-label-sm ${l.bg} ${l.text}`}>
              {l.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
