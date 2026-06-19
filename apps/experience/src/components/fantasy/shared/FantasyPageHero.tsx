'use client';

import { motion, useReducedMotion } from 'framer-motion';

type BadgeColor = 'gold' | 'green' | 'red';

interface FantasyPageHeroProps {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: BadgeColor;
  stat?: {
    label: string;
    value: string;
  };
}

const badgeColorMap: Record<BadgeColor, string> = {
  gold:  'bg-exp-gold/20 text-exp-gold border border-exp-gold/30',
  green: 'bg-exp-green/20 text-green-400 border border-exp-green/30',
  red:   'bg-exp-live/20 text-exp-live border border-exp-live/30',
};

export function FantasyPageHero({
  title,
  subtitle,
  badge,
  badgeColor = 'gold',
  stat,
}: FantasyPageHeroProps) {
  const reduce = useReducedMotion();

  return (
    <div className="relative bg-gradient-to-b from-exp-navy to-exp-void px-4 pt-6 pb-8 overflow-hidden">
      {/* Subtle grid texture */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, #fff 0px, #fff 1px, transparent 1px, transparent 40px)',
        }}
        aria-hidden="true"
      />

      <motion.div
        className="relative z-10 max-w-lg"
        initial={reduce ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        {badge && (
          <span
            className={`inline-flex items-center px-3 py-0.5 rounded-pill text-label-md uppercase mb-3 ${badgeColorMap[badgeColor]}`}
          >
            {badge}
          </span>
        )}

        <h1 className="font-display text-display-md text-white">{title}</h1>

        {subtitle && (
          <p className="text-body-md text-white/60 mt-1">{subtitle}</p>
        )}

        {stat && (
          <div className="mt-4 inline-flex flex-col">
            <span className="font-display text-stat-md text-exp-gold leading-none">
              {stat.value}
            </span>
            <span className="text-label-md text-white/50 mt-1 uppercase tracking-widest">
              {stat.label}
            </span>
          </div>
        )}
      </motion.div>
    </div>
  );
}
