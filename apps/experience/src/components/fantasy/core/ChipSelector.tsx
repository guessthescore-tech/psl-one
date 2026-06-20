'use client';

import { ChipCard } from './ChipCard';
import type { ExpChip } from '@/lib/data';
import type { ChipType } from '@/lib/fantasy-api';

interface ChipSelectorProps {
  chips: ExpChip[];
  onActivate?: (type: ChipType) => void;
  onCancel?: (type: ChipType) => void;
  isDeadlineLocked?: boolean;
}

export function ChipSelector({ chips, onActivate, onCancel, isDeadlineLocked }: ChipSelectorProps) {
  return (
    <div className="grid gap-3">
      {chips.map(chip => (
        <ChipCard
          key={chip.type}
          chip={chip}
          onActivate={onActivate}
          onCancel={onCancel}
          isDeadlineLocked={isDeadlineLocked}
        />
      ))}
    </div>
  );
}
