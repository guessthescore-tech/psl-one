'use client';

import { X } from '@phosphor-icons/react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

interface FantasyModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function FantasyModal({ open, onClose, title, children }: FantasyModalProps) {
  const reduce = useReducedMotion();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal
            aria-labelledby="modal-title"
            className="fixed inset-x-4 top-1/2 z-50 -translate-y-1/2 max-w-md mx-auto bg-exp-navy rounded-card border border-exp-border-dk shadow-card-xl p-6"
            initial={reduce ? false : { opacity: 0, scale: 0.95, y: '-48%' }}
            animate={{ opacity: 1, scale: 1, y: '-50%' }}
            exit={{ opacity: 0, scale: 0.95, y: '-48%' }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 id="modal-title" className="text-display-sm text-white">{title}</h2>
              <button
                onClick={onClose}
                aria-label="Close dialog"
                className="w-8 h-8 flex items-center justify-center rounded-full text-exp-muted hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2"
              >
                <X size={18} aria-hidden />
              </button>
            </div>
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
