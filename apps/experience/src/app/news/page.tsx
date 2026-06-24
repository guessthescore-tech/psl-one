'use client';

import Link from 'next/link';
import { WC_STORIES } from '@/lib/data';
import type { ExpStory } from '@/lib/data';
import { SectionHeader } from '@/components/ui/SectionHeader';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' });
}

function NewsCard({ story }: { story: ExpStory }) {
  return (
    <article>
      <Link
        href={`/news/${story.id}`}
        className="block bg-exp-ink border border-exp-border-dk rounded-card p-5 hover:border-exp-gold/40 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2 h-full"
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-label-xs text-exp-gold uppercase tracking-wider">{story.category}</span>
          {story.featured && (
            <span className="ml-auto text-label-xs bg-exp-gold/10 text-exp-gold rounded px-2 py-0.5">Featured</span>
          )}
        </div>
        <h2 className="text-body-md font-bold text-white leading-snug mb-2 line-clamp-3">{story.title}</h2>
        <p className="text-body-sm text-exp-muted line-clamp-2 mb-4">{story.summary}</p>
        <div className="flex items-center gap-3 text-label-xs text-exp-muted mt-auto pt-3 border-t border-exp-border-dk">
          <span>{formatDate(story.publishedAt)}</span>
          <span>·</span>
          <span>{story.readMinutes} min read</span>
        </div>
      </Link>
    </article>
  );
}

const CATEGORIES = ['All', 'Match Report', 'Interview', 'Club News', 'Transfer'];

export default function NewsPage() {
  const featured = WC_STORIES.filter((s) => s.featured);
  const rest = WC_STORIES.filter((s) => !s.featured);

  return (
    <main className="min-h-[100dvh] bg-exp-void">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <SectionHeader title="News Centre" subtitle="The latest from World Cup 2026" dark />

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mt-6" role="navigation" aria-label="News categories">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className="flex-shrink-0 text-label-sm px-4 py-1.5 rounded-full border border-exp-border-dk text-exp-muted hover:border-exp-gold/40 hover:text-white transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-exp-gold"
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Featured articles */}
        {featured.length > 0 && (
          <section className="mt-8" aria-label="Featured stories">
            <h2 className="text-label-lg text-exp-muted uppercase tracking-wider mb-4">Featured</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {featured.map((story) => (
                <NewsCard key={story.id} story={story} />
              ))}
            </div>
          </section>
        )}

        {/* All articles */}
        {rest.length > 0 && (
          <section className="mt-8" aria-label="Latest stories">
            <h2 className="text-label-lg text-exp-muted uppercase tracking-wider mb-4">Latest</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {rest.map((story) => (
                <NewsCard key={story.id} story={story} />
              ))}
            </div>
          </section>
        )}

        {WC_STORIES.length === 0 && (
          <div className="mt-16 text-center">
            <p className="text-exp-muted">No articles published yet. Check back soon.</p>
          </div>
        )}
      </div>
    </main>
  );
}
