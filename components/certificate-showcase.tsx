'use client';

import { ExternalLink, Expand, FileBadge2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { CertificateViewer } from '@/components/certificate-viewer';

export function CertificateShowcase({ src, alt, status = '' }: { src: string; alt: string; status?: string }) {
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

  return (
    <>
      <figure className="certificate-showcase">
        <header>
          <span><FileBadge2 size={16} /> Sertifikat</span>
          <span className="certificate-showcase-tools">
            {status ? <span className="certificate-status">{status}</span> : null}
            <button type="button" onClick={() => setOpen(true)} aria-label={`Buka ${alt} dalam layar penuh`}><Expand size={15} /> Layar penuh</button>
          </span>
        </header>
        <CertificateViewer src={src} alt={alt} />
        <div className="certificate-showcase-actions">
          <span>Gunakan kontrol zoom atau buka dokumen asli.</span>
          <a href={src} target="_blank" rel="noreferrer"><ExternalLink size={15} />Buka di tab baru</a>
        </div>
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
