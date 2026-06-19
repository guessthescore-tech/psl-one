'use client';

import Link from 'next/link';
import { ArrowRight } from '@phosphor-icons/react';

interface FantasySectionHeaderProps {
  title: string;
  subtitle?: string;
  viewAllHref?: string;
}

export function FantasySectionHeader({ title, subtitle, viewAllHref }: FantasySectionHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 pt-5 pb-3">
      <div>
        <h2 className="text-display-sm text-white">{title}</h2>
        {subtitle && (
          <p className="text-body-sm text-exp-muted mt-0.5">{subtitle}</p>
        )}
      </div>
      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="flex items-center gap-1 text-label-lg text-exp-gold uppercase tracking-wider mt-0.5 hover:opacity-80 transition-opacity focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2 flex-shrink-0"
        >
          View all
          <ArrowRight weight="bold" size={14} />
        </Link>
      )}
    </div>
  );
}
