'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { BarChart3, Eye, FileBadge2, Maximize2, Minus, Monitor, Move, Plus, RotateCcw, ShieldCheck, X } from 'lucide-react';

type CertificateItem = {
  name: string;
  issuer: string;
  year: string;
  category: string;
  image: string | null;
  description: string;
  topics: readonly string[];
};

type Position = { x: number; y: number };
type ZoomMode = 'in' | 'out' | null;

const certificateIcons = [Monitor, ShieldCheck, BarChart3, FileBadge2];
const clampScale = (value: number) => Math.min(4, Math.max(1, Number(value.toFixed(2))));

function CertificateTopics({ topics }: { topics: readonly string[] }) {
  const limit = 6;
  const [expanded, setExpanded] = useState(false);
  const hasMore = topics.length > limit;
  const visibleTopics = expanded ? topics : topics.slice(0, limit);

  return (
    <div className="certificate-topics">
      <div className="certificate-topics-heading">
        <h4>Materi yang dipelajari / diujikan</h4>
        <span>{topics.length} materi</span>
      </div>
      <ul>{visibleTopics.map((topic) => <li key={topic}>{topic}</li>)}</ul>
      {hasMore ? (
        <button className="certificate-topics-toggle" type="button" aria-expanded={expanded} onClick={() => setExpanded((value) => !value)}>
          {expanded ? 'Tampilkan lebih sedikit' : `Lihat ${topics.length - limit} materi lainnya`}
        </button>
      ) : null}
    </div>
  );
}

