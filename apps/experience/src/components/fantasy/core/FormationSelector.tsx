'use client';

import { motion, useReducedMotion } from 'framer-motion';

const FORMATIONS = ['4-3-3', '4-4-2', '4-5-1', '3-4-3', '3-5-2', '5-3-2', '5-4-1'] as const;
export type Formation = typeof FORMATIONS[number];

interface FormationSelectorProps {
  value: Formation | string;
  onChange: (formation: string) => void;
}

export function FormationSelector({ value, onChange }: FormationSelectorProps) {
  const reduce = useReducedMotion();

  return (
    <div className="space-y-2">
      <p className="text-label-md text-exp-muted mb-3">Select Formation</p>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {FORMATIONS.map(f => {
          const isActive = f === value;
          return (
            <motion.button
              key={f}
              type="button"
              onClick={() => onChange(f)}
              aria-pressed={isActive}
              className={`min-h-[44px] px-3 py-2.5 rounded-card-xs text-label-md font-mono border transition-colors focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2 ${
                isActive
                  ? 'bg-exp-green text-white border-exp-green shadow-glow-green'
                  : 'bg-exp-navy text-exp-muted border-exp-border-dk hover:text-white hover:border-exp-gold/40'
              }`}
              whileHover={reduce ? undefined : { scale: 1.02 }}
              whileTap={reduce ? undefined : { scale: 0.97 }}
            >
              {f}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
