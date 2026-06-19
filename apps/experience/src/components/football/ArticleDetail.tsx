'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { expImg } from '@/lib/data';
import type { ExpStory } from '@/lib/data';

interface ArticleDetailProps {
  story: ExpStory;
  relatedStories?: ExpStory[];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const MOCK_BODY_PARAGRAPHS = [
  'The stadium fell silent for a brief moment as the whistle blew, before erupting into a deafening roar. What followed over the next 90 minutes was a masterclass in modern football — a blend of tactical discipline, individual brilliance and collective determination that left no doubt about the eventual outcome.',
  'The opening exchanges were cagey, both sides feeling each other out in the tropical humidity. But it was the home side who found their rhythm first, pressing high and winning the ball back with remarkable energy for a tournament that was barely underway.',
  'The tactical setup was immediately clear — a high defensive line designed to compress space and force errors in the opposition\'s build-up. It was a brave approach against such technically gifted opponents, but one that paid dividends as the half progressed.',
  'The second half began with renewed intensity. Substitutions changed the dynamic, injecting pace and creativity that had been absent. The crowd, sensing the shift, roared their team forward with every touch of the ball.',
  'When the decisive moment finally arrived, it was greeted with the kind of raw, unbridled joy that only football can produce. The goal was a moment of individual brilliance — a reminder of why the beautiful game continues to captivate billions of fans around the world.',
  'The post-match analysis will focus on the tactical detail, the statistics and the individual ratings. But what the numbers cannot capture is the atmosphere, the drama and the sheer spectacle of world-class football at its finest.',
];

export function ArticleDetail({ story, relatedStories = [] }: ArticleDetailProps) {
  const reduce = useReducedMotion();

  return (
    <article className="max-w-2xl mx-auto" aria-label={story.title}>
      {/* Hero image */}
      <motion.div
        initial={reduce ? false : { opacity: 0, scale: 1.02 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative h-56 sm:h-72 w-full rounded-card overflow-hidden mb-6"
      >
        <Image
          src={expImg(story.imageKey, 800, 450)}
          alt={story.title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, 800px"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-exp-void/60 to-transparent" aria-hidden />

        {/* Category pill */}
        <div className="absolute top-4 left-4">
          <span className="bg-exp-gold text-exp-void text-label-md font-black px-3 py-1 rounded-pill">
            {story.category}
          </span>
        </div>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1 className="text-display-md text-exp-navy font-black leading-tight mb-3">
          {story.title}
        </h1>

        {/* Meta */}
        <div className="flex items-center gap-3 text-label-sm text-exp-muted mb-6 pb-6 border-b border-exp-border">
          <span>PSL One Editorial</span>
          <span aria-hidden>·</span>
          <time dateTime={story.publishedAt}>{formatDate(story.publishedAt)}</time>
          <span aria-hidden>·</span>
          <span>{story.readMinutes} min read</span>
        </div>

        {/* Summary / lead */}
        <p className="text-body-lg text-exp-navy font-medium leading-relaxed mb-6 border-l-4 border-exp-gold pl-4">
          {story.summary}
        </p>

        {/* Body paragraphs */}
        <div className="space-y-5">
          {MOCK_BODY_PARAGRAPHS.map((para, i) => (
            <p key={i} className="text-body-md text-gray-700 leading-relaxed">
              {para}
            </p>
          ))}
        </div>
      </motion.div>

      {/* Related articles */}
      {relatedStories.length > 0 && (
        <div className="mt-10 pt-6 border-t border-exp-border">
          <h2 className="text-display-sm text-exp-navy font-black mb-4">Related stories</h2>
          <div className="space-y-3">
            {relatedStories.map((s) => (
              <Link
                key={s.id}
                href={`/media/${s.id}`}
                className="flex items-center gap-3 group min-h-[44px] focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2 rounded-card-sm"
              >
                <div className="relative w-16 h-12 rounded-card-sm overflow-hidden flex-shrink-0">
                  <Image
                    src={expImg(s.imageKey, 128, 96)}
                    alt={s.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                    sizes="64px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-body-sm font-semibold text-exp-navy group-hover:text-exp-gold transition-colors line-clamp-2">
                    {s.title}
                  </div>
                  <div className="text-label-sm text-exp-muted">{s.category} · {s.readMinutes} min</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
