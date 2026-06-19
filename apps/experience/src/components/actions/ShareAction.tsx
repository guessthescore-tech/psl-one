'use client';

import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ShareNetwork, WhatsappLogo, TwitterLogo, CheckCircle } from '@phosphor-icons/react';

interface ShareActionProps {
  title: string;
  text: string;
  url?: string;
  compact?: boolean;
}

export function ShareAction({ title, text, url, compact = false }: ShareActionProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const reduce = useReducedMotion();
  const shareUrl = url ?? (typeof window !== 'undefined' ? window.location.href : '');

  function handleWhatsapp() {
    const encoded = encodeURIComponent(`${text} ${shareUrl}`);
    window.open(`https://wa.me/?text=${encoded}`, '_blank', 'noopener,noreferrer');
    setOpen(false);
  }

  function handleTwitter() {
    const encoded = encodeURIComponent(text);
    const urlEncoded = encodeURIComponent(shareUrl);
    window.open(`https://twitter.com/intent/tweet?text=${encoded}&url=${urlEncoded}`, '_blank', 'noopener,noreferrer');
    setOpen(false);
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`flex items-center gap-1.5 text-white/60 hover:text-white transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold rounded-sm ${
          compact ? 'text-xs px-2 py-1.5 min-h-[36px]' : 'text-sm px-3 py-2 min-h-[44px]'
        }`}
        aria-label={`Share: ${title}`}
      >
        <ShareNetwork size={compact ? 16 : 18} aria-hidden />
        {!compact && <span>Share</span>}
      </button>

      {/* Bottom sheet */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={reduce ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-exp-void/70"
              onClick={() => setOpen(false)}
              aria-hidden
            />

            {/* Sheet */}
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={`Share ${title}`}
              initial={reduce ? false : { y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', duration: 0.45, bounce: 0.1 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-exp-navy rounded-t-[20px] p-6 shadow-card-xl"
              style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
            >
              <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-5" aria-hidden />
              <h3 className="text-white font-bold text-base mb-4">{title}</h3>

              <div className="flex gap-3">
                <button
                  onClick={handleWhatsapp}
                  className="flex-1 flex flex-col items-center gap-2 bg-white/8 hover:bg-[#25D366]/20 rounded-card-sm py-4 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold min-h-[44px]"
                  aria-label="Share on WhatsApp"
                >
                  <WhatsappLogo size={24} className="text-[#25D366]" aria-hidden />
                  <span className="text-xs text-white/70">WhatsApp</span>
                </button>
                <button
                  onClick={handleTwitter}
                  className="flex-1 flex flex-col items-center gap-2 bg-white/8 hover:bg-white/15 rounded-card-sm py-4 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold min-h-[44px]"
                  aria-label="Share on X (Twitter)"
                >
                  <TwitterLogo size={24} className="text-white" aria-hidden />
                  <span className="text-xs text-white/70">X</span>
                </button>
                <button
                  onClick={handleCopyLink}
                  className="flex-1 flex flex-col items-center gap-2 bg-white/8 hover:bg-white/15 rounded-card-sm py-4 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold min-h-[44px]"
                  aria-label={copied ? 'Link copied' : 'Copy link'}
                >
                  {copied ? (
                    <CheckCircle size={24} className="text-exp-green" aria-hidden />
                  ) : (
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.172 13.828a4 4 0 015.656 0l1 1a4 4 0 01-5.656 5.656l-1.101-1.102" />
                    </svg>
                  )}
                  <span className="text-xs text-white/70">{copied ? 'Copied!' : 'Copy link'}</span>
                </button>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="mt-4 w-full py-3 text-sm text-white/50 hover:text-white transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold rounded-card-sm min-h-[44px]"
                aria-label="Close share sheet"
              >
                Cancel
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
