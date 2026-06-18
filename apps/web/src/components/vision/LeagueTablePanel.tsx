'use client';

import Link from 'next/link';
import { type VisionStanding } from '@/lib/vision-data';

interface LeagueTablePanelProps {
  standings: VisionStanding[];
  maxRows?: number;
  highlightClubId?: string;
}

function FormDot({ result }: { result: 'W' | 'D' | 'L' }) {
  const cls = { W: 'bg-psl-green', D: 'bg-amber-400', L: 'bg-psl-red' }[result];
  const label = { W: 'Win', D: 'Draw', L: 'Loss' }[result];
  return <span className={`w-2 h-2 rounded-full ${cls} flex-shrink-0`} aria-label={label} />;
}

export function LeagueTablePanel({
  standings,
  maxRows = 6,
  highlightClubId,
}: LeagueTablePanelProps) {
  const rows = standings.slice(0, maxRows);

  return (
    <section className="bg-white rounded-card border border-[#e8eaf0] shadow-card overflow-hidden" aria-label="League table">
      <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-[#f0f2f8]">
        <h2 className="text-sm font-black text-psl-navy">Standings</h2>
        <Link href="/football" className="text-xs font-semibold text-psl-gold hover:underline focus-visible:outline-none">
          Full table
        </Link>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[2rem_1fr_2.5rem_2.5rem_2.5rem_3rem_auto] items-center gap-x-1 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-psl-muted border-b border-[#f0f2f8]">
        <span>#</span>
        <span>Club</span>
        <span className="text-right">P</span>
        <span className="text-right">GD</span>
        <span className="text-right">Pts</span>
        <span className="hidden sm:block text-right">Form</span>
        <span className="sr-only">Actions</span>
      </div>

      {/* Rows */}
      <ul className="divide-y divide-[#f5f7fb]">
        {rows.map((s) => {
          const isHighlighted = s.club.id === highlightClubId;
          const isChampionsZone = s.position <= 2;
          const isEuropaZone = s.position === 3;

          return (
            <li
              key={s.club.id}
              className={`grid grid-cols-[2rem_1fr_2.5rem_2.5rem_2.5rem_3rem_auto] items-center gap-x-1 px-4 py-2.5 ${
                isHighlighted ? 'bg-psl-gold/8' : ''
              }`}
            >
              {/* Position */}
              <div className="flex items-center gap-1.5">
                {isChampionsZone && <span className="w-0.5 h-4 rounded-full bg-psl-green flex-shrink-0" aria-hidden />}
                {isEuropaZone && <span className="w-0.5 h-4 rounded-full bg-psl-gold flex-shrink-0" aria-hidden />}
                {!isChampionsZone && !isEuropaZone && <span className="w-0.5 h-4 flex-shrink-0" aria-hidden />}
                <span className="text-xs font-bold text-psl-navy">{s.position}</span>
              </div>

              {/* Club name */}
              <span className="text-xs font-semibold text-psl-navy truncate">{s.club.shortName}</span>

              {/* Played */}
              <span className="text-xs text-psl-muted text-right tabular-nums">{s.played}</span>

              {/* GD */}
              <span className={`text-xs font-semibold text-right tabular-nums ${s.gd > 0 ? 'text-psl-green' : s.gd < 0 ? 'text-psl-red' : 'text-psl-muted'}`}>
                {s.gd > 0 ? '+' : ''}{s.gd}
              </span>

              {/* Points */}
              <span className="text-xs font-black text-psl-navy text-right tabular-nums">{s.points}</span>

              {/* Form */}
              <div className="hidden sm:flex items-center justify-end gap-0.5">
                {s.form.map((r, i) => <FormDot key={i} result={r} />)}
              </div>

              {/* Fantasy link */}
              <div className="flex justify-end">
                <Link
                  href="/vision/fantasy"
                  className="text-[10px] font-semibold text-psl-gold hover:underline focus-visible:outline-none whitespace-nowrap"
                  aria-label={`Fantasy picks for ${s.club.shortName}`}
                >
                  Pick
                </Link>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Legend */}
      <div className="px-5 py-3 border-t border-[#f0f2f8] flex items-center gap-4 text-[10px] text-psl-muted">
        <span className="flex items-center gap-1.5"><span className="w-0.5 h-3 rounded-full bg-psl-green" aria-hidden />Champions</span>
        <span className="flex items-center gap-1.5"><span className="w-0.5 h-3 rounded-full bg-psl-gold" aria-hidden />Promotion playoff</span>
      </div>
    </section>
  );
}
