'use client';

import Image from 'next/image';
import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { expImg } from '@/lib/data';
import type { ExpVideo } from '@/lib/data';

interface VideoPlayerShellProps {
  video: ExpVideo;
  isDesignReview?: boolean;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function VideoPlayerShell({ video, isDesignReview = true }: VideoPlayerShellProps) {
  const reduce = useReducedMotion();
  const [attempted, setAttempted] = useState(false);

  return (
    <div aria-label={video.title}>
      {/* Player area */}
      <div className="relative aspect-video bg-exp-void rounded-card overflow-hidden border border-exp-border-dk shadow-card-lg">
        <Image
          src={expImg(video.thumbnailKey, 800, 450)}
          alt={video.title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, 800px"
          priority
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-exp-void/50" aria-hidden />

        {/* Play button */}
        <button
          type="button"
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 group focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2"
          aria-label={`Play ${video.title}`}
          onClick={() => setAttempted(true)}
        >
          <motion.div
            whileHover={reduce ? undefined : { scale: 1.08 }}
            whileTap={reduce ? undefined : { scale: 0.96 }}
            className="w-16 h-16 rounded-full bg-exp-gold/90 flex items-center justify-center shadow-glow-gold group-hover:bg-exp-gold transition-colors"
          >
            <svg
              className="w-7 h-7 text-exp-void ml-1"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </motion.div>
          <span className="text-label-md text-white/80 font-bold">
            {formatDuration(video.durationSeconds)}
          </span>
        </button>

        {/* Category pill */}
        <div className="absolute top-3 left-3">
          <span className="bg-exp-ink/90 border border-exp-border-dk text-exp-muted text-label-sm font-bold px-2.5 py-1 rounded-pill">
            {video.category}
          </span>
        </div>

        {/* Design review notice overlay */}
        <AnimatePresence>
          {attempted && isDesignReview && (
            <motion.div
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-exp-void/90 flex flex-col items-center justify-center gap-3 p-6 text-center"
              role="alert"
            >
              <span className="text-3xl" aria-hidden>🎬</span>
              <div className="text-display-sm text-white font-black">Video unavailable</div>
              <p className="text-body-sm text-exp-muted max-w-xs">
                Video player requires a live data connection.
                This is a design review — switch to LIVE_BETA_DATA to stream content.
              </p>
              <button
                type="button"
                onClick={() => setAttempted(false)}
                className="mt-2 text-label-md text-exp-gold underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2"
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Video meta */}
      <div className="mt-4 space-y-1">
        <h1 className="text-display-sm text-exp-navy font-black leading-tight">{video.title}</h1>
        <div className="flex items-center gap-3 text-label-sm text-exp-muted">
          <span>{video.category}</span>
          <span aria-hidden>·</span>
          <span>{formatDuration(video.durationSeconds)}</span>
          <span aria-hidden>·</span>
          <span>PSL One Media</span>
        </div>
      </div>
    </div>
  );
}
