'use client';

import Image from 'next/image';
import { useState } from 'react';

const TYPE_GRADIENT: Record<string, string> = {
  VIDEO:   'from-psl-navy to-[#312e81]',
  ARTICLE: 'from-psl-navy to-psl-green',
  GALLERY: 'from-[#1b3a6b] to-[#5b21b6]',
  PODCAST: 'from-[#164e63] to-psl-navy',
  LIVE:    'from-psl-live to-[#7f1d1d]',
};

const TYPE_ICON: Record<string, string> = {
  VIDEO:   '▶',
  ARTICLE: '✦',
  GALLERY: '⊞',
  PODCAST: '♫',
  LIVE:    '●',
};

interface MediaThumbnailProps {
  title: string;
  mediaType: string;
  imageUrl?: string | null;
  className?: string;
  height?: string;
}

/**
 * Renders a media thumbnail.
 * Uses imageUrl via Next.js Image if available; falls back to gradient + media type badge.
 */
export function MediaThumbnail({
  title,
  mediaType,
  imageUrl,
  className = '',
  height = 'h-36',
}: MediaThumbnailProps) {
  const [imgError, setImgError] = useState(false);
  const type = mediaType.toUpperCase();
  const gradient = TYPE_GRADIENT[type] ?? TYPE_GRADIENT.ARTICLE;
  const icon = TYPE_ICON[type] ?? '✦';

  if (imageUrl && !imgError) {
    return (
      <div className={`relative overflow-hidden rounded-card-sm ${height} ${className}`}>
        <Image
          src={imageUrl}
          fill
          alt={title}
          className="object-cover"
          onError={() => setImgError(true)}
          unoptimized
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <span className="absolute top-2.5 left-2.5 text-[9px] font-black text-white uppercase tracking-widest bg-black/40 px-1.5 py-0.5 rounded-full">
          {type}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-card-sm ${height} bg-gradient-to-br ${gradient} flex flex-col items-center justify-center gap-1 ${className}`}
      role="img"
      aria-label={`${type}: ${title}`}
    >
      <span className="text-2xl text-white/50 leading-none" aria-hidden>{icon}</span>
      <span className="text-[9px] font-black text-white/50 uppercase tracking-widest">{type}</span>
    </div>
  );
}
