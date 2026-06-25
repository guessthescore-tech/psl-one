'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { clsx } from 'clsx';

interface PslOneHeroProps {
  title: string;
  subtitle: string;
  tag?: string;
  ctaLabel: string;
  ctaHref: string;
  imageBg?: string;
}

const DEFAULT_BG = 'linear-gradient(135deg, #060d19 0%, #0d1b2e 50%, #1b3a6b 100%)';

export function PslOneHero({
  title,
  subtitle,
  tag,
  ctaLabel,
  ctaHref,
  imageBg = DEFAULT_BG,
}: PslOneHeroProps) {
  const reduce = useReducedMotion();

  return (
    <section
      className="relative w-full min-h-[40vh] sm:min-h-[60vh] flex items-center overflow-hidden"
      style={{ background: imageBg }}
      aria-label={`Hero: ${title}`}
    >
      {/* Grain overlay for texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'200\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.04\'/%3E%3C/svg%3E")',
        }}
        aria-hidden
      />

      {/* Gold accent line — left edge */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 bg-exp-gold"
        style={{ boxShadow: '0 0 24px rgba(230,170,0,0.6)' }}
        aria-hidden
      />

      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 py-16 sm:py-24">
        {tag && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="inline-block text-label-md text-exp-gold bg-exp-gold/10 border border-exp-gold/30 rounded-pill px-3 py-1 mb-5 uppercase tracking-widest">
              {tag}
            </span>
          </motion.div>
        )}

        <motion.h1
          className={clsx(
            'text-display-xl sm:text-display-2xl text-white mb-4',
            'max-w-3xl leading-none',
          )}
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        >
          {title}
        </motion.h1>

        <motion.p
          className="text-body-lg text-white/70 max-w-xl mb-8"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
        >
          {subtitle}
        </motion.p>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link
            href={ctaHref}
            className={clsx(
              'inline-flex items-center gap-2 px-6 py-3.5 rounded-pill',
              'bg-exp-gold text-exp-void font-bold text-body-md',
              'hover:bg-exp-gold-2 transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold focus-visible:ring-offset-2 focus-visible:ring-offset-exp-void',
              'min-h-[44px] shadow-glow-gold',
            )}
          >
            {ctaLabel}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
