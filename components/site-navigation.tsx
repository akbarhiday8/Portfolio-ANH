'use client';

import { useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';

const primaryLinks = [
  { id: 'top', href: '#top', label: 'Beranda' },
  { id: 'about', href: '#about', label: 'Tentang' },
  { id: 'education', href: '#education', label: 'Pendidikan' },
  { id: 'experience', href: '#experience', label: 'Pengalaman' },
  { id: 'work', href: '#work', label: 'Portfolio' },
  { id: 'certificates', href: '#certificates', label: 'Sertifikasi' },
  { id: null, href: '/artikel', label: 'Artikel' },
];

const mobileLinks = [
  ...primaryLinks,
  { id: 'contact', href: '#contact', label: 'Kontak' },
];

export function SiteNavigation() {
  const [active, setActive] = useState('top');
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const sections = mobileLinks.map(({ id }) => id ? document.getElementById(id) : null).filter(Boolean) as HTMLElement[];
    let frame = 0;

    const syncNavigation = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const marker = window.scrollY + 118;
        let current = 'top';
        for (const section of sections) {
          if (section.offsetTop <= marker) current = section.id;
          else break;
        }
        setActive(current);
      });
    };

    syncNavigation();
    window.addEventListener('scroll', syncNavigation, { passive: true });
    window.addEventListener('resize', syncNavigation);
    window.addEventListener('hashchange', syncNavigation);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', syncNavigation);
      window.removeEventListener('resize', syncNavigation);
      window.removeEventListener('hashchange', syncNavigation);
    };
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    closeButtonRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileOpen]);

  const closeMobileNavigation = () => setMobileOpen(false);

  return (
    <>
      <nav className="desktop-nav" aria-label="Navigasi utama">
        {primaryLinks.map((link) => (
          <a className={link.id && active === link.id ? 'active' : ''} href={link.href} key={link.href} onClick={() => link.id && setActive(link.id)}>{link.label}</a>
        ))}
      </nav>

      <div className="mobile-nav">
        <button className="menu-trigger" type="button" aria-label="Buka navigasi" aria-expanded={mobileOpen} onClick={() => setMobileOpen(true)}><Menu size={19} /></button>
        <div className={`mobile-nav-overlay${mobileOpen ? ' is-open' : ''}`} aria-hidden={!mobileOpen} onMouseDown={(event) => event.target === event.currentTarget && closeMobileNavigation()}>
          <aside className="mobile-sheet" role="dialog" aria-modal="true" aria-label="Navigasi seluler">
            <p className="sheet-title">Navigasi / 2026</p>
            <button ref={closeButtonRef} className="mobile-nav-close" type="button" onClick={closeMobileNavigation} aria-label="Tutup navigasi"><X size={19} /></button>
            <nav>
              {mobileLinks.map((link) => (
                <a href={link.href} key={link.href} onClick={() => { if (link.id) setActive(link.id); closeMobileNavigation(); }}>{link.label}</a>
              ))}
            </nav>
          </aside>
        </div>
      </div>
    </>
  );
}
