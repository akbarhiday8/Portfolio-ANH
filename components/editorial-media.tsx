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
  caption,
  priority = false,
}: {
  src: string;
  alt: string;
  caption?: string;
  priority?: boolean;
}) {
  const [shape, setShape] = useState<MediaShape>('landscape');

  return (
    <figure className={`editorial-media is-${shape}`}>
      <div className="editorial-media-stage">
        <Image
          src={src}
          fill
          preload={priority}
          sizes={shape === 'portrait' || shape === 'tall' ? '(max-width: 850px) 76vw, 460px' : '(max-width: 850px) 100vw, 58vw'}
          alt={alt}
          onLoad={(event) => setShape(mediaShape(event.currentTarget.naturalWidth, event.currentTarget.naturalHeight))}
        />
      </div>
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}
