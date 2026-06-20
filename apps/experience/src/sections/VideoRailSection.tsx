import type { ExperienceData } from '@/lib/data';
import { VideoCard } from '@/components/ui/VideoCard';
import { SectionHeader } from '@/components/ui/SectionHeader';

interface VideoRailSectionProps {
  data: ExperienceData;
}

export function VideoRailSection({ data }: VideoRailSectionProps) {
  if (!data.videos.length) return null;

  return (
    <section
      className="bg-exp-navy py-10"
      aria-label="Video highlights"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-5">
        <SectionHeader
          title="Highlights"
          subtitle="Watch the best moments"
          dark
          href="/media"
          linkLabel="All videos"
        />
      </div>

      {/* Full-bleed scroll rail */}
      <div
        className="flex gap-4 overflow-x-auto scrollbar-none snap-rail pl-4 sm:pl-6 lg:pl-8 pr-4"
        role="list"
        aria-label="Video cards"
      >
        {data.videos.map(video => (
          <div key={video.id} role="listitem">
            <VideoCard video={video} />
          </div>
        ))}
        <div className="w-4 flex-shrink-0" aria-hidden />
      </div>
    </section>
  );
}
