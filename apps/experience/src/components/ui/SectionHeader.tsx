import Link from 'next/link';
import { ArrowRight } from '@phosphor-icons/react/dist/ssr';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
  dark?: boolean;
}

export function SectionHeader({
  title,
  subtitle,
  href,
  linkLabel = 'View all',
  dark = false,
}: SectionHeaderProps) {
  return (
    <div className="flex items-end justify-between mb-5">
      <div>
        <h2
          className={`text-display-sm font-black ${
            dark ? 'text-white' : 'text-exp-navy'
          }`}
        >
          {title}
        </h2>
        {subtitle && (
          <p className={`text-body-sm mt-0.5 ${dark ? 'text-white/45' : 'text-exp-muted'}`}>
            {subtitle}
          </p>
        )}
      </div>

      {href && (
        <Link
          href={href}
          className={`flex items-center gap-1 text-body-sm font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold rounded-sm px-1 ${
            dark
              ? 'text-exp-gold hover:text-exp-gold-2'
              : 'text-exp-green hover:text-exp-green-2'
          }`}
        >
          {linkLabel}
          <ArrowRight size={14} weight="bold" aria-hidden />
        </Link>
      )}
    </div>
  );
}
