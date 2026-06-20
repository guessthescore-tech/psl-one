'use client';

import { useReducedMotion } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface FantasyTabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
}

export function FantasyTabs({ tabs, activeTab, onChange }: FantasyTabsProps) {
  const reduce = useReducedMotion();
  const listRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    if (reduce) return;
    const list = listRef.current;
    if (!list) return;
    const activeEl = list.querySelector<HTMLElement>(`[data-tab="${activeTab}"]`);
    if (!activeEl) return;
    setIndicatorStyle({
      left: activeEl.offsetLeft,
      width: activeEl.offsetWidth,
    });
  }, [activeTab, reduce]);

  return (
    <div className="relative border-b border-exp-border-dk">
      <div
        ref={listRef}
        role="tablist"
        className="fantasy-scrollbar flex overflow-x-auto gap-1 px-4"
        aria-label="Fantasy navigation tabs"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              role="tab"
              data-tab={tab.id}
              aria-selected={isActive}
              onClick={() => onChange(tab.id)}
              className={`relative flex items-center gap-1.5 px-3 py-3 text-label-lg font-semibold whitespace-nowrap min-h-[44px] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2 rounded-sm ${
                isActive ? 'text-white' : 'text-white/40 hover:text-white/70'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-label-sm ${
                    isActive
                      ? 'bg-exp-gold text-exp-void'
                      : 'bg-exp-navy-2 text-white/60'
                  }`}
                >
                  {tab.count}
                </span>
              )}
              {/* Per-tab active indicator (reduced motion fallback) */}
              {reduce && isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-exp-gold rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Animated slide indicator (normal motion only) */}
      {!reduce && (
        <span
          className="tab-underline absolute bottom-0 h-0.5 bg-exp-gold rounded-full pointer-events-none"
          style={{
            left: indicatorStyle.left,
            width: indicatorStyle.width,
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
