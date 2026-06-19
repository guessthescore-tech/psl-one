import { expImg } from '@/lib/data';

interface SponsorMomentProps {
  sponsorName?: string;
  sponsorTagline?: string;
  imageKey?: string;
  href?: string;
}

export function SponsorMoment({
  sponsorName = 'DStv',
  sponsorTagline = 'Bringing you closer to the action',
  imageKey = 'sponsor-dstv-banner-wc2026',
  href,
}: SponsorMomentProps) {
  const Inner = (
    <div className="relative rounded-card overflow-hidden h-32 sm:h-40">
      <img
        src={expImg(imageKey, 1200, 320)}
        alt={`${sponsorName} - ${sponsorTagline}`}
        className="w-full h-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-exp-void/80 to-transparent" aria-hidden />
      <div className="absolute inset-0 flex flex-col justify-center px-6">
        <span className="text-label-sm text-white/50 mb-1">Presented by</span>
        <span className="text-display-sm text-white font-black">{sponsorName}</span>
        <span className="text-body-sm text-white/70 mt-0.5">{sponsorTagline}</span>
      </div>
      {/* Transparency label */}
      <div className="absolute top-2 right-3">
        <span className="text-label-sm text-white/40">Sponsored</span>
      </div>
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold rounded-card"
        aria-label={`${sponsorName} - ${sponsorTagline} (opens in new tab)`}
      >
        {Inner}
        <p className="text-label-sm text-exp-muted mt-2 text-center">
          Points only - No gambling - No real money involvement
        </p>
      </a>
    );
  }

  return (
    <div>
      {Inner}
      <p className="text-label-sm text-exp-muted mt-2 text-center">
        Points only - No gambling - No real money involvement
      </p>
    </div>
  );
}
