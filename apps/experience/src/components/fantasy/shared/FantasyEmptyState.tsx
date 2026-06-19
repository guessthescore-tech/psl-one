'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';

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
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      {icon && (
        <div className="text-exp-muted mb-4 text-4xl">{icon}</div>
      )}
      <h3 className="text-display-sm text-white mb-2">{title}</h3>
      <p className="text-body-md text-exp-muted max-w-xs mb-6">{message}</p>
      {action && (
        action.href ? (
          <Link
            href={action.href}
            className="inline-flex items-center justify-center min-h-[44px] px-6 rounded-pill bg-exp-gold text-exp-void font-black text-body-sm transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2"
          >
            {action.label}
          </Link>
        ) : (
          <button
            type="button"
            onClick={action.onClick}
            className="inline-flex items-center justify-center min-h-[44px] px-6 rounded-pill bg-exp-gold text-exp-void font-black text-body-sm transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2"
          >
            {action.label}
          </button>
        )
      )}
    </motion.div>
  );
}
