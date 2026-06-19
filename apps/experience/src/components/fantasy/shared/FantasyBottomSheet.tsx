'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X } from '@phosphor-icons/react';
import { clsx } from 'clsx';

type SnapHeight = 'half' | 'three-quarters' | 'full';

interface FantasyBottomSheetProps {
  open: boolean;
  onClose: () => void;
  snapHeight?: SnapHeight;
  title?: string;
  children: React.ReactNode;
}

const SNAP_CLASSES: Record<SnapHeight, string> = {
  half: 'max-h-[50dvh]',
  'three-quarters': 'max-h-[75dvh]',
  full: 'max-h-[92dvh]',
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
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          <motion.div
            className="absolute inset-0 bg-black/60"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className={clsx(
              'absolute bottom-0 left-0 right-0 bg-exp-navy rounded-t-card border-t border-exp-border-dk',
              'overflow-hidden flex flex-col',
              SNAP_CLASSES[snapHeight],
            )}
            initial={reduce ? false : { y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            {title && (
              <div className="flex items-center justify-between px-5 py-3 border-b border-exp-border-dk flex-shrink-0">
                <h2 className="text-display-sm text-white">{title}</h2>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close sheet"
                  className="text-exp-muted hover:text-white transition-colors p-1 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-card-sm focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2"
                >
                  <X size={20} weight="bold" />
                </button>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-5 py-4 pb-safe">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