function CertificateViewer({ src, alt }: { src: string; alt: string }) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [zoomMode, setZoomMode] = useState<ZoomMode>(null);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape');
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ pointerId: number; startX: number; startY: number; origin: Position; moved: boolean } | null>(null);
  const suppressClick = useRef(false);

  useEffect(() => {
    const syncModifier = (event: KeyboardEvent) => setZoomMode(event.shiftKey ? 'in' : event.ctrlKey ? 'out' : null);
    const clearModifier = () => setZoomMode(null);
    window.addEventListener('keydown', syncModifier);
    window.addEventListener('keyup', syncModifier);
    window.addEventListener('blur', clearModifier);
    return () => {
      window.removeEventListener('keydown', syncModifier);
      window.removeEventListener('keyup', syncModifier);
      window.removeEventListener('blur', clearModifier);
    };
  }, []);

  const setZoom = (nextScale: number) => {
    const value = clampScale(nextScale);
    setScale(value);
    if (value === 1) setPosition({ x: 0, y: 0 });
  };

  const reset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0 || scale === 1 || zoomMode || event.shiftKey || event.ctrlKey) return;
    suppressClick.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, origin: position, moved: false };
    setDragging(true);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!drag.current || drag.current.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - drag.current.startX;
    const deltaY = event.clientY - drag.current.startY;
    if (Math.abs(deltaX) + Math.abs(deltaY) > 3) {
      drag.current.moved = true;
      suppressClick.current = true;
    }
    setPosition({ x: drag.current.origin.x + deltaX, y: drag.current.origin.y + deltaY });
  };

  const endDrag = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (drag.current?.pointerId === event.pointerId && event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    drag.current = null;
    setDragging(false);
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    if (event.ctrlKey || zoomMode === 'out') {
      setZoom(scale - 0.5);
      return;
    }
    if (event.shiftKey || zoomMode === 'in' || scale < 4) setZoom(scale + 0.5);
  };

  const viewerClassName = [
    'certificate-viewer',
    `is-${orientation}`,
    zoomMode === 'in' ? 'is-zoom-in' : '',
    zoomMode === 'out' ? 'is-zoom-out' : '',
    !zoomMode && scale === 1 ? 'can-zoom' : '',
    !zoomMode && scale > 1 ? 'can-pan' : '',
    dragging ? 'is-dragging' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className="certificate-viewer-shell">
      <button
        type="button"
        className={viewerClassName}
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        aria-label="Preview sertifikat. Klik untuk memperbesar, Ctrl dan klik untuk memperkecil, lalu seret untuk menggeser."
      >
        <Image className="certificate-viewer-backdrop" src={src} fill sizes="90vw" alt="" aria-hidden="true" />
        <Image
          className="certificate-viewer-image"
          src={src}
          fill
          sizes="90vw"
          alt={alt}
          draggable={false}
          onLoad={(event) => setOrientation(event.currentTarget.naturalHeight > event.currentTarget.naturalWidth ? 'portrait' : 'landscape')}
          style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${scale})` }}
        />
      </button>
      <div className="certificate-viewer-toolbar" aria-label="Kontrol gambar sertifikat">
        <button type="button" onClick={() => setZoom(scale - 0.25)} disabled={scale === 1} aria-label="Perkecil gambar"><Minus size={17} /></button>
        <output aria-label="Tingkat pembesaran">{Math.round(scale * 100)}%</output>
        <button type="button" onClick={() => setZoom(scale + 0.25)} disabled={scale === 4} aria-label="Perbesar gambar"><Plus size={17} /></button>
        <button type="button" onClick={reset} disabled={scale === 1 && position.x === 0 && position.y === 0} aria-label="Atur ulang gambar"><RotateCcw size={16} /></button>
      </div>
      <p className="certificate-viewer-hint"><Move size={14} /> Klik: perbesar · Ctrl + klik: perkecil · setelah diperbesar, tahan klik kiri lalu seret</p>
    </div>
  );
}

export function CertificateGallery({ items }: { items: readonly CertificateItem[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const activeItem = activeIndex === null ? null : items[activeIndex];

  useEffect(() => {
    if (!activeItem) return;
    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveIndex(null);
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    closeButtonRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [activeItem]);

  return (
    <>
      <div className="certificate-grid" id="certificates-heading">
        {items.map((item, index) => {
          const Icon = certificateIcons[index] ?? FileBadge2;
          return (
            <button className="certificate-card" type="button" aria-label={`Lihat detail ${item.name}`} onClick={() => setActiveIndex(index)} key={item.name}>
              <span className={`certificate-preview${item.image ? ' has-image' : ''}`} aria-hidden="true">
                {item.image ? (
                  <Image src={item.image} fill sizes="(max-width: 520px) 100vw, (max-width: 850px) 50vw, 20vw" alt="" />
                ) : (
                  <span className="certificate-paper">
                    <Icon size={38} strokeWidth={1.3} />
                    <i>Arsip sertifikat</i>
                  </span>
                )}
                <span className="certificate-view"><Eye size={15} /> Lihat detail</span>
              </span>
              <span className="certificate-details">
                <span className="certificate-category">{item.category}</span>
                <strong>{item.name}</strong>
                <span className="certificate-issuer">{item.issuer}</span>
                <span className="certificate-year">{item.year}<Maximize2 size={15} /></span>
              </span>
            </button>
          );
        })}
      </div>

      {activeItem && activeIndex !== null ? (
        <dialog className="certificate-modal" open aria-labelledby="certificate-dialog-title" aria-describedby="certificate-dialog-description">
          <button className="certificate-modal-dismiss" type="button" aria-label="Tutup detail sertifikat" onClick={() => setActiveIndex(null)} />
          <section className="certificate-dialog">
            <button ref={closeButtonRef} className="certificate-dialog-close" type="button" onClick={() => setActiveIndex(null)} aria-label="Tutup detail sertifikat"><X size={18} /></button>
              <div className="certificate-dialog-preview">
                {activeItem.image ? (
                  <CertificateViewer src={activeItem.image} alt={`Bukti ${activeItem.name}`} />
                ) : (
                  <div className="certificate-dialog-placeholder">
                    {(() => {
                      const ActiveIcon = certificateIcons[activeIndex] ?? FileBadge2;
                      return <ActiveIcon size={58} strokeWidth={1.1} />;
                    })()}
                    <span>Bukti sertifikat belum ditambahkan</span>
                    <small>Kontrol zoom dan geser akan aktif otomatis setelah gambar tersedia.</small>
                  </div>
                )}
              </div>
              <div className="certificate-dialog-copy">
                <span className="certificate-category">{activeItem.category}</span>
                <h2 id="certificate-dialog-title">{activeItem.name}</h2>
                <p id="certificate-dialog-description">{activeItem.description}</p>
                <dl className="certificate-facts">
                  <div><dt>Diterbitkan oleh</dt><dd>{activeItem.issuer}</dd></div>
                  <div><dt>Tahun</dt><dd>{activeItem.year}</dd></div>
                </dl>
                <CertificateTopics key={activeItem.name} topics={activeItem.topics} />
              </div>
          </section>
        </dialog>
      ) : null}
    </>
  );
}
