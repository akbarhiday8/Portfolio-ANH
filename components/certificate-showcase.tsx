'use client';

import Image from 'next/image';
import { Expand, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { CertificateViewer } from '@/components/certificate-viewer';

export function CertificateShowcase({ src, alt }: { src: string; alt: string }) {
  const [open, setOpen] = useState(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape');
  const [ratio, setRatio] = useState(1.4);
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

  return (
    <>
      <figure className={`certificate-showcase is-${orientation}`}>
        <button type="button" onClick={() => setOpen(true)} aria-label={`Perbesar ${alt}`}>
          <span className="certificate-showcase-stage" style={{ aspectRatio: ratio }}>
            <Image
              src={src}
              fill
              preload
              sizes={orientation === 'portrait' ? '(max-width: 850px) 74vw, 380px' : '(max-width: 850px) 92vw, 52vw'}
              alt={alt}
              onLoad={(event) => {
                const { naturalWidth, naturalHeight } = event.currentTarget;
                if (!naturalWidth || !naturalHeight) return;
                setOrientation(naturalHeight > naturalWidth ? 'portrait' : 'landscape');
                setRatio(naturalWidth / naturalHeight);
              }}
            />
          </span>
        </button>
        <figcaption className="certificate-showcase-hint"><Expand size={14} />Klik gambar untuk memperbesar</figcaption>
      </figure>

      {open ? (
        <dialog className="certificate-lightbox" open aria-label={`Pratinjau ${alt}`}>
          <button className="certificate-lightbox-backdrop" type="button" onClick={() => setOpen(false)} aria-label="Tutup pratinjau sertifikat" />
          <div className="certificate-lightbox-panel">
            <button ref={closeButtonRef} className="certificate-lightbox-close" type="button" onClick={() => setOpen(false)} aria-label="Tutup pratinjau sertifikat"><X size={18} /></button>
            <CertificateViewer src={src} alt={alt} />
          </div>
        </dialog>
      ) : null}
    </>
  );
}
