'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';

interface FantasyEmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
}

export function FantasyEmptyState({ icon, title, message, action }: FantasyEmptyStateProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className="flex flex-col items-center justify-center px-6 py-16 text-center"
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      {icon && (
        <div className="mb-4 text-exp-muted" aria-hidden="true">
          {icon}
        </div>
      )}

      <h3 className="font-display text-display-sm text-white mb-2">{title}</h3>
      <p className="text-body-md text-exp-muted max-w-xs">{message}</p>

      {action && (
        <div className="mt-6">
          {action.href ? (
            <Link
              href={action.href}
              className="inline-flex items-center justify-center min-h-[44px] px-6 rounded-pill bg-exp-green text-white text-label-lg font-semibold transition-colors hover:bg-exp-green-2 focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2"
            >
              {action.label}
            </Link>
          ) : (
            <button
              type="button"
              onClick={action.onClick}
              className="inline-flex items-center justify-center min-h-[44px] px-6 rounded-pill bg-exp-green text-white text-label-lg font-semibold transition-colors hover:bg-exp-green-2 focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2"
            >
              {action.label}
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}
