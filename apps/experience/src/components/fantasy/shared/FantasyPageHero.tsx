'use client';

import { motion, useReducedMotion } from 'framer-motion';

interface StatEntry {
  label: string;
  value: string | number;
}

interface FantasyPageHeroProps {
  title: string;
  subtitle?: string;
  badge?: string;
  stats?: StatEntry[];
}

export function FantasyPageHero({ title, subtitle, badge, stats }: FantasyPageHeroProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className="px-4 pt-6 pb-5 bg-navy-gradient"
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      {badge && (
        <span className="inline-block text-label-sm text-exp-gold bg-exp-gold/10 border border-exp-gold/30 rounded-pill px-3 py-1 mb-3">
          {badge}
        </span>
      )}
      <h1 className="text-display-lg text-white mb-1">{title}</h1>
      {subtitle && <p className="text-body-md text-exp-muted">{subtitle}</p>}
      {stats && stats.length > 0 && (
        <div className="flex gap-6 mt-4">
          {stats.map((stat, i) => (
            <div key={i}>
              <p className="text-stat-md text-exp-gold font-mono">{stat.value}</p>
              <p className="text-label-sm text-exp-muted uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
