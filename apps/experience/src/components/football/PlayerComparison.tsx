'use client';

import Image from 'next/image';
import { clsx } from 'clsx';
import type { ExpPlayer } from '@/lib/data';
import { expImg } from '@/lib/data';
import { ComparisonMetric } from './ComparisonMetric';

interface PlayerComparisonProps {
  playerA: ExpPlayer;
  playerB: ExpPlayer;
}

const POSITION_LABEL: Record<ExpPlayer['position'], string> = {
  GK:  'Goalkeeper',
  DEF: 'Defender',
  MID: 'Midfielder',
  FWD: 'Forward',
};

function PlayerCard({
  player,
  side,
}: {
  player: ExpPlayer;
  side: 'A' | 'B';
}) {
  return (
    <div
      className={clsx(
        'flex flex-col items-center gap-2',
        side === 'A' ? 'text-left' : 'text-right',
      )}
    >
      <div className="relative w-20 h-20 rounded-card-sm overflow-hidden border-2 border-exp-border-dk">
        <Image
          src={expImg(player.imageKey, 160, 160)}
          alt={player.name}
          fill
          className="object-cover object-top"
          sizes="80px"
        />
      </div>
      <div className="text-center">
        <div className="text-body-md font-black text-white">{player.name}</div>
        <div className="text-label-sm text-exp-muted">
          {player.club.abbr} · {POSITION_LABEL[player.position]}
        </div>
      </div>
    </div>
  );
}

export function PlayerComparison({ playerA, playerB }: PlayerComparisonProps) {
  const metrics: Array<{ label: string; valA: number | string; valB: number | string }> = [
    { label: 'Goals',        valA: playerA.goalsThisTournament,   valB: playerB.goalsThisTournament   },
    { label: 'Assists',      valA: playerA.assistsThisTournament, valB: playerB.assistsThisTournament },
    { label: 'Fantasy Pts',  valA: playerA.fantasyPoints,         valB: playerB.fantasyPoints         },
    { label: 'Price (£m)',   valA: playerA.fantasyPrice,          valB: playerB.fantasyPrice          },
  ];

  return (
    <div
      className="bg-exp-navy rounded-card border border-exp-border-dk overflow-hidden"
      aria-label={`Compare ${playerA.name} vs ${playerB.name}`}
    >
      {/* Players header */}
      <div className="flex items-end justify-between gap-4 p-5 bg-exp-ink/50 border-b border-exp-border-dk">
        <PlayerCard player={playerA} side="A" />
        <div className="text-label-md text-exp-muted font-black">VS</div>
        <PlayerCard player={playerB} side="B" />
      </div>

      {/* Metrics */}
      <div className="p-5 space-y-4">
        {metrics.map((m, i) => (
          <ComparisonMetric
            key={m.label}
            label={m.label}
            valueA={m.valA}
            valueB={m.valB}
            isNumeric={typeof m.valA === 'number'}
            index={i}
          />
        ))}
      </div>

      {/* Notice */}
      <div className="px-5 pb-4 text-label-sm text-exp-muted text-center">
        Points only · no real money · no financial value
      </div>
    </div>
  );
}
