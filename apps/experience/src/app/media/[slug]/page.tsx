'use client';

import { use } from 'react';
import Link from 'next/link';
import { WC_STORIES, WC_VIDEOS, getDataMode } from '@/lib/data';
import { ArticleDetail } from '@/components/football/ArticleDetail';
import { VideoPlayerShell } from '@/components/football/VideoPlayerShell';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function MediaDetailPage({ params }: PageProps) {
  const { slug } = use(params);
  const mode = getDataMode();

  // Detect type by prefix
  const isVideo = slug.startsWith('v');
  const isStory = slug.startsWith('s');

  const story = isStory ? WC_STORIES.find((s) => s.id === slug) : null;
  const video = isVideo ? WC_VIDEOS.find((v)  => v.id === slug)  : null;

  // Determine what to show
  const showStory = story != null;
  const showVideo = video != null;
  const notFound  = !showStory && !showVideo;

  // Related stories (exclude current)
  const relatedStories = WC_STORIES
    .filter((s) => s.id !== slug)
    .slice(0, 3);

  return (
    <div className="min-h-[100dvh] bg-exp-surface">
      {/* Design review banner */}
      {mode === 'DESIGN_REVIEW_DATA' && (
        <div
          role="banner"
          className="bg-purple-700 text-white text-center text-xs py-1.5 px-4 font-mono sticky top-0 z-50"
        >
          DESIGN_REVIEW_DATA — {showVideo ? 'Video' : 'Article'}: {slug}
        </div>
      )}

      {/* Back nav */}
      <div className="bg-exp-navy border-b border-exp-border-dk px-4 py-3">
        <div className="max-w-2xl mx-auto">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-1.5 text-label-md text-exp-muted hover:text-exp-gold transition-colors focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2 rounded min-h-[44px]"
            aria-label="Go back"
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-12">
        {/* Not found */}
        {notFound && (
          <div className="py-16 text-center">
            <div className="text-4xl mb-4" aria-hidden>🎬</div>
            <div className="text-display-md text-exp-navy font-black mb-2">
              Content not found
            </div>
            <p className="text-body-md text-exp-muted mb-6">
              We couldn't find media with slug "{slug}".
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-exp-gold text-exp-void font-bold px-6 py-3 rounded-card-sm hover:bg-exp-gold-2 transition-colors min-h-[44px] focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2"
            >
              Back to home
            </Link>
          </div>
        )}

        {/* Video */}
        {showVideo && (
          <VideoPlayerShell
            video={video!}
            isDesignReview={mode === 'DESIGN_REVIEW_DATA'}
          />
        )}

        {/* Article */}
        {showStory && (
          <ArticleDetail story={story!} relatedStories={relatedStories} />
        )}
      </div>
    </div>
  );
}
