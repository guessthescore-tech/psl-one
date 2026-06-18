'use client';

import Link from 'next/link';
import { type VisionGameweek, type VisionPlayer, visionImg } from '@/lib/vision-data';

interface FantasyGameweekPanelProps {
  gameweek: VisionGameweek;
  captain?: VisionPlayer;
  totalPoints?: number;
  transfersRemaining?: number;
}

export function FantasyGameweekPanel({
  gameweek,
  captain,
  totalPoints = 312,
  transfersRemaining = 1,
}: FantasyGameweekPanelProps) {
  return (
    <section className="bg-psl-midnight rounded-card text-white overflow-hidden shadow-card-xl" aria-label="Fantasy gameweek panel">
      {/* Header band */}
      <div className="bg-psl-navy px-5 py-3 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-psl-gold">{gameweek.label}</p>
          <p className="text-xs text-white/50 mt-0.5">{gameweek.status === 'ACTIVE' ? 'In progress' : 'Completed'}</p>
        </div>
        <Link
          href="/vision/fantasy"
          className="text-xs font-bold text-psl-gold hover:underline focus-visible:outline-none"
        >
          Manage squad
        </Link>
      </div>

      <div className="p-5">
        {/* Points + rank */}
        <div className="flex items-end gap-6 mb-5">
          <div>
            <div className="text-stat-xl font-black text-psl-gold tabular-nums">{totalPoints}</div>
            <div className="text-xs text-white/50 mt-1">Total points</div>
          </div>
          <div className="pb-1">
            <div className="text-stat-md font-black text-white tabular-nums">{gameweek.highestPoints}</div>
            <div className="text-xs text-white/50 mt-0.5">GW high</div>
          </div>
          <div className="pb-1">
            <div className="text-stat-md font-black text-white tabular-nums">{gameweek.averagePoints}</div>
            <div className="text-xs text-white/50 mt-0.5">GW avg</div>
          </div>
        </div>

        {/* Captain chip */}
        {captain && (
          <div className="rounded-card-sm bg-white/8 p-3 flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full overflow-hidden bg-white/10 flex-shrink-0">
              <img src={visionImg(captain.imageKey, 72, 72)} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white truncate">{captain.name}</div>
              <div className="text-[10px] text-white/40">{captain.club.shortName} · Captain</div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-sm font-black text-psl-gold tabular-nums">{captain.fantasyPoints}</div>
              <div className="text-[10px] text-white/40">pts</div>
            </div>
          </div>
        )}

        {/* Transfers */}
        <div className="flex items-center justify-between py-3 border-t border-white/10">
          <span className="text-xs text-white/60">Transfers remaining</span>
          <div className="flex gap-1">
            {Array.from({ length: 2 }).map((_, i) => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full ${i < transfersRemaining ? 'bg-psl-green' : 'bg-white/20'}`}
                aria-hidden
              />
            ))}
            <span className="text-xs font-bold text-white ml-2">{transfersRemaining}</span>
          </div>
        </div>

        {/* Non-financial notice */}
        <p className="text-[10px] text-white/30 mt-3 text-center">
          Points only · no real money · No financial value
        </p>
      </div>
    </section>
  );
}
