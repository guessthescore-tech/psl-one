'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Lock, Globe, Users } from '@phosphor-icons/react';
import { clsx } from 'clsx';
import type { ExpLeague } from '@/lib/data';

interface LeagueCardProps {
  league: ExpLeague;
  index?: number;
}

const TYPE_CONFIG = {
  PRIVATE: { label: 'Private', icon: Lock,  color: 'text-exp-gold bg-exp-gold/10 border-exp-gold/30' },
  PUBLIC:  { label: 'Public',  icon: Users,  color: 'text-exp-green bg-exp-green/10 border-exp-green/30' },
  GLOBAL:  { label: 'Global',  icon: Globe,  color: 'text-blue-400 bg-blue-400/10 border-blue-400/30' },
};

export function LeagueCard({ league, index = 0 }: LeagueCardProps) {
  const reduce = useReducedMotion();
  const cfg = TYPE_CONFIG[league.type];
  const TypeIcon = cfg.icon;

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      whileHover={reduce ? {} : { scale: 1.01 }}
    >
      <Link
        href={`/fantasy/leagues/${league.id}`}
        className={clsx(
          'block rounded-card bg-exp-navy border border-exp-border-dk p-4',
          'transition-shadow hover:shadow-card-md focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2',
        )}
        aria-label={`${league.name} — Rank ${league.rank} of ${league.totalManagers.toLocaleString()}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Type badge */}
            <span className={clsx(
              'inline-flex items-center gap-1 text-label-sm rounded-pill px-2 py-0.5 border mb-2',
              cfg.color,
            )}>
              <TypeIcon size={10} weight="fill" />
              {cfg.label}
            </span>

            <h3 className="text-display-sm text-white truncate mb-1">{league.name}</h3>

            <div className="flex items-center gap-3 text-label-sm text-exp-muted">
              <span>{league.totalManagers.toLocaleString()} managers</span>
              <span>·</span>
              <span className="text-exp-gold font-black">
                Rank {league.rank.toLocaleString()}/{league.totalManagers.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <div className="text-stat-md text-white font-black">{league.myPoints.toLocaleString()}</div>
            <div className="text-label-sm text-exp-muted">pts</div>
            <ArrowRight size={16} className="text-exp-muted ml-auto mt-2" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
