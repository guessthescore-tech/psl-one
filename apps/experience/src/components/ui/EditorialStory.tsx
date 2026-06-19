import Link from 'next/link';
import { clsx } from 'clsx';
import { expImg } from '@/lib/data';
import type { ExpStory } from '@/lib/data';

interface EditorialStoryProps {
  story: ExpStory;
  featured?: boolean;
}

export function EditorialStory({ story, featured = false }: EditorialStoryProps) {
  return (
    <Link
      href={`/news/${story.id}`}
      className={clsx(
        'group block rounded-card overflow-hidden bg-exp-card border border-exp-border shadow-card',
        'hover:shadow-card-md transition-shadow duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-green focus-visible:ring-offset-1',
      )}
      aria-label={story.title}
    >
      {/* Thumbnail */}
      <div className={clsx('overflow-hidden', featured ? 'h-52 sm:h-64' : 'h-36')}>
        <img
          src={expImg(story.imageKey, featured ? 800 : 400, featured ? 256 : 144)}
          alt=""
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300 motion-reduce:transition-none"
          loading="lazy"
        />
        {/* Category overlay */}
        <div className="sr-only">{story.category}</div>
      </div>

      {/* Category */}
      <div className="px-4 pt-3">
        <span className="text-label-md text-exp-green font-bold uppercase tracking-widest">
          {story.category}
        </span>
      </div>

      {/* Title */}
      <div className="px-4 pb-1 mt-1.5">
        <h3
          className={clsx(
            'font-bold text-exp-navy leading-snug group-hover:text-exp-green-2 transition-colors duration-150',
            featured ? 'text-base sm:text-lg' : 'text-sm',
          )}
        >
          {story.title}
        </h3>
      </div>

      {/* Meta */}
      <div className="px-4 pb-4 mt-2 flex items-center gap-2">
        <span className="text-label-sm text-exp-muted">{story.readMinutes} min read</span>
        <span className="text-exp-muted/40" aria-hidden>·</span>
        <span className="text-label-sm text-exp-muted">
          {new Date(story.publishedAt).toLocaleDateString('en-ZA', {
            day: 'numeric', month: 'short',
          })}
        </span>
      </div>
    </Link>
  );
}
