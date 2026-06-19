'use client';

import { useRef } from 'react';
import { CaretLeft, CaretRight } from '@phosphor-icons/react/dist/ssr';
import type { ExperienceData } from '@/lib/data';
import { FixtureCard } from '@/components/ui/FixtureCard';
import { SectionHeader } from '@/components/ui/SectionHeader';

interface FixtureCarouselSectionProps {
  data: ExperienceData;
}

export function FixtureCarouselSection({ data }: FixtureCarouselSectionProps) {
  const railRef = useRef<HTMLDivElement>(null);

  function scroll(dir: 'left' | 'right') {
    if (!railRef.current) return;
    const w = railRef.current.clientWidth * 0.8;
    railRef.current.scrollBy({ left: dir === 'right' ? w : -w, behavior: 'smooth' });
  }

  return (
    <section
      className="bg-exp-surface py-8"
      aria-label="Fixture carousel"
      role="region"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-5">
          <SectionHeader
            title="Fixtures"
            subtitle={data.gameweek.label}
            href="/fixtures"
          />
          {/* Scroll controls - desktop only */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              className="w-9 h-9 min-h-[44px] min-w-[44px] rounded-full border border-exp-border bg-exp-card flex items-center justify-center text-exp-muted hover:text-exp-navy hover:border-exp-navy transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-green"
              aria-label="Scroll fixtures left"
            >
              <CaretLeft size={16} weight="bold" aria-hidden />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-9 h-9 min-h-[44px] min-w-[44px] rounded-full border border-exp-border bg-exp-card flex items-center justify-center text-exp-muted hover:text-exp-navy hover:border-exp-navy transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-green"
              aria-label="Scroll fixtures right"
            >
              <CaretRight size={16} weight="bold" aria-hidden />
            </button>
          </div>
        </div>
      </div>

      {/* Scroll rail — full bleed for peek effect */}
      <div
        ref={railRef}
        className="flex gap-4 overflow-x-auto scrollbar-none snap-rail pl-4 sm:pl-6 lg:pl-8 pr-4"
        role="list"
        aria-label="Fixture cards"
      >
        {data.fixtures.map((fixture, i) => (
          <div key={fixture.id} role="listitem">
            <FixtureCard fixture={fixture} index={i} />
          </div>
        ))}
        {/* End spacer */}
        <div className="w-4 flex-shrink-0" aria-hidden />
      </div>
    </section>
  );
}
