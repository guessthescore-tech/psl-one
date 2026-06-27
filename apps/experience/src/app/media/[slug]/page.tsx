'use client';

import { use, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getDataMode, isLiveDataMode, WC_STORIES, WC_VIDEOS, type ExpStory, type ExpVideo } from '@/lib/data';
import { ArticleDetail } from '@/components/football/ArticleDetail';
import { VideoPlayerShell } from '@/components/football/VideoPlayerShell';
import { getMedia, getMediaItem, type MediaItem } from '@/lib/media-api';
import { getLiveWorldCupStories, liveStoryToMediaItem } from '@/lib/live-world-cup-feed';

interface PageProps {
  params: Promise<{ slug: string }>;
}

function mapMediaStory(item: MediaItem): ExpStory {
  return {
    id: item.slug,
    title: item.title,
    category: item.tags[0] ?? 'Story',
    summary: item.summary ?? '',
    imageKey: `wc-story-${item.slug}`,
    readMinutes: Math.max(2, Math.ceil((item.body?.length ?? item.summary?.length ?? 500) / 500)),
    publishedAt: item.publishedAt,
    featured: false,
  };
}

function mapMediaVideo(item: MediaItem): ExpVideo {
  return {
    id: item.slug,
    title: item.title,
    thumbnailKey: `wc-video-${item.slug}`,
    durationSeconds: item.durationSeconds ?? 120,
    category: item.tags[0] ?? 'Video',
  };
}

export default function MediaDetailPage({ params }: PageProps) {
  const { slug } = use(params);
  const mode = getDataMode();
  const [item, setItem] = useState<MediaItem | null>(null);
  const [related, setRelated] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(isLiveDataMode(mode));

  useEffect(() => {
    if (!isLiveDataMode(mode)) {
      const story = WC_STORIES.find((s) => s.id === slug);
      const video = WC_VIDEOS.find((v) => v.id === slug);
      setItem(
        story
          ? {
              id: story.id,
              slug: story.id,
              title: story.title,
              type: 'ARTICLE',
              summary: story.summary,
              body: story.summary,
              thumbnailUrl: null,
              videoUrl: null,
              durationSeconds: null,
              tags: [story.category],
              publishedAt: story.publishedAt,
              club: null,
            }
          : video
            ? {
                id: video.id,
                slug: video.id,
                title: video.title,
                type: 'VIDEO',
                summary: null,
                body: null,
                thumbnailUrl: null,
                videoUrl: null,
                durationSeconds: video.durationSeconds,
                tags: [video.category],
                publishedAt: new Date().toISOString(),
                club: null,
              }
            : null,
      );
      setRelated(WC_STORIES.filter((s) => s.id !== slug).map((story) => ({
        id: story.id,
        slug: story.id,
        title: story.title,
        type: 'ARTICLE',
        summary: story.summary,
        body: story.summary,
        thumbnailUrl: null,
        videoUrl: null,
        durationSeconds: null,
        tags: [story.category],
        publishedAt: story.publishedAt,
        club: null,
      })));
      setLoading(false);
      return;
    }

    let cancelled = false;
    async function load() {
      try {
        const [current, list, liveStories] = await Promise.all([
          getMediaItem(slug).catch(() => null),
          getMedia().catch(() => [] as MediaItem[]),
          getLiveWorldCupStories().catch(() => []),
        ]);
        if (cancelled) return;
        const liveStoryItem = liveStories.map(liveStoryToMediaItem).find((entry) => entry.slug === slug) ?? null;
        setItem(current ?? liveStoryItem);
        setRelated(
          [
            ...liveStories.map(liveStoryToMediaItem),
            ...list,
          ]
            .filter((entry) => entry.slug !== slug)
            .slice(0, 3),
        );
      } catch {
        if (!cancelled) {
          setItem(null);
          setRelated([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [mode, slug]);

  const story = useMemo(() => item?.type === 'ARTICLE' ? mapMediaStory(item) : null, [item]);
  const video = useMemo(() => item?.type === 'VIDEO' ? mapMediaVideo(item) : null, [item]);
  const relatedStories = useMemo(
    () => related.filter((entry) => entry.type === 'ARTICLE').map(mapMediaStory),
    [related],
  );

  const modeLabel = mode === 'DESIGN_REVIEW_DATA' ? 'DESIGN_REVIEW_DATA' : 'LIVE';

  return (
    <div className="min-h-[100dvh] bg-exp-surface">
      {mode === 'DESIGN_REVIEW_DATA' && (
        <div role="banner" className="bg-purple-700 text-white text-center text-xs py-1.5 px-4 font-mono sticky top-0 z-50">
          DESIGN_REVIEW_DATA — {video ? 'Video' : 'Article'}: {slug}
        </div>
      )}

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

      <div className="max-w-2xl mx-auto px-4 pt-6 pb-12">
        {loading && (
          <div className="py-16 text-center text-exp-muted">Loading live media…</div>
        )}

        {!loading && !item && (
          <div className="py-16 text-center">
            <div className="text-4xl mb-4" aria-hidden>🎬</div>
            <div className="text-display-md text-exp-navy font-black mb-2">
              Content not found
            </div>
            <p className="text-body-md text-exp-muted mb-6">
              We couldn't find media with slug "{slug}".
            </p>
            <Link
              href="/media"
              className="inline-flex items-center gap-2 bg-exp-gold text-exp-void font-bold px-6 py-3 rounded-card-sm hover:bg-exp-gold-2 transition-colors min-h-[44px] focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2"
            >
              Back to media
            </Link>
          </div>
        )}

        {story && (
          <ArticleDetail story={story} relatedStories={relatedStories} />
        )}

        {video && (
          <VideoPlayerShell video={video} isDesignReview={mode === 'DESIGN_REVIEW_DATA'} />
        )}

        {item && !story && !video && (
          <div className="py-16 text-center text-exp-muted">
            Unsupported media type: {modeLabel}
          </div>
        )}
      </div>
    </div>
  );
}
