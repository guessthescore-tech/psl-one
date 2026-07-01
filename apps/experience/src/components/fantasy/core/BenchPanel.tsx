'use client';

import { PlayerSlot } from './PlayerSlot';
import type { ExpFantasyPlayer } from '@/lib/data';

interface BenchPanelProps {
  players: (ExpFantasyPlayer | null)[];
  onPlayerClick?: (player: ExpFantasyPlayer | null, benchIndex: number) => void;
  selectedPlayerId?: string | null;
}

export function BenchPanel({ players, onPlayerClick, selectedPlayerId }: BenchPanelProps) {
  return (
    <div className="bg-exp-ink border-t border-exp-border-dk px-4 py-4">
      <p className="text-label-md text-exp-muted uppercase tracking-widest mb-3">Bench</p>
      <div className="flex justify-around">
        {Array.from({ length: 4 }).map((_, i) => {
          const player = players[i] ?? null;
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className="text-label-sm text-exp-muted">B{i + 1}</span>
              <PlayerSlot
                player={player}
                slotLabel={`Bench ${i + 1}`}
                isSelected={player ? player.id === selectedPlayerId : false}
                onClick={onPlayerClick ? () => onPlayerClick(player, i) : undefined}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
