'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { type VisionClub } from '@/lib/vision-data';

interface ClubIdentityRailProps {
  clubs: VisionClub[];
}

function ClubBadge({ club, index }: { club: VisionClub; index: number }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.3, delay: index * 0.03, ease: [0.16, 1, 0.3, 1] }}
      style={{ scrollSnapAlign: 'start' }}
    >
      <Link
        href="/vision/clubs"
        className="flex flex-col items-center gap-2 group focus-visible:outline-none"
        aria-label={club.name}
      >
        {/* Club crest placeholder */}
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xs font-black shadow-card motion-safe:group-hover:scale-110 motion-safe:transition-transform flex-shrink-0"
          style={{ backgroundColor: club.primaryColor, color: club.accentColor }}
          aria-hidden
        >
          {club.abbr.slice(0, 2)}
        </div>
        <span className="text-[10px] font-semibold text-psl-navy text-center leading-tight max-w-[56px] truncate">
          {club.shortName}
        </span>
      </Link>
    </motion.div>
  );
}

export function ClubIdentityRail({ clubs }: ClubIdentityRailProps) {
  return (
    <section className="py-8 bg-white" aria-label="PSL clubs">
      <div className="px-6 flex items-center justify-between mb-5">
        <h2 className="text-display-sm text-psl-navy">All Clubs</h2>
        <Link href="/vision/clubs" className="text-xs font-semibold text-psl-gold hover:underline focus-visible:outline-none">
          Club hub
        </Link>
      </div>
      <div
        className="flex gap-5 overflow-x-auto px-6 pb-4"
        style={{ scrollbarWidth: 'none', scrollSnapType: 'x mandatory' }}
        role="list"
      >
        {clubs.map((club, i) => (
          <div key={club.id} role="listitem">
            <ClubBadge club={club} index={i} />
          </div>
        ))}
      </div>
    </section>
  );
}
