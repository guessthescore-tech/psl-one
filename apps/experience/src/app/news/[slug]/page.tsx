'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { WC_STORIES } from '@/lib/data';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-ZA', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

export default function NewsArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const story = WC_STORIES.find((s) => s.id === slug);

  if (!story) {
    return (
      <main className="min-h-[100dvh] bg-exp-void flex items-center justify-center">
        <div className="text-center">
          <p className="text-exp-muted mb-4">Article not found.</p>
          <Link href="/news" className="text-exp-gold hover:underline text-label-sm">
            ← Back to News
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-exp-void">
      <article className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Back nav */}
        <Link
          href="/news"
          className="inline-flex items-center gap-1 text-label-sm text-exp-muted hover:text-exp-gold transition-colors duration-150 mb-8"
        >
          ← News Centre
        </Link>

        {/* Category */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-label-xs text-exp-gold uppercase tracking-wider">{story.category}</span>
          {story.featured && (
            <span className="text-label-xs bg-exp-gold/10 text-exp-gold rounded px-2 py-0.5">Featured</span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-display-sm font-bold text-white leading-tight mb-4">{story.title}</h1>

        {/* Meta */}
        <div className="flex items-center gap-3 text-label-sm text-exp-muted mb-8 pb-6 border-b border-exp-border-dk">
          <time dateTime={story.publishedAt}>{formatDate(story.publishedAt)}</time>
          <span>·</span>
          <span>{story.readMinutes} min read</span>
        </div>

        {/* Hero image placeholder */}
        <div
          className="w-full aspect-video bg-exp-ink border border-exp-border-dk rounded-card flex items-center justify-center mb-8"
          aria-label="Article hero image"
        >
          <span className="text-exp-muted text-label-sm">Photo · {story.imageKey}</span>
        </div>

        {/* Article body placeholder */}
        <div className="prose prose-invert prose-sm max-w-none">
          <p className="text-body-md text-exp-muted leading-relaxed">{story.summary}</p>
          <p className="text-body-sm text-exp-muted/60 leading-relaxed mt-4">
            Full article content is displayed here when the editorial CMS is connected.
            The News Centre backend is live at{' '}
            <code className="text-exp-gold">/fan/news/{slug}</code> and supports
            ARTICLE-type MediaAsset records with full body content.
          </p>
        </div>

        {/* Footer */}
        <div className="mt-10 pt-6 border-t border-exp-border-dk">
          <Link
            href="/news"
            className="text-label-sm text-exp-gold hover:underline"
          >
            ← More articles
          </Link>
        </div>
      </article>
    </main>
  );
}
