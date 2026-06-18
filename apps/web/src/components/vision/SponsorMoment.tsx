'use client';

interface SponsorMomentProps {
  sponsorName?: string;
  message?: string;
  href?: string;
}

export function SponsorMoment({
  sponsorName = 'DStv',
  message = 'Bringing you every PSL moment live',
  href = '#',
}: SponsorMomentProps) {
  return (
    <section
      className="px-6 py-4"
      aria-label={`Sponsored by ${sponsorName}`}
    >
      <div className="bg-psl-surface rounded-card-sm border border-[#e8eaf0] px-5 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="text-[9px] font-bold uppercase tracking-widest text-psl-muted flex-shrink-0">
            Sponsored
          </div>
          <div className="w-px h-4 bg-[#e8eaf0]" aria-hidden />
          <div className="text-xs font-bold text-psl-navy">{sponsorName}</div>
          <div className="text-xs text-psl-muted hidden sm:block">{message}</div>
        </div>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="text-[10px] font-bold text-psl-gold hover:underline focus-visible:outline-none flex-shrink-0"
          aria-label={`Learn more about ${sponsorName}`}
        >
          Learn more
        </a>
      </div>
      <p className="text-[9px] text-psl-muted mt-1.5 text-right">
        Points only · No gambling · No real money involvement
      </p>
    </section>
  );
}
