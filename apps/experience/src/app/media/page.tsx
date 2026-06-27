'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getDataMode, isLiveDataMode, WC_STORIES, WC_VIDEOS } from '@/lib/data';
import { getMedia, type MediaItem } from '@/lib/media-api';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { getLiveWorldCupStories, liveStoryToMediaItem } from '@/lib/live-world-cup-feed';

export default function MediaPage() {
  const mode = getDataMode();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(isLiveDataMode(mode));

  useEffect(() => {
    if (!isLiveDataMode(mode)) {
      const fallback = [
        ...WC_STORIES.map((story) => ({
          id: story.id,
          slug: story.id,
          title: story.title,
          type: 'ARTICLE' as const,
          summary: story.summary,
          body: null,
          thumbnailUrl: null,
          videoUrl: null,
          durationSeconds: null,
          tags: [story.category],
          publishedAt: story.publishedAt,
          club: null,
        })),
        ...WC_VIDEOS.map((video) => ({
          id: video.id,
          slug: video.id,
          title: video.title,
          type: 'VIDEO' as const,
          summary: null,
          body: null,
          thumbnailUrl: null,
          videoUrl: null,
          durationSeconds: video.durationSeconds,
          tags: [video.category],
          publishedAt: new Date().toISOString(),
          club: null,
        })),
      ];
      setItems(fallback);
      setLoading(false);
      return;
    }

    let cancelled = false;
    void Promise.all([
      getMedia().catch(() => [] as MediaItem[]),
      getLiveWorldCupStories().catch(() => []),
    ]).then(([mediaItems, liveStories]) => {
      if (cancelled) return;

      const merged = new Map<string, MediaItem>();
      for (const item of liveStories.map(liveStoryToMediaItem)) {
        merged.set(item.slug, item);
      }
      for (const item of mediaItems) {
        if (!merged.has(item.slug)) merged.set(item.slug, item);
      }

      setItems([...merged.values()].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()));
      setLoading(false);
    }).catch(() => {
      if (!cancelled) {
        setItems([]);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [mode]);

  const stories = items.filter((item) => item.type === 'ARTICLE');
  const videos = items.filter((item) => item.type === 'VIDEO');

  return (
    <main className="min-h-[100dvh] bg-exp-void">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <SectionHeader title="Media" subtitle="Stories and highlights" dark />

        {loading ? (
          <div className="mt-8 text-exp-muted">Loading live media…</div>
        ) : (
          <>
            {stories.length > 0 && (
              <section className="mt-8" aria-label="Stories">
                <h2 className="text-label-lg text-exp-muted uppercase tracking-wider mb-4">Stories</h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4" role="list">
                  {stories.map((story) => (
                    <li key={story.id}>
                      <Link
                        href={`/media/${story.slug}`}
                        className="block bg-exp-ink border border-exp-border-dk rounded-card p-5 hover:border-exp-gold/40 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2"
                      >
                        <p className="text-label-sm text-exp-gold uppercase tracking-wider mb-2">{story.tags[0] ?? 'Story'}</p>
                        <p className="text-body-md font-bold text-white leading-snug">{story.title}</p>
                        <p className="text-body-sm text-exp-muted mt-2 line-clamp-2">{story.summary ?? 'Story details unavailable.'}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {videos.length > 0 && (
              <section className="mt-10" aria-label="Videos">
                <h2 className="text-label-lg text-exp-muted uppercase tracking-wider mb-4">Videos</h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4" role="list">
                  {videos.map((video) => (
                    <li key={video.id}>
                      <Link
                        href={`/media/${video.slug}`}
                        className="block bg-exp-ink border border-exp-border-dk rounded-card p-5 hover:border-exp-gold/40 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2"
                      >
                        <p className="text-label-sm text-exp-gold uppercase tracking-wider mb-2">Video</p>
                        <p className="text-body-md font-bold text-white leading-snug">{video.title}</p>
                        <p className="text-body-sm text-exp-muted mt-2">
                          {video.durationSeconds ? `${Math.floor(video.durationSeconds / 60)}:${String(video.durationSeconds % 60).padStart(2, '0')}` : 'Highlight clip'}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
