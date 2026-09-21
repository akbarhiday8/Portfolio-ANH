'use client';

import Image from 'next/image';
import { Expand, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { CertificateViewer } from '@/components/certificate-viewer';

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
  expandable = false,
}: {
  src: string;
  alt: string;
  priority?: boolean;
  browserFrame?: boolean;
  address?: string;
  expandable?: boolean;
}) {
  const [shape, setShape] = useState<MediaShape>('landscape');
  const [ratio, setRatio] = useState(16 / 9);
  const [open, setOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    closeButtonRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [open]);

  const media = (
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
      {expandable ? <span className="editorial-media-expand" aria-hidden="true"><Expand size={15} /></span> : null}
    </div>
  );

  return (
    <>
      <figure className={`editorial-media is-${shape}${browserFrame ? ' has-browser-frame' : ''}${expandable ? ' is-expandable' : ''}`}>
        {browserFrame ? <div className="editorial-browser-bar" aria-hidden="true"><span className="editorial-browser-dots"><i /><i /><i /></span><span>{address || 'Pratinjau website'}</span></div> : null}
        {expandable ? <button type="button" onClick={() => setOpen(true)} aria-label={`Perbesar ${alt}`}>{media}</button> : media}
      </figure>
      {open ? <dialog className="certificate-lightbox" open aria-label={`Pratinjau ${alt}`}>
        <button className="certificate-lightbox-backdrop" type="button" onClick={() => setOpen(false)} aria-label="Tutup pratinjau proyek" />
        <div className="certificate-lightbox-panel">
          <button ref={closeButtonRef} className="certificate-lightbox-close" type="button" onClick={() => setOpen(false)} aria-label="Tutup pratinjau proyek"><X size={18} /></button>
          <CertificateViewer src={src} alt={alt} label="proyek" />
        </div>
      </dialog> : null}
    </>
  );
}
