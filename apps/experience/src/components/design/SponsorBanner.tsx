import Link from 'next/link';
import { clsx } from 'clsx';

interface SponsorBannerProps {
  campaignName: string;
  sponsorName: string;
  tagline?: string;
  ctaLabel: string;
  ctaHref: string;
  accentColor: string;
}

/**
 * Sponsor campaign banner — catalogue-only. No real money, no financial value.
 * Points only · no real money · no financial value
 */
export function SponsorBanner({
  campaignName,
  sponsorName,
  tagline,
  ctaLabel,
  ctaHref,
  accentColor,
}: SponsorBannerProps) {
  return (
    <div
      className={clsx(
        'relative w-full rounded-card overflow-hidden border border-exp-border-dk',
        'bg-exp-navy/70 backdrop-blur-sm shadow-card-lg',
        'flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 sm:p-6',
      )}
    >
      {/* Accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-card"
        style={{ backgroundColor: accentColor }}
        aria-hidden
      />

      {/* Sponsor mark */}
      <div
        className="w-12 h-12 rounded-card-sm flex items-center justify-center flex-shrink-0 ml-3"
        style={{ backgroundColor: `${accentColor}22`, border: `1px solid ${accentColor}44` }}
        aria-hidden
      >
        <span
          className="font-black text-base leading-none"
          style={{ color: accentColor }}
        >
          {sponsorName.slice(0, 2).toUpperCase()}
        </span>
      </div>

      {/* Copy */}
      <div className="flex-1 min-w-0 ml-1">
        <p className="text-label-md text-exp-muted uppercase tracking-widest mb-0.5">
          {campaignName}
        </p>
        <h3 className="text-display-sm text-white leading-tight">
          {sponsorName}
        </h3>
        {tagline && (
          <p className="mt-1 text-body-sm text-white/60 line-clamp-2">{tagline}</p>
        )}
        <p className="mt-1.5 text-label-sm text-exp-muted">
          Points only · no real money · no financial value
        </p>
      </div>

      {/* CTA */}
      <Link
        href={ctaHref}
        className={clsx(
          'flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-pill',
          'text-label-lg font-bold transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-exp-navy',
          'min-h-[44px]',
        )}
        style={{
          backgroundColor: `${accentColor}22`,
          color: accentColor,
          border: `1px solid ${accentColor}44`,
        }}
        aria-label={`${ctaLabel} — ${campaignName} by ${sponsorName}`}
      >
        {ctaLabel}
      </Link>
    </div>
  );
}
