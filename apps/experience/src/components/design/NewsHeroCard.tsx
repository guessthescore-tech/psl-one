import Link from 'next/link';
import { clsx } from 'clsx';

interface NewsHeroCardProps {
  title: string;
  category: string;
  excerpt: string;
  publishedAt: string;
  imageUrl?: string;
  href?: string;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-ZA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

const FALLBACK_GRADIENT =
  'linear-gradient(135deg, #0d1b2e 0%, #1b3a6b 60%, #00843d33 100%)';

export function NewsHeroCard({
  title,
  category,
  excerpt,
  publishedAt,
  imageUrl,
  href = '#',
}: NewsHeroCardProps) {
  return (
    <article className="relative w-full rounded-card overflow-hidden shadow-card-xl min-h-[320px] sm:min-h-[400px] flex flex-col">
      {/* Background image or fallback gradient */}
      <div
        className="absolute inset-0"
        style={
          imageUrl
            ? {
                backgroundImage: `url(${imageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : { background: FALLBACK_GRADIENT }
        }
        aria-hidden
      />

      {/* Gradient overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-exp-void via-exp-void/60 to-transparent"
        aria-hidden
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-end flex-1 p-5 sm:p-6">
        <span className="inline-block text-label-md text-exp-gold bg-exp-gold/10 border border-exp-gold/30 rounded-pill px-3 py-1 mb-3 uppercase tracking-widest self-start">
          {category}
        </span>

        <h2 className={clsx('text-display-md text-white mb-2 line-clamp-3')}>
          {title}
        </h2>

        <p className="text-body-md text-white/70 line-clamp-2 mb-4">{excerpt}</p>

        <div className="flex items-center justify-between">
          <time
            dateTime={publishedAt}
            className="text-label-md text-white/50"
          >
            {formatDate(publishedAt)}
          </time>

          <Link
            href={href}
            className={clsx(
              'text-label-lg text-exp-gold font-bold hover:text-exp-gold-2 transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold rounded-sm',
              'min-h-[44px] flex items-center',
            )}
          >
            Read more →
          </Link>
        </div>
      </div>
    </article>
  );
}
