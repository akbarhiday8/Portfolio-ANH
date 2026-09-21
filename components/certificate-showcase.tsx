'use client';

import Image from 'next/image';
import { ExternalLink, Expand, FileBadge2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { CertificateViewer } from '@/components/certificate-viewer';

export type CertificatePage = {
  src: string;
  label: string;
};

export function CertificateShowcase({ pages, alt, status = '' }: { pages: CertificatePage[]; alt: string; status?: string }) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const activePage = pages[activeIndex] ?? pages[0];

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

  if (!activePage) return null;

  return (
    <>
      <figure className="certificate-showcase">
        <header>
          <span><FileBadge2 size={16} /> Sertifikat</span>
          <span className="certificate-showcase-tools">
            <span className="certificate-page-count">{pages.length} halaman</span>
            {status ? <span className="certificate-status">{status}</span> : null}
            <button type="button" onClick={() => setOpen(true)} aria-label={`Buka ${alt} dalam layar penuh`}><Expand size={15} /> Layar penuh</button>
          </span>
        </header>
        <CertificateViewer key={activePage.src} src={activePage.src} alt={`${alt} — ${activePage.label}`} />
        {pages.length > 1 ? <nav className="certificate-page-selector" aria-label="Pilih halaman sertifikat">
          {pages.map((page, index) => <button
            type="button"
            className={index === activeIndex ? 'is-active' : ''}
            aria-current={index === activeIndex ? 'page' : undefined}
            aria-label={`Tampilkan halaman ${index + 1}: ${page.label}`}
            onClick={() => setActiveIndex(index)}
            key={`${page.src}-${index}`}
          >
            <span className="certificate-page-thumbnail"><Image src={page.src} fill sizes="72px" alt="" /></span>
            <span><small>Halaman {index + 1}</small><strong>{page.label}</strong></span>
          </button>)}
        </nav> : null}
        <div className="certificate-showcase-actions">
          <span>{activePage.label}</span>
          <a href={activePage.src} target="_blank" rel="noreferrer"><ExternalLink size={15} />Buka di tab baru</a>
        </div>
      </figure>

      {open ? (
        <dialog className="certificate-lightbox" open aria-label={`Pratinjau ${alt}`}>
          <button className="certificate-lightbox-backdrop" type="button" onClick={() => setOpen(false)} aria-label="Tutup pratinjau sertifikat" />
          <div className="certificate-lightbox-panel">
            <button ref={closeButtonRef} className="certificate-lightbox-close" type="button" onClick={() => setOpen(false)} aria-label="Tutup pratinjau sertifikat"><X size={18} /></button>
            <CertificateViewer key={`lightbox-${activePage.src}`} src={activePage.src} alt={`${alt} — ${activePage.label}`} />
          </div>
        </dialog>
      ) : null}
    </>
  );
}
