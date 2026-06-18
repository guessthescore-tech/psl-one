'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { whatsappShareUrl, twitterShareUrl, copyToClipboard, predictionShareUrl } from '@/lib/share-utils';

interface SharePredictionSheetProps {
  open: boolean;
  onClose: () => void;
  fixtureId: string;
  homeScore: number;
  awayScore: number;
  homeTeam: string;
  awayTeam: string;
}

export function SharePredictionSheet({
  open,
  onClose,
  fixtureId,
  homeScore,
  awayScore,
  homeTeam,
  awayTeam,
}: SharePredictionSheetProps) {
  const reduce = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);
  const shareUrl = predictionShareUrl(fixtureId);
  const shareText = `I predicted ${homeTeam} ${homeScore}-${awayScore} ${awayTeam} on PSL One! Points only, no real money.`;

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); prev?.focus(); };
  }, [open, onClose]);

  const ACTIONS = [
    {
      label: 'WhatsApp',
      href: whatsappShareUrl(shareText, shareUrl),
      bg: '#25D366', text: 'white',
    },
    {
      label: 'X / Twitter',
      href: twitterShareUrl(shareText, shareUrl),
      bg: '#000000', text: 'white',
    },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50"
            onClick={onClose}
            aria-hidden
          />

          {/* Sheet */}
          <motion.div
            initial={reduce ? false : { y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-card shadow-card-xl"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            role="dialog"
            aria-modal="true"
            aria-label="Share prediction"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1" aria-hidden>
              <div className="w-10 h-1 rounded-full bg-gray-200" />
            </div>

            <div className="px-6 pb-6">
              {/* Header */}
              <div className="flex items-center justify-between py-4">
                <div>
                  <h2 className="text-sm font-black text-psl-navy">Share prediction</h2>
                  <p className="text-xs text-psl-muted mt-0.5">Points only · no real money</p>
                </div>
                <button
                  ref={closeRef}
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-psl-surface flex items-center justify-center hover:bg-gray-100 motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-psl-navy"
                  aria-label="Close share prediction"
                >
                  <svg className="w-4 h-4 text-psl-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Prediction preview */}
              <div className="bg-psl-surface rounded-card-sm p-4 mb-5 text-center">
                <p className="text-xs text-psl-muted mb-1">Your call</p>
                <p className="text-display-sm text-psl-navy font-black">
                  {homeTeam} <span className="text-psl-gold">{homeScore} - {awayScore}</span> {awayTeam}
                </p>
              </div>

              {/* Platform actions */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                {ACTIONS.map(a => (
                  <a
                    key={a.label}
                    href={a.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 text-xs font-bold py-3 rounded-card-sm min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
                    style={{ backgroundColor: a.bg, color: a.text }}
                    aria-label={`Share on ${a.label}`}
                  >
                    {a.label}
                  </a>
                ))}
              </div>

              {/* Copy link */}
              <button
                onClick={() => copyToClipboard(shareUrl)}
                className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-psl-navy bg-psl-surface border border-[#e8eaf0] py-3 rounded-card-sm min-h-[44px] hover:bg-gray-50 motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-psl-navy"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                </svg>
                Copy link
              </button>

              <p className="text-[10px] text-psl-muted mt-4 text-center">
                Points only · No real money · No financial value
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
