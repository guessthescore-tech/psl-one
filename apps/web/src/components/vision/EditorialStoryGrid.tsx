'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { type VisionMediaStory, visionImg } from '@/lib/vision-data';

interface StoryCardProps {
  story: VisionMediaStory;
  featured?: boolean;
  index: number;
}

function StoryCard({ story, featured = false, index }: StoryCardProps) {
  const reduce = useReducedMotion();
  const imgH = featured ? 320 : 180;

  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.45, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      className={`rounded-card overflow-hidden border border-[#e8eaf0] bg-white shadow-card group motion-safe:hover:shadow-card-md motion-safe:transition-shadow ${
        featured ? 'col-span-2' : ''
      }`}
    >
      <div className="relative overflow-hidden" style={{ height: imgH }}>
        <img
          src={visionImg(story.imageKey, featured ? 800 : 400, imgH)}
          alt=""
          className="w-full h-full object-cover motion-safe:group-hover:scale-105 motion-safe:transition-transform motion-safe:duration-500"
        />
        {/* Category label */}
        <div className="absolute top-3 left-3">
          <span className="bg-psl-navy/80 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-pill backdrop-blur-sm">
            {story.category}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className={`font-bold text-psl-navy leading-snug line-clamp-2 motion-safe:group-hover:text-psl-green motion-safe:transition-colors ${featured ? 'text-base' : 'text-sm'}`}>
          {story.title}
        </h3>
        <div className="flex items-center gap-3 mt-2 text-[10px] text-psl-muted">
          <time dateTime={story.publishedAt}>
            {new Date(story.publishedAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}
          </time>
          <span>{story.readTime} min read</span>
        </div>
      </div>
    </motion.article>
  );
}

interface EditorialStoryGridProps {
  stories: VisionMediaStory[];
}

export function EditorialStoryGrid({ stories }: EditorialStoryGridProps) {
  const [featured, ...rest] = stories;

  return (
    <section aria-label="Latest stories" className="py-8 px-6">
      <h2 className="text-display-sm text-psl-navy mb-5">Latest</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {featured && <StoryCard story={featured} featured index={0} />}
        {rest.slice(0, 3).map((s, i) => (
          <StoryCard key={s.id} story={s} index={i + 1} />
        ))}
      </div>
    </section>
  );
}
