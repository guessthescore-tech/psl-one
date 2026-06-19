'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { clsx } from 'clsx';
import { expImg } from '@/lib/data';
import type { ExpPlayer } from '@/lib/data';

export interface MotmData {
  player: ExpPlayer;
  matchContext: string;
  rating: number;
  goals: number;
  assists: number;
  touches: number;
  passAccuracy: number;
}

interface ManOfTheMatchCardProps {
  data: MotmData;
}

export function ManOfTheMatchCard({ data }: ManOfTheMatchCardProps) {
  const reduce = useReducedMotion();
  const { player, matchContext, rating, goals, assists, touches, passAccuracy } = data;

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="bg-exp-navy rounded-card border border-exp-gold/30 overflow-hidden shadow-glow-gold"
      aria-label={`Man of the Match: ${player.name}`}
    >
      {/* Gold accent */}
      <div className="h-1.5 bg-gold-gradient" aria-hidden />

      {/* Hero section */}
      <div className="relative">
        <div className="relative h-72 w-full overflow-hidden">
          <Image
            src={expImg(player.imageKey, 600, 450)}
            alt={player.name}
            fill
            className="object-cover object-top"
            sizes="(max-width: 640px) 100vw, 600px"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-exp-navy via-exp-navy/30 to-transparent"
            aria-hidden
          />
        </div>

        {/* Rating badge */}
        <div className="absolute top-4 right-4 bg-exp-gold text-exp-void rounded-card-sm px-3 py-1.5 shadow-glow-gold">
          <div className="text-stat-xl font-black leading-none">{rating.toFixed(1)}</div>
          <div className="text-label-sm font-bold text-center">/ 10</div>
        </div>

        {/* MOTM badge */}
        <div className="absolute top-4 left-4 bg-exp-ink/90 border border-exp-gold/40 rounded-pill px-3 py-1 flex items-center gap-2">
          <span className="text-exp-gold text-lg" aria-hidden>⭐</span>
          <span className="text-label-md text-exp-gold font-black uppercase tracking-wider">Man of the Match</span>
        </div>
      </div>

      {/* Player info */}
      <div className="px-6 py-4 border-b border-exp-border-dk">
        <div className="text-display-md text-white font-black">{player.name}</div>
        <div className="text-body-md text-exp-muted mt-0.5">
          {player.club.name} · {matchContext}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-4 divide-x divide-exp-border-dk" role="list" aria-label="Performance stats">
        {[
          { label: 'Goals',    value: goals           },
          { label: 'Assists',  value: assists          },
          { label: 'Touches',  value: touches          },
          { label: 'Pass %',   value: `${passAccuracy}%` },
        ].map((stat) => (
          <div
            key={stat.label}
            role="listitem"
            className="py-4 px-3 text-center"
          >
            <div className="text-stat-md font-black text-exp-gold">{stat.value}</div>
            <div className="text-label-sm text-exp-muted mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Share CTA */}
      <div className="px-6 py-4">
        <button
          type="button"
          className={clsx(
            'w-full py-3 rounded-card-sm text-label-lg font-black text-exp-void bg-exp-gold',
            'hover:bg-exp-gold-2 transition-colors min-h-[44px]',
            'focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2',
          )}
          aria-label={`Share ${player.name} as Man of the Match`}
          onClick={() => {/* sharing not implemented in DESIGN_REVIEW_DATA */}}
        >
          Share MOTM
        </button>
        <p className="text-label-sm text-exp-muted text-center mt-2">
          Points only · no real money · no financial value
        </p>
      </div>
    </motion.div>
  );
}
