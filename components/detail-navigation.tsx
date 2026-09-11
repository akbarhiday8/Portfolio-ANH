'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';

const links = [
  { id: 'home', href: '/', label: 'Beranda', note: 'Halaman utama' },
  { id: 'about', href: '/#about', label: 'Tentang', note: 'Profil singkat' },
  { id: 'education', href: '/#education', label: 'Pendidikan', note: 'Fondasi belajar' },
  { id: 'experience', href: '/#experience', label: 'Pengalaman', note: 'Perjalanan profesional' },
  { id: 'work', href: '/#work', label: 'Portfolio', note: 'Karya dan studi kasus' },
  { id: 'certificates', href: '/#certificates', label: 'Sertifikasi', note: 'Kompetensi tervalidasi' },
  { id: 'article', href: '/artikel', label: 'Artikel', note: 'Catatan dan wawasan' },
  { id: 'contact', href: '/#contact', label: 'Kontak', note: 'Mari terhubung' },
] as const;

export function DetailNavigation({ activePage }: { activePage: 'article' | 'work' }) {
  const [open, setOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    closeButtonRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      triggerRef.current?.focus();
    };
  }, [open]);

  return (
    <>
      <button ref={triggerRef} className="detail-menu-trigger" type="button" aria-expanded={open} aria-controls="detail-navigation-panel" onClick={() => setOpen(true)}>
        <span>Menu</span><Menu size={18} />
      </button>
      <div className={`detail-nav-layer${open ? ' is-open' : ''}`} aria-hidden={!open} onMouseDown={(event) => event.target === event.currentTarget && setOpen(false)}>
        <section className="detail-nav-panel" id="detail-navigation-panel" role="dialog" aria-modal="true" aria-label="Navigasi halaman">
          <header>
            <div><small>Navigasi</small><p>Jelajahi portfolio</p></div>
            <button ref={closeButtonRef} type="button" onClick={() => setOpen(false)} aria-label="Tutup navigasi"><X size={19} /></button>
          </header>
          <nav aria-label="Navigasi halaman dalam">
            {links.map((link) => (
              <a className={activePage === link.id ? 'active' : ''} href={link.href} key={link.id} onClick={() => setOpen(false)}>
                <span><strong>{link.label}</strong><small>{link.note}</small></span><ArrowUpRight size={16} />
              </a>
            ))}
          </nav>
        </section>
      </div>
    </>
  );
}
