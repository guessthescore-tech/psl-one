import Link from 'next/link';
import { ArrowLeft } from '@phosphor-icons/react';

interface RelatedArticle {
  slug: string;
  title: string;
}

interface HelpArticleProps {
  title: string;
  content: string;
  related?: RelatedArticle[];
}

/**
 * Single help article layout.
 */
export function HelpArticle({ title, content, related = [] }: HelpArticleProps) {
  return (
    <article className="flex flex-col gap-6">
      <Link
        href="/help"
        className="inline-flex items-center gap-1.5 text-sm text-exp-muted hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2 rounded-sm"
      >
        <ArrowLeft size={16} aria-hidden />
        Back to Help
      </Link>

      <header>
        <p className="text-label-lg text-exp-gold uppercase tracking-wider mb-2">Help Article</p>
        <h1 className="text-display-md text-white">{title}</h1>
      </header>

      <div className="bg-exp-ink border border-exp-border-dk rounded-card p-6">
        <p className="text-body-md text-white/80 leading-relaxed whitespace-pre-line">{content}</p>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related-heading">
          <h2 id="related-heading" className="text-label-lg text-exp-muted uppercase tracking-wider mb-3">
            Related Articles
          </h2>
          <ul className="flex flex-col gap-2" role="list">
            {related.map(art => (
              <li key={art.slug}>
                <Link
                  href={`/help/${art.slug}`}
                  className="text-body-md text-exp-gold hover:text-exp-gold-2 underline underline-offset-2 transition-colors focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2 rounded-sm"
                >
                  {art.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
