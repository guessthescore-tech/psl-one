'use client';

import Link from 'next/link';
import { type VisionPlayer, visionImg } from '@/lib/vision-data';

interface TopPerformersProps {
  players: VisionPlayer[];
  label?: string;
}

export function TopPerformers({ players, label = 'Top Performers' }: TopPerformersProps) {
  const sorted = [...players].sort((a, b) => b.fantasyPoints - a.fantasyPoints);

  return (
    <section className="bg-white rounded-card border border-[#e8eaf0] shadow-card overflow-hidden" aria-label={label}>
      <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-[#f0f2f8]">
        <h2 className="text-sm font-black text-psl-navy">{label}</h2>
        <Link href="/leaderboards" className="text-xs font-semibold text-psl-gold hover:underline focus-visible:outline-none">
          Leaderboard
        </Link>
      </div>

      <ul className="divide-y divide-[#f5f7fb]">
        {sorted.map((player, i) => (
          <li key={player.id} className="flex items-center gap-4 px-5 py-3">
            {/* Rank */}
            <span className={`text-sm font-black w-5 text-center flex-shrink-0 ${i === 0 ? 'text-psl-gold' : 'text-psl-muted'}`}>
              {i + 1}
            </span>

            {/* Avatar */}
            <div
              className="w-8 h-8 rounded-full bg-psl-surface flex-shrink-0 overflow-hidden border border-[#e8eaf0]"
              aria-hidden
            >
              <img
                src={visionImg(player.imageKey, 64, 64)}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>

            {/* Name + club */}
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-psl-navy truncate">{player.name}</div>
              <div className="text-[10px] text-psl-muted">{player.club.shortName} · {player.position}</div>
            </div>

            {/* Stats */}
            <div className="text-right flex-shrink-0">
              <div className="text-sm font-black text-psl-navy tabular-nums">{player.fantasyPoints}</div>
              <div className="text-[10px] text-psl-muted">pts</div>
            </div>

            {/* Pick link */}
            <Link
              href="/vision/fantasy"
              className="text-[10px] font-bold text-psl-gold hover:underline focus-visible:outline-none flex-shrink-0"
              aria-label={`Pick ${player.name} for fantasy`}
            >
              Pick
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
