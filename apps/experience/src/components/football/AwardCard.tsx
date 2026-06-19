'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { expImg } from '@/lib/data';

export interface Award {
  id: string;
  title: string;
  recipient: string;
  recipientImageKey: string;
  matchContext?: string;
  description: string;
  icon?: string;
}

interface AwardCardProps {
  award: Award;
  index?: number;
}

export function AwardCard({ award, index = 0 }: AwardCardProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="bg-exp-navy rounded-card border border-exp-border-dk overflow-hidden"
      aria-label={`${award.title}: ${award.recipient}`}
    >
      {/* Gold accent top bar */}
      <div className="h-1 bg-gold-gradient" aria-hidden />

      <div className="p-5">
        {/* Icon + title */}
        <div className="flex items-center gap-2 mb-4">
          {award.icon && (
            <span className="text-2xl" aria-hidden>{award.icon}</span>
          )}
          <div>
            <div className="text-label-sm text-exp-gold uppercase tracking-wider font-bold">
              {award.title}
            </div>
            {award.matchContext && (
              <div className="text-label-sm text-exp-muted">{award.matchContext}</div>
            )}
          </div>
        </div>

        {/* Recipient */}
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-card-sm overflow-hidden border border-exp-border-dk flex-shrink-0">
            <Image
              src={expImg(award.recipientImageKey, 128, 128)}
              alt={award.recipient}
              fill
              className="object-cover object-top"
              sizes="64px"
            />
          </div>
          <div>
            <div className="text-display-sm text-white font-black">{award.recipient}</div>
            <p className="text-body-sm text-exp-muted mt-1 line-clamp-2">{award.description}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
