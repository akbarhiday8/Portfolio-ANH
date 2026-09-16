'use client';

import Image from 'next/image';
import { useState } from 'react';

type MediaShape = 'landscape' | 'ultrawide' | 'portrait' | 'tall' | 'square';

function mediaShape(width: number, height: number): MediaShape {
  const ratio = width / height;
  if (ratio >= 2.15) return 'ultrawide';
  if (ratio >= 1.15) return 'landscape';
  if (ratio <= 0.62) return 'tall';
  if (ratio <= 0.86) return 'portrait';
  return 'square';
}

export function EditorialMedia({
  src,
  alt,
  label = 'Project view',
  caption,
  priority = false,
}: {
  src: string;
  alt: string;
  label?: string;
  caption?: string;
  priority?: boolean;
}) {
  const [shape, setShape] = useState<MediaShape>('landscape');

  return (
    <figure className={`editorial-media is-${shape}`}>
      <div className="editorial-media-heading"><span>{label}</span><i aria-hidden="true" /></div>
      <div className="editorial-media-stage">
        <Image
          src={src}
          fill
          priority={priority}
          sizes={shape === 'portrait' || shape === 'tall' ? '(max-width: 640px) 86vw, 520px' : '(max-width: 900px) 92vw, 1180px'}
          alt={alt}
          onLoad={(event) => setShape(mediaShape(event.currentTarget.naturalWidth, event.currentTarget.naturalHeight))}
        />
      </div>
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}
