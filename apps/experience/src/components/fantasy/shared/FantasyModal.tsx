'use client';

import { useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X } from '@phosphor-icons/react/dist/ssr';

interface FantasyModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function FantasyModal({ open, onClose, title, children }: FantasyModalProps) {
  const reduce = useReducedMotion();
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      // Focus the close button after mount
      const raf = requestAnimationFrame(() => {
        closeRef.current?.focus();
      });
      return () => cancelAnimationFrame(raf);
    } else {
      previousFocusRef.current?.focus();
    }
  }, [open]);

  // Trap focus within modal
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const modal = document.getElementById('fantasy-modal-content');
      if (!modal) return;
      const focusable = modal.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
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
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? undefined : { opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            id="fantasy-modal-content"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="fixed inset-x-0 bottom-0 z-50 flex flex-col bg-exp-navy rounded-t-card shadow-card-xl max-h-[90vh]"
            initial={reduce ? false : { opacity: 0, y: 48 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: 48 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-exp-border-dk flex-shrink-0">
              <h2
                id={titleId}
                className="font-display text-display-sm text-white"
              >
                {title}
              </h2>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-full text-white/60 hover:text-white hover:bg-exp-ink transition-colors focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2"
                aria-label="Close modal"
              >
                <X size={20} weight="bold" aria-hidden="true" />
              </button>
            </div>

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
