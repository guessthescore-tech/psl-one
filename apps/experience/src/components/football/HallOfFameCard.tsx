'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { expImg } from '@/lib/data';

export interface HallOfFameEntry {
  id: string;
  name: string;
  nationality: string;
  yearsActive: string;
  achievement: string;
  imageKey: string;
}

interface HallOfFameCardProps {
  entry: HallOfFameEntry;
  index?: number;
}

export function HallOfFameCard({ entry, index = 0 }: HallOfFameCardProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="relative bg-exp-navy rounded-card border border-exp-gold/20 overflow-hidden shadow-glow-gold"
      aria-label={`Hall of fame: ${entry.name}`}
    >
      {/* Portrait */}
      <div className="relative h-48 w-full">
        <Image
          src={expImg(entry.imageKey, 400, 300)}
          alt={entry.name}
          fill
          className="object-cover object-top"
          sizes="(max-width: 640px) 100vw, 320px"
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-exp-navy via-exp-navy/40 to-transparent"
          aria-hidden
        />
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="text-label-sm text-exp-gold uppercase tracking-wider font-bold mb-1">
          Hall of Fame
        </div>
        <div className="text-display-sm text-white font-black">{entry.name}</div>
        <div className="text-body-sm text-exp-muted mt-0.5">
          {entry.nationality} · {entry.yearsActive}
        </div>
        <p className="text-body-sm text-exp-muted/80 mt-2 line-clamp-3">{entry.achievement}</p>
      </div>
    </motion.div>
  );
}
