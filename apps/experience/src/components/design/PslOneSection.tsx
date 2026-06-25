import { clsx } from 'clsx';

interface PslOneSectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  dark?: boolean;
  tag?: string;
  className?: string;
}

export function PslOneSection({
  title,
  subtitle,
  children,
  dark = false,
  tag,
  className,
}: PslOneSectionProps) {
  return (
    <section
      className={clsx(
        'w-full py-12 sm:py-16',
        dark ? 'bg-exp-navy' : 'bg-exp-surface',
        className,
      )}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-8 sm:mb-10">
          {tag && (
            <span
              className={clsx(
                'inline-block text-label-md rounded-pill px-3 py-1 mb-3 uppercase tracking-widest',
                dark
                  ? 'text-exp-gold bg-exp-gold/10 border border-exp-gold/20'
                  : 'text-exp-green bg-exp-green/10 border border-exp-green/20',
              )}
            >
              {tag}
            </span>
          )}
          <h2
            className={clsx(
              'text-display-md',
              dark ? 'text-white' : 'text-exp-navy',
            )}
          >
            {title}
          </h2>
          {subtitle && (
            <p
              className={clsx(
                'mt-2 text-body-md max-w-xl',
                dark ? 'text-white/60' : 'text-exp-muted',
              )}
            >
              {subtitle}
            </p>
          )}
        </div>

        {children}
      </div>
    </section>
  );
}
