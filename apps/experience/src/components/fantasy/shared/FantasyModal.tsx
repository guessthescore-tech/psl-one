'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X } from '@phosphor-icons/react';

interface FantasyModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function FantasyModal({ open, onClose, title, children }: FantasyModalProps) {
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-black/60"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="relative z-10 w-full max-w-sm bg-exp-navy rounded-card border border-exp-border-dk shadow-card-xl"
            initial={reduce ? false : { opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-exp-border-dk">
              <h2 className="text-display-sm text-white">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="text-exp-muted hover:text-white transition-colors p-1 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-card-sm focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2"
              >
                <X size={20} weight="bold" />
              </button>
            </div>
            <div className="px-5 py-4">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
