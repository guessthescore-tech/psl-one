'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  copyToClipboard, nativeShare, whatsappShareUrl,
  predictionShareText, predictionShareUrl, canNativeShare,
} from '@/lib/share-utils';
import { ShareSuccessToast } from './ShareSuccessToast';

interface PredictionShareCardProps {
  fixtureId: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  visible: boolean;
  onDismiss: () => void;
}

export function PredictionShareCard({
  fixtureId,
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  visible,
  onDismiss,
}: PredictionShareCardProps) {
  const [toast, setToast] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  function showToast(msg: string) {
    setToast(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  }

  const shareText = predictionShareText(homeTeam, awayTeam, homeScore, awayScore);
  const shareUrl = predictionShareUrl(fixtureId);

  async function handleCopy() {
    const ok = await copyToClipboard(shareUrl);
    if (ok) showToast('Link copied!');
  }

  async function handleNative() {
    await nativeShare(`My prediction: ${homeTeam} vs ${awayTeam}`, shareText, shareUrl);
  }

  function handleWhatsApp() {
    window.open(whatsappShareUrl(shareText, shareUrl), '_blank', 'noopener,noreferrer');
  }

  return (
    <>
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            className="mt-4 rounded-card border border-psl-gold/30 bg-gradient-to-br from-psl-midnight to-psl-navy p-4 text-white"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-psl-gold/70 mb-0.5">
                  Prediction submitted
                </p>
                <p className="text-sm font-bold leading-snug">
                  {homeTeam}{' '}
                  <span className="text-psl-gold font-black tabular-nums">
                    {homeScore}–{awayScore}
                  </span>{' '}
                  {awayTeam}
                </p>
                <p className="text-[11px] text-white/50 mt-0.5">Points only · no real money</p>
              </div>
              <button
                type="button"
                onClick={onDismiss}
                aria-label="Dismiss share prompt"
                className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-psl-gold"
              >
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Share actions */}
            <div className="flex gap-2 flex-wrap">
              {canNativeShare() && (
                <button
                  type="button"
                  onClick={handleNative}
                  aria-label="Share prediction"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold bg-psl-gold text-psl-midnight px-4 py-2 rounded-pill hover:bg-yellow-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-psl-gold focus-visible:ring-offset-2 focus-visible:ring-offset-psl-midnight min-h-[44px]"
                >
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
                  </svg>
                  Share prediction
                </button>
              )}
              <button
                type="button"
                onClick={handleWhatsApp}
                aria-label="Share prediction on WhatsApp"
                className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white/10 text-white px-4 py-2 rounded-pill hover:bg-white/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 min-h-[44px]"
              >
                <WhatsAppIcon />
                WhatsApp
              </button>
              <button
                type="button"
                onClick={handleCopy}
                aria-label="Copy prediction link"
                className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white/10 text-white px-4 py-2 rounded-pill hover:bg-white/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 min-h-[44px]"
              >
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                </svg>
                Copy link
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ShareSuccessToast message={toast} visible={toastVisible} />
    </>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-[#25D366]" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}
