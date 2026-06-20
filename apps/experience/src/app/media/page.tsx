import Link from 'next/link';
import type { ExpStory, ExpVideo } from '@/lib/data';
import { WC_STORIES, WC_VIDEOS } from '@/lib/data';
import { SectionHeader } from '@/components/ui/SectionHeader';

export default function MediaPage() {
  return (
    <main className="min-h-[100dvh] bg-exp-void">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <SectionHeader title="Media" subtitle="Stories and highlights" dark />

        {WC_STORIES.length > 0 && (
          <section className="mt-8" aria-label="Stories">
            <h2 className="text-label-lg text-exp-muted uppercase tracking-wider mb-4">Stories</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4" role="list">
              {WC_STORIES.map((story: ExpStory) => (
                <li key={story.id}>
                  <Link
                    href={`/media/s${story.id}`}
                    className="block bg-exp-ink border border-exp-border-dk rounded-card p-5 hover:border-exp-gold/40 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2"
                  >
                    <p className="text-label-sm text-exp-gold uppercase tracking-wider mb-2">{story.category}</p>
                    <p className="text-body-md font-bold text-white leading-snug">{story.title}</p>
                    <p className="text-body-sm text-exp-muted mt-2 line-clamp-2">{story.summary}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {WC_VIDEOS.length > 0 && (
          <section className="mt-10" aria-label="Videos">
            <h2 className="text-label-lg text-exp-muted uppercase tracking-wider mb-4">Videos</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4" role="list">
              {WC_VIDEOS.map((video: ExpVideo) => (
                <li key={video.id}>
                  <Link
                    href={`/media/v${video.id}`}
                    className="block bg-exp-ink border border-exp-border-dk rounded-card p-5 hover:border-exp-gold/40 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2"
                  >
                    <p className="text-label-sm text-exp-gold uppercase tracking-wider mb-2">Video</p>
                    <p className="text-body-md font-bold text-white leading-snug">{video.title}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}
