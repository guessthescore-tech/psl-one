'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import { CaretDown } from '@phosphor-icons/react';

export interface HelpItem {
  question: string;
  answer: string;
  slug?: string;
}

export interface HelpCategory {
  title: string;
  items: HelpItem[];
}

interface HelpCategoryListProps {
  categories: HelpCategory[];
}

/**
 * FAQ accordion grouped by category.
 */
export function HelpCategoryList({ categories }: HelpCategoryListProps) {
  const [openKey, setOpenKey] = useState<string | null>(null);

  function toggle(key: string) {
    setOpenKey(prev => (prev === key ? null : key));
  }

  return (
    <div className="flex flex-col gap-8">
      {categories.map(cat => (
        <section key={cat.title}>
          <h2 className="text-label-lg text-exp-gold uppercase tracking-wider mb-3">
            {cat.title}
          </h2>
          <div className="flex flex-col gap-1 rounded-card-sm overflow-hidden border border-exp-border-dk bg-exp-ink">
            {cat.items.map((item, idx) => {
              const key = `${cat.title}-${idx}`;
              const isOpen = openKey === key;
              return (
                <div key={key} className="border-b border-exp-border-dk last:border-0">
                  <button
                    type="button"
                    onClick={() => toggle(key)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${key}`}
                    className={clsx(
                      'w-full flex items-center justify-between gap-3 px-4 py-4 text-left transition-colors min-h-[44px]',
                      'focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2',
                      isOpen ? 'text-white' : 'text-white/80 hover:text-white',
                    )}
                  >
                    <span className="text-body-md font-medium">{item.question}</span>
                    <CaretDown
                      size={16}
                      aria-hidden
                      className={clsx(
                        'flex-shrink-0 text-exp-muted transition-transform duration-200',
                        isOpen && 'rotate-180',
                      )}
                    />
                  </button>
                  {isOpen && (
                    <div
                      id={`faq-answer-${key}`}
                      role="region"
                      className="px-4 pb-4 text-body-sm text-exp-muted leading-relaxed"
                    >
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
