'use client';

import { motion, useReducedMotion } from 'framer-motion';

interface StatItem {
  label: string;
  value: string;
}

interface FantasyPageHeroProps {
  title: string;
  subtitle?: string;
  badge?: string;
  stats?: StatItem[];
}

export function FantasyPageHero({ title, subtitle, badge, stats }: FantasyPageHeroProps) {
  const reduce = useReducedMotion();

  return (
    <div className="bg-navy-gradient px-4 py-8 border-b border-exp-border-dk">
      {badge && (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="inline-flex mb-3"
        >
          <span className="text-label-md text-exp-gold bg-exp-gold/10 border border-exp-gold/30 rounded-pill px-3 py-1 uppercase tracking-widest">
            {badge}
          </span>
        </motion.div>
      )}
      <motion.h1
        className="text-display-lg text-white mb-1"
        initial={reduce ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        {title}
      </motion.h1>
      {subtitle && (
        <motion.p
          className="text-body-md text-exp-muted"
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        >
          {subtitle}
        </motion.p>
      )}
      {stats && stats.length > 0 && (
        <motion.div
          className="flex gap-6 mt-5"
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
        >
          {stats.map((stat) => (
            <div key={stat.label}>
              <div className="text-stat-md text-exp-gold font-black">{stat.value}</div>
              <div className="text-label-sm text-exp-muted uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
