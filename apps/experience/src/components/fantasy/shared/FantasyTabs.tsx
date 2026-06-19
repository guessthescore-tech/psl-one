'use client';

import { motion } from 'framer-motion';
import { clsx } from 'clsx';

interface Tab {
  id: string;
  label: string;
}

interface FantasyTabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
}

export function FantasyTabs({ tabs, activeTab, onChange }: FantasyTabsProps) {
  return (
    <div
      role="tablist"
      className="flex border-b border-exp-border-dk bg-exp-navy"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            type="button"
            onClick={() => onChange(tab.id)}
            className={clsx(
              'relative flex-1 py-3 text-label-lg uppercase tracking-wider transition-colors min-h-[44px]',
              'focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2',
              isActive ? 'text-white' : 'text-exp-muted hover:text-white/70',
            )}
          >
            {tab.label}
            {isActive && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-exp-gold"
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
