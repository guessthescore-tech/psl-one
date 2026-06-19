'use client';

import { useEffect, useId } from 'react';
import { X } from '@phosphor-icons/react/dist/ssr';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

type SnapHeight = 'half' | 'three-quarters' | 'full';

interface FantasyBottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  snapHeight?: SnapHeight;
}

const snapHeightMap: Record<SnapHeight, string> = {
  half:           'max-h-[50vh]',
  'three-quarters': 'max-h-[75vh]',
  full:           'max-h-[90vh]',
};

export function FantasyBottomSheet({
  open,
  onClose,
  title,
  children,
  snapHeight = 'half',
}: FantasyBottomSheetProps) {
  const reduce = useReducedMotion();
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? undefined : { opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Sheet */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            className={`fixed inset-x-0 bottom-0 z-50 flex flex-col bg-exp-navy rounded-t-card shadow-card-xl ${snapHeightMap[snapHeight]}`}
            initial={reduce ? false : { y: '100%' }}
            animate={{ y: 0 }}
            exit={reduce ? undefined : { y: '100%' }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0" aria-hidden="true">
              <span className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            {/* Header */}
            {title && (
              <div className="px-4 pb-3 flex-shrink-0 flex items-center justify-between">
                <h2
                  id={titleId}
                  className="font-display text-display-sm text-white"
                >
                  {title}
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-full text-white/60 hover:text-white hover:bg-exp-ink transition-colors focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2"
                >
                  <X size={18} weight="bold" aria-hidden="true" />
                </button>
              </div>
            )}

            {/* Body */}
            <div className="overflow-y-auto flex-1 pb-safe">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
