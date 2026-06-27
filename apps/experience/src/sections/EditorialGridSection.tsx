import type { ExpStory } from '@/lib/data';
import { EditorialStory } from '@/components/ui/EditorialStory';
import { SectionHeader } from '@/components/ui/SectionHeader';

interface EditorialGridSectionProps {
  stories: ExpStory[];
}

export function EditorialGridSection({ stories }: EditorialGridSectionProps) {
  const [featured, ...rest] = stories;
  if (!featured) return null;

  return (
    <section
      className="bg-white py-12"
      aria-label="Latest news and stories"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Latest"
          subtitle="News and editorial"
          href="/media"
          linkLabel="All stories"
        />

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Featured story - left col, full height */}
          <div>
            <EditorialStory story={featured} featured />
          </div>

          {/* 4 compact stories - right col, 2x2 grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {rest.slice(0, 4).map(story => (
              <EditorialStory key={story.id} story={story} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
