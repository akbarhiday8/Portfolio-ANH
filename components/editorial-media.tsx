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
  priority = false,
  browserFrame = false,
  address = '',
}: {
  src: string;
  alt: string;
  priority?: boolean;
  browserFrame?: boolean;
  address?: string;
}) {
  const [shape, setShape] = useState<MediaShape>('landscape');
  const [ratio, setRatio] = useState(16 / 9);

  return (
    <figure className={`editorial-media is-${shape}${browserFrame ? ' has-browser-frame' : ''}`}>
      {browserFrame ? <div className="editorial-browser-bar" aria-hidden="true"><span className="editorial-browser-dots"><i /><i /><i /></span><span>{address || 'Pratinjau website'}</span></div> : null}
      <div className="editorial-media-stage" style={{ aspectRatio: ratio }}>
        <Image
          src={src}
          fill
          preload={priority}
          sizes={shape === 'portrait' || shape === 'tall' ? '(max-width: 850px) 85vw, 410px' : '(max-width: 850px) 92vw, 54vw'}
          alt={alt}
          onLoad={(event) => {
            const { naturalWidth, naturalHeight } = event.currentTarget;
            if (!naturalWidth || !naturalHeight) return;
            setShape(mediaShape(naturalWidth, naturalHeight));
            setRatio(naturalWidth / naturalHeight);
          }}
        />
      </div>
    </figure>
  );
}
