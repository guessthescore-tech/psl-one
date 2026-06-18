'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  canNativeShare, nativeShare, copyToClipboard,
  whatsappShareUrl, twitterShareUrl,
  fixtureShareUrl, fixtureShareText,
  predictionShareText, predictionShareUrl,
} from '@/lib/share-utils';
import { ShareSuccessToast } from './ShareSuccessToast';

interface FixtureShareMenuProps {
  open: boolean;
  onClose: () => void;
  fixtureId: string;
  homeTeam: string;
  awayTeam: string;
  kickoffAt: string;
  prediction?: { homeScore: number; awayScore: number } | null;
}

interface ShareOption {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
}

export function FixtureShareMenu({
  open,
  onClose,
  fixtureId,
  homeTeam,
  awayTeam,
  kickoffAt,
  prediction,
}: FixtureShareMenuProps) {
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
    setTimeout(() => setToastVisible(false), 2200);
  }

  const shareUrl = fixtureShareUrl(fixtureId);
  const shareText = fixtureShareText(homeTeam, awayTeam, kickoffAt);
  const predUrl = prediction ? predictionShareUrl(fixtureId) : null;
  const predText = prediction
    ? predictionShareText(homeTeam, awayTeam, prediction.homeScore, prediction.awayScore)
    : null;

  const options: ShareOption[] = [
    ...(canNativeShare()
      ? [{
          id: 'native',
          label: 'Share',
          description: 'Use your device share sheet',
          icon: <DeviceShareIcon />,
          action: async () => {
            const shared = await nativeShare(
              `${homeTeam} vs ${awayTeam}`,
              predText ?? shareText,
              predUrl ?? shareUrl,
            );
            if (shared) { onClose(); showToast('Shared!'); }
          },
        }]
      : []),
    {
      id: 'copy',
      label: 'Copy link',
      description: 'Copy fixture link to clipboard',
      icon: <CopyIcon />,
      action: async () => {
        const ok = await copyToClipboard(predUrl ?? shareUrl);
        if (ok) { showToast('Link copied!'); onClose(); }
      },
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      description: 'Share via WhatsApp',
      icon: <WhatsAppIcon />,
      action: () => {
        window.open(whatsappShareUrl(predText ?? shareText, predUrl ?? shareUrl), '_blank', 'noopener,noreferrer');
        onClose();
      },
    },
    {
      id: 'twitter',
      label: 'X / Twitter',
      description: 'Post on X',
      icon: <XIcon />,
      action: () => {
        window.open(twitterShareUrl(predText ?? shareText, predUrl ?? shareUrl), '_blank', 'noopener,noreferrer');
        onClose();
      },
    },
    {
      id: 'challenge',
      label: 'Challenge a friend',
      description: 'Invite another PSL One fan',
      icon: <ChallengeIcon />,
      action: () => {
        window.location.href = `/social-challenges/new?fixtureId=${fixtureId}`;
        onClose();
      },
    },
  ];

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-40 bg-psl-midnight/60"
              aria-hidden
              onClick={onClose}
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
              className="fixed bottom-0 inset-x-0 z-50 bg-white rounded-t-[24px] shadow-card-xl max-w-lg mx-auto"
              role="dialog"
              aria-modal="true"
              aria-label={`Share ${homeTeam} vs ${awayTeam}`}
              style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1" aria-hidden>
                <div className="w-10 h-1 rounded-full bg-[#e8eaf0]" />
              </div>

              <div className="px-5 pb-2">
                {/* Header */}
                <div className="flex items-center justify-between py-3 border-b border-[#f0f2f7]">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-psl-muted">Share</p>
                    <h2 className="text-sm font-bold text-psl-navy mt-0.5">
                      {homeTeam} vs {awayTeam}
                    </h2>
                    {prediction && (
                      <p className="text-xs text-psl-gold font-semibold mt-0.5">
                        My prediction: {prediction.homeScore}–{prediction.awayScore}
                      </p>
                    )}
                  </div>
                  <button
                    ref={closeRef}
                    type="button"
                    onClick={onClose}
                    aria-label="Close share menu"
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-psl-surface text-psl-muted hover:text-psl-navy hover:bg-[#e8eaf0] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-psl-navy"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Options */}
                <ul className="py-2" role="list">
                  {options.map(opt => (
                    <li key={opt.id}>
                      <button
                        type="button"
                        onClick={opt.action}
                        className="w-full flex items-center gap-3 px-1 py-3 rounded-card-sm hover:bg-psl-surface transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-psl-navy min-h-[44px]"
                      >
                        <div className="w-10 h-10 flex-shrink-0 rounded-card-sm bg-psl-surface flex items-center justify-center text-psl-navy">
                          {opt.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-psl-navy">{opt.label}</div>
                          <div className="text-xs text-psl-muted truncate">{opt.description}</div>
                        </div>
                        <svg viewBox="0 0 24 24" className="w-4 h-4 text-psl-muted flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>

                {/* Coming next placeholder */}
                <div className="mx-1 mb-4 px-4 py-3 rounded-card-sm bg-psl-surface border border-dashed border-[#d0d5e0]">
                  <p className="text-xs text-psl-muted">
                    <span className="font-semibold text-psl-navy">Coming next:</span> Send to a PSL One friend directly within the platform.
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

/* ─── Icons ──────────────────────────────────────────────────────────────── */

function DeviceShareIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#25D366]" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.23H2.744l7.73-8.835L1.254 2.25H8.08l4.26 5.632 5.905-5.632Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
    </svg>
  );
}

function ChallengeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
    </svg>
  );
}
