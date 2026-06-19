'use client';

import { motion, useReducedMotion } from 'framer-motion';

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
  const reduce = useReducedMotion();

  return (
    <div role="tablist" className="flex gap-1 p-1 bg-exp-ink rounded-card-xs">
      {tabs.map(tab => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`relative flex-1 min-h-[44px] px-3 py-2 text-label-md rounded-card-xs transition-colors focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2 ${
              isActive ? 'text-white' : 'text-exp-muted hover:text-white'
            }`}
          >
            {isActive && (
              <motion.span
                layoutId="tab-indicator"
                className="absolute inset-0 rounded-card-xs bg-exp-navy-2"
                transition={reduce ? { duration: 0 } : { duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
