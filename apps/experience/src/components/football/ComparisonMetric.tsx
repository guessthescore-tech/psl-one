'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { clsx } from 'clsx';

interface ComparisonMetricProps {
  label: string;
  valueA: number | string;
  valueB: number | string;
  /** If numeric, the bar will reflect relative proportion */
  isNumeric?: boolean;
  index?: number;
}

export function ComparisonMetric({
  label,
  valueA,
  valueB,
  isNumeric = true,
  index = 0,
}: ComparisonMetricProps) {
  const reduce = useReducedMotion();

  const numA = typeof valueA === 'number' ? valueA : parseFloat(String(valueA)) || 0;
  const numB = typeof valueB === 'number' ? valueB : parseFloat(String(valueB)) || 0;
  const total = numA + numB || 1;
  const widthA = isNumeric ? Math.round((numA / total) * 100) : 50;
  const widthB = 100 - widthA;

  const aWins = isNumeric && numA > numB;
  const bWins = isNumeric && numB > numA;

  return (
    <div className="space-y-1.5">
      {/* Values row */}
      <div className="flex items-center justify-between">
        <span
          className={clsx(
            'text-body-sm font-bold tabular-nums',
            aWins ? 'text-exp-gold' : 'text-white',
          )}
        >
          {typeof valueA === 'number' ? valueA : valueA}
        </span>
        <span className="text-label-sm text-exp-muted uppercase tracking-wide text-center flex-1 px-3">
          {label}
        </span>
        <span
          className={clsx(
            'text-body-sm font-bold tabular-nums',
            bWins ? 'text-exp-gold' : 'text-white',
          )}
        >
          {typeof valueB === 'number' ? valueB : valueB}
        </span>
      </div>

      {/* Bar */}
      {isNumeric && (
        <div className="flex h-1 rounded-full overflow-hidden bg-exp-ink">
          <motion.div
            initial={reduce ? false : { width: 0 }}
            animate={{ width: `${widthA}%` }}
            transition={{ duration: 0.5, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
            className={clsx('rounded-full', aWins ? 'bg-exp-gold' : 'bg-exp-navy-2')}
            aria-hidden
          />
          <motion.div
            initial={reduce ? false : { width: 0 }}
            animate={{ width: `${widthB}%` }}
            transition={{ duration: 0.5, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
            className={clsx('rounded-full', bWins ? 'bg-exp-gold' : 'bg-exp-muted/30')}
            aria-hidden
          />
        </div>
      )}
    </div>
  );
}
