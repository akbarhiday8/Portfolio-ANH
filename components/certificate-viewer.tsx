'use client';

import Image from 'next/image';
import { Minus, Move, Plus, RotateCcw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type Position = { x: number; y: number };
type ZoomMode = 'in' | 'out' | null;

const clampScale = (value: number) => Math.min(4, Math.max(1, Number(value.toFixed(2))));

export function CertificateViewer({ src, alt }: { src: string; alt: string }) {
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
    if (event.ctrlKey || zoomMode === 'out') return setZoom(scale - 0.5);
    if (event.shiftKey || zoomMode === 'in' || scale < 4) setZoom(scale + 0.5);
  };

  const viewerClassName = [
    'certificate-viewer', `is-${orientation}`,
    zoomMode === 'in' ? 'is-zoom-in' : '', zoomMode === 'out' ? 'is-zoom-out' : '',
    !zoomMode && scale === 1 ? 'can-zoom' : '', !zoomMode && scale > 1 ? 'can-pan' : '', dragging ? 'is-dragging' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className="certificate-viewer-shell">
      <button type="button" className={viewerClassName} onClick={handleClick} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={endDrag} onPointerCancel={endDrag} aria-label="Pratinjau sertifikat. Klik untuk memperbesar, Ctrl dan klik untuk memperkecil, lalu seret untuk menggeser.">
        <Image className="certificate-viewer-backdrop" src={src} fill sizes="90vw" alt="" aria-hidden="true" />
        <Image className="certificate-viewer-image" src={src} fill sizes="90vw" alt={alt} draggable={false} onLoad={(event) => setOrientation(event.currentTarget.naturalHeight > event.currentTarget.naturalWidth ? 'portrait' : 'landscape')} style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${scale})` }} />
      </button>
      <div className="certificate-viewer-toolbar" aria-label="Kontrol gambar sertifikat">
        <button type="button" onClick={() => setZoom(scale - 0.25)} disabled={scale === 1} aria-label="Perkecil gambar"><Minus size={17} /></button>
        <output aria-label="Tingkat pembesaran">{Math.round(scale * 100)}%</output>
        <button type="button" onClick={() => setZoom(scale + 0.25)} disabled={scale === 4} aria-label="Perbesar gambar"><Plus size={17} /></button>
        <button type="button" onClick={reset} disabled={scale === 1 && position.x === 0 && position.y === 0} aria-label="Atur ulang gambar"><RotateCcw size={16} /></button>
      </div>
      <p className="certificate-viewer-hint"><Move size={14} /> Klik untuk memperbesar · Ctrl + klik untuk memperkecil · seret setelah diperbesar</p>
    </div>
  );
}
