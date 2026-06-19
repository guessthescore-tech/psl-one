'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

type SnapHeight = 'half' | 'three-quarters' | 'full';

interface FantasyBottomSheetProps {
  open: boolean;
  onClose: () => void;
  snapHeight?: SnapHeight;
  title?: string;
  children: React.ReactNode;
}

const snapHeightClass: Record<SnapHeight, string> = {
  'half': 'max-h-[50dvh]',
  'three-quarters': 'max-h-[75dvh]',
  'full': 'max-h-[92dvh]',
};

export function FantasyBottomSheet({
  open,
  onClose,
  snapHeight = 'half',
  title,
  children,
}: FantasyBottomSheetProps) {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/60"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'fantasy-sheet-title' : undefined}
            className={`fixed bottom-0 left-0 right-0 z-50 rounded-t-card bg-exp-navy border-t border-exp-border-dk shadow-card-xl flex flex-col ${snapHeightClass[snapHeight]}`}
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            initial={reduce ? false : { y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
              <div className="w-10 h-1 rounded-pill bg-exp-border-dk opacity-60" />
            </div>
            {title && (
              <div className="flex items-center justify-between px-5 pb-3 border-b border-exp-border-dk flex-shrink-0">
                <h2 id="fantasy-sheet-title" className="text-display-sm text-white">{title}</h2>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center text-exp-muted hover:text-white focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2"
                >
                  ✕
                </button>
              </div>
            )}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
