'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const CHALLENGE_LINKS = [
  {
    href: '/social-challenges/incoming',
    label: 'Incoming Challenges',
    description: 'View challenges sent to you by other fans.',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 3.75H6.912a2.25 2.25 0 0 0-2.15 1.588L2.35 13.177a2.25 2.25 0 0 0-.1.661V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 0 0-2.15-1.588H15M2.25 13.5h3.86a2.25 2.25 0 0 1 2.012 1.244l.256.512a2.25 2.25 0 0 0 2.013 1.244h3.218a2.25 2.25 0 0 0 2.013-1.244l.256-.512a2.25 2.25 0 0 1 2.013-1.244h3.859M12 3v8.25m0 0-3-3m3 3 3-3" />
      </svg>
    ),
    accent: 'psl-navy',
  },
  {
    href: '/social-challenges/outgoing',
    label: 'Outgoing Challenges',
    description: 'View challenges you have sent to other fans.',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
      </svg>
    ),
    accent: 'psl-green',
  },
  {
    href: '/social-challenges/new',
    label: 'Send a Direct Challenge',
    description: 'Challenge a specific fan on an open listing.',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
      </svg>
    ),
    accent: 'psl-gold',
  },
  {
    href: '/social-predictions/marketplace',
    label: 'Public Marketplace',
    description: 'Browse all open prediction challenges.',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016 2.993 2.993 0 0 0 2.25-1.016 3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
      </svg>
    ),
    accent: 'psl-muted',
  },
];

export default function SocialChallengesPage() {
  return (
    <main className="min-h-screen bg-psl-surface">
      {/* Page header */}
      <div className="bg-white border-b border-[#e8eaf0]">
        <div className="max-w-2xl mx-auto px-4 py-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-psl-muted mb-1">Compete</p>
          <h1 className="text-display-sm text-psl-navy">Social Challenges</h1>
          <p className="text-xs text-psl-muted mt-0.5">
            Gameplay points only — cannot be exchanged for money or prizes.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 gap-3">
          {CHALLENGE_LINKS.map((item, i) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, delay: i * 0.05, ease: [0.32, 0.72, 0, 1] }}
            >
              <Link
                href={item.href}
                className="flex items-center gap-4 bg-white rounded-card border border-[#e8eaf0] p-4 shadow-card hover:shadow-card-md motion-safe:hover:-translate-y-0.5 motion-safe:transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-psl-navy focus-visible:ring-offset-1 min-h-[44px]"
              >
                <div className="w-10 h-10 flex-shrink-0 rounded-card-sm bg-psl-surface flex items-center justify-center text-psl-navy">
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-psl-navy">{item.label}</div>
                  <div className="text-xs text-psl-muted mt-0.5">{item.description}</div>
                </div>
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-psl-muted flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Non-financial notice */}
        <div className="mt-6 px-4 py-3 rounded-card-sm bg-psl-surface border border-[#e8eaf0] text-xs text-psl-muted">
          <span className="font-semibold text-psl-navy">Points-based only.</span>{' '}
          Social challenges use platform points — not money, betting credits, or any withdrawable balance.
          No stakes, no wagers, no payouts.
        </div>
      </div>
    </main>
  );
}
