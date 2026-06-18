'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface ShareSuccessToastProps {
  message: string;
  visible: boolean;
}

export function ShareSuccessToast({ message, visible }: ShareSuccessToastProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.97 }}
          transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
          className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 px-4 py-2.5 rounded-pill bg-psl-midnight text-white text-sm font-semibold shadow-card-lg whitespace-nowrap pointer-events-none"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <svg viewBox="0 0 20 20" className="w-4 h-4 text-psl-gold flex-shrink-0" fill="currentColor" aria-hidden>
            <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
          </svg>
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
