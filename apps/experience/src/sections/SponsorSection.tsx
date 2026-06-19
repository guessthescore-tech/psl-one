import { SponsorMoment } from '@/components/ui/SponsorMoment';

export function SponsorSection() {
  return (
    <section
      className="bg-exp-surface py-6"
      aria-label="Sponsor activation"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <SponsorMoment
          sponsorName="DStv"
          sponsorTagline="Live football, every match, on DStv"
          imageKey="dstv-sponsor-wc2026-matchday"
        />
      </div>
    </section>
  );
}
