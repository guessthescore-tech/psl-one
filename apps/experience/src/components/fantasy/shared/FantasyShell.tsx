'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft } from '@phosphor-icons/react';
import { getDataMode } from '@/lib/data';

interface FantasyShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  back?: { href: string; label: string };
}

function DesignReviewBanner() {
  const mode = getDataMode();
  if (mode !== 'DESIGN_REVIEW_DATA') return null;
  return (
    <div className="bg-exp-gold/10 border-b border-exp-gold/30 px-4 py-2 text-center">
      <span className="text-label-sm text-exp-gold uppercase tracking-widest">
        Design Review — Mock Data
      </span>
    </div>
  );
}

export function FantasyShell({ children, title, subtitle, back }: FantasyShellProps) {
  return (
    <div className="min-h-[100dvh] bg-exp-void">
      <DesignReviewBanner />
      {(back || title) && (
        <div className="bg-exp-navy border-b border-exp-border-dk px-4 py-4">
          {back && (
            <Link
              href={back.href}
              className="inline-flex items-center gap-2 text-exp-muted hover:text-white transition-colors mb-3 text-body-sm focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2"
            >
              <ArrowLeft weight="bold" size={16} />
              {back.label}
            </Link>
          )}
          {title && (
            <h1 className="text-display-sm text-white">{title}</h1>
          )}
          {subtitle && (
            <p className="text-body-sm text-exp-muted mt-1">{subtitle}</p>
          )}
        </div>
      )}
      <div className="max-w-2xl mx-auto">
        {children}
      </div>
    </div>
  );
}
