'use client';

import { ChipCard } from './ChipCard';
import type { ExpChip, ChipType } from '@/lib/data';

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
