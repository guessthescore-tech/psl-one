'use client';

import Link from 'next/link';
import { ArrowRight } from '@phosphor-icons/react/dist/ssr';

interface FantasySectionHeaderProps {
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
}

export function FantasySectionHeader({
  title,
  subtitle,
  href,
  linkLabel = 'View all',
}: FantasySectionHeaderProps) {
  return (
    <div className="flex items-end justify-between mb-5">
      <div>
        <h2 className="text-display-sm font-display font-black text-exp-gold">{title}</h2>
        {subtitle && (
          <p className="text-body-sm mt-0.5 text-white/60">{subtitle}</p>
        )}
      </div>

      {href && (
        <Link
          href={href}
          className="flex items-center gap-1 text-body-sm font-semibold text-exp-gold hover:text-exp-gold-2 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2 rounded-sm px-1 min-h-[44px] min-w-[44px] justify-end"
        >
          {linkLabel}
          <ArrowRight size={14} weight="bold" aria-hidden />
        </Link>
      )}
    </div>
  );
}
