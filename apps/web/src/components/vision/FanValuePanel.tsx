'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { type VisionFanValue } from '@/lib/vision-data';

interface FanValuePanelProps {
  fanValue: VisionFanValue;
}

const BREAKDOWN_LABELS: Record<string, string> = {
  predictions: 'Predictions',
  fantasy: 'Fantasy',
  social: 'Social',
  attendance: 'Attendance',
};

const BREAKDOWN_COLORS: Record<string, string> = {
  predictions: '#1b3a6b',
  fantasy: '#00843d',
  social: '#ffd700',
  attendance: '#e63946',
};

export function FanValuePanel({ fanValue }: FanValuePanelProps) {
  const reduce = useReducedMotion();

  const breakdownEntries = Object.entries(fanValue.breakdown) as [string, number][];
  const maxValue = Math.max(...breakdownEntries.map(([, v]) => v));

  return (
    <section className="bg-white rounded-card border border-[#e8eaf0] shadow-card overflow-hidden" aria-label="Fan value panel">
      <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-[#f0f2f8]">
        <h2 className="text-sm font-black text-psl-navy">Fan Value</h2>
        <Link href="/fan-value" className="text-xs font-semibold text-psl-gold hover:underline focus-visible:outline-none">
          Full breakdown
        </Link>
      </div>

      <div className="p-5">
        {/* Total + level */}
        <div className="flex items-end justify-between mb-5">
          <div>
            <div className="text-stat-lg font-black text-psl-navy tabular-nums">{fanValue.total.toLocaleString()}</div>
            <div className="text-xs text-psl-muted mt-0.5">Total points</div>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center gap-1.5 bg-psl-gold/15 text-psl-navy text-[10px] font-bold px-2.5 py-1 rounded-pill">
              {fanValue.level}
            </div>
            <div className="text-[10px] text-psl-muted mt-1">Rank #{fanValue.rank.toLocaleString()}</div>
          </div>
        </div>

        {/* Progress to next level */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-psl-muted">{fanValue.level}</span>
            <span className="text-[10px] text-psl-muted">{fanValue.nextLevel}</span>
          </div>
          <div className="h-1.5 bg-psl-surface rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-psl-gold rounded-full"
              initial={{ width: 0 }}
              whileInView={{ width: `${fanValue.progressPercent}%` }}
              viewport={{ once: true }}
              transition={reduce ? { duration: 0 } : { duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              aria-label={`${fanValue.progressPercent}% to next level`}
            />
          </div>
          <div className="text-[10px] text-psl-muted text-right mt-1">{fanValue.progressPercent}%</div>
        </div>

        {/* Category breakdown */}
        <div className="space-y-2.5">
          {breakdownEntries.map(([key, value]) => {
            const pct = Math.round((value / maxValue) * 100);
            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-semibold text-psl-navy">{BREAKDOWN_LABELS[key] ?? key}</span>
                  <span className="text-[10px] font-bold text-psl-navy tabular-nums">{value.toLocaleString()}</span>
                </div>
                <div className="h-1 bg-psl-surface rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: BREAKDOWN_COLORS[key] ?? '#1b3a6b' }}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${pct}%` }}
                    viewport={{ once: true }}
                    transition={reduce ? { duration: 0 } : { duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-[10px] text-psl-muted mt-5 leading-relaxed">
          Fan Value is a non-financial engagement score. Points cannot be exchanged for money or prizes.
        </p>
      </div>
    </section>
  );
}
