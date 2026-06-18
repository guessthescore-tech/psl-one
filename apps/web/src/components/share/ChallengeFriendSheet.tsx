'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { copyToClipboard, whatsappShareUrl, challengeInviteText, challengeShareUrl } from '@/lib/share-utils';
import { ShareSuccessToast } from './ShareSuccessToast';

interface ChallengeFriendSheetProps {
  open: boolean;
  onClose: () => void;
  fixtureId: string;
  homeTeam: string;
  awayTeam: string;
  challengeId?: string | null;
}

export function ChallengeFriendSheet({
  open,
  onClose,
  fixtureId,
  homeTeam,
  awayTeam,
  challengeId = null,
}: ChallengeFriendSheetProps) {
  const [toast, setToast] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<Element | null>(null);

  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement;
      setTimeout(() => closeRef.current?.focus(), 50);
    } else if (triggerRef.current instanceof HTMLElement) {
      triggerRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  function showToast(msg: string) {
    setToast(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  }

  const inviteText = challengeInviteText(homeTeam, awayTeam);
  const shareUrl = challengeId ? challengeShareUrl(challengeId) : `${typeof window !== 'undefined' ? window.location.origin : ''}/social-challenges/new?fixtureId=${fixtureId}`;

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-40 bg-psl-midnight/60"
              aria-hidden
              onClick={onClose}
            />

            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
              className="fixed bottom-0 inset-x-0 z-50 bg-white rounded-t-[24px] shadow-card-xl max-w-lg mx-auto"
              role="dialog"
              aria-modal="true"
              aria-label={`Challenge a friend on ${homeTeam} vs ${awayTeam}`}
              style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            >
              <div className="flex justify-center pt-3 pb-1" aria-hidden>
                <div className="w-10 h-1 rounded-full bg-[#e8eaf0]" />
              </div>

              <div className="px-5 pb-6">
                <div className="flex items-center justify-between py-3 border-b border-[#f0f2f7] mb-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-psl-muted">Challenge</p>
                    <h2 className="text-sm font-bold text-psl-navy mt-0.5">
                      {homeTeam} vs {awayTeam}
                    </h2>
                  </div>
                  <button
                    ref={closeRef}
                    type="button"
                    onClick={onClose}
                    aria-label="Close challenge sheet"
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-psl-surface text-psl-muted hover:text-psl-navy hover:bg-[#e8eaf0] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-psl-navy"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Challenge intro */}
                <div className="mb-4 p-4 rounded-card bg-psl-surface border border-[#e8eaf0]">
                  <p className="text-sm font-semibold text-psl-navy mb-0.5">Prediction challenge</p>
                  <p className="text-xs text-psl-muted leading-relaxed">
                    Invite another fan to predict the same fixture. The most accurate score wins points on the platform leaderboard.
                    Points only — no real money, no stakes.
                  </p>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <a
                    href={`/social-challenges/new?fixtureId=${fixtureId}`}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-card bg-psl-navy text-white font-semibold text-sm hover:bg-psl-navy/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-psl-navy focus-visible:ring-offset-2 min-h-[44px]"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
                    </svg>
                    Send a direct challenge
                  </a>

                  <button
                    type="button"
                    onClick={async () => {
                      window.open(whatsappShareUrl(inviteText, shareUrl), '_blank', 'noopener,noreferrer');
                    }}
                    aria-label="Share challenge via WhatsApp"
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-card border border-[#e8eaf0] bg-white text-psl-navy font-semibold text-sm hover:bg-psl-surface transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-psl-navy focus-visible:ring-offset-1 min-h-[44px]"
                  >
                    <WhatsAppIcon />
                    Invite via WhatsApp
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      const ok = await copyToClipboard(shareUrl);
                      if (ok) showToast('Invite link copied!');
                    }}
                    aria-label="Copy challenge invite link"
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-card border border-[#e8eaf0] bg-white text-psl-navy font-semibold text-sm hover:bg-psl-surface transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-psl-navy focus-visible:ring-offset-1 min-h-[44px]"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                    </svg>
                    Copy invite link
                  </button>
                </div>

                {/* Coming next */}
                <div className="mt-4 px-4 py-3 rounded-card-sm bg-psl-surface border border-dashed border-[#d0d5e0]">
                  <p className="text-xs text-psl-muted">
                    <span className="font-semibold text-psl-navy">Coming next:</span> Send directly to a PSL One friend within the platform.
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ShareSuccessToast message={toast} visible={toastVisible} />
    </>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#25D366]" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}
