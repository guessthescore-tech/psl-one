'use client';

import { X } from '@phosphor-icons/react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

interface FantasyBottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function FantasyBottomSheet({ open, onClose, title, children }: FantasyBottomSheetProps) {
  const reduce = useReducedMotion();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal
            aria-labelledby={title ? 'sheet-title' : undefined}
            className="fixed bottom-0 left-0 right-0 z-50 bg-exp-navy rounded-t-card border-t border-exp-border-dk p-6 pb-safe max-h-[90dvh] overflow-y-auto"
            initial={reduce ? false : { y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4" aria-hidden />
            {title && (
              <div className="flex items-center justify-between mb-4">
                <h2 id="sheet-title" className="text-display-sm text-white">{title}</h2>
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="w-8 h-8 flex items-center justify-center rounded-full text-exp-muted hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2"
                >
                  <X size={18} aria-hidden />
                </button>
              </div>
            )}
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
