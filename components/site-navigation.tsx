'use client';

import { useEffect, useState } from 'react';
import { Menu } from 'lucide-react';
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

const primaryLinks = [
  { id: 'top', label: 'Beranda' },
  { id: 'about', label: 'Tentang' },
  { id: 'journey', label: 'Perjalanan' },
  { id: 'experience', label: 'Pengalaman' },
  { id: 'work', label: 'Karya' },
  { id: 'certificates', label: 'Sertifikasi' },
];

const mobileLinks = [
  ...primaryLinks,
  { id: 'contact', label: 'Kontak' },
];

export function SiteNavigation() {
  const [active, setActive] = useState('top');

  useEffect(() => {
    const sections = mobileLinks.map(({ id }) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const observer = new IntersectionObserver(
      (entries) => {
        if (window.scrollY <= 96) {
          setActive('top');
          return;
        }
        const current = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (current) setActive(current.target.id);
      },
      { rootMargin: '-25% 0px -60% 0px', threshold: [0, 0.15, 0.4] },
    );

    const syncTopNavigation = (event?: MouseEvent) => {
      const target = event?.target;
      const topLink = target instanceof Element ? target.closest('a[href="#top"]') : null;
      if (topLink || window.scrollY <= 96) setActive('top');
    };

    sections.forEach((section) => observer.observe(section));
    window.addEventListener('scroll', syncTopNavigation, { passive: true });
    document.addEventListener('click', syncTopNavigation);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', syncTopNavigation);
      document.removeEventListener('click', syncTopNavigation);
    };
  }, []);

  return (
    <>
      <nav className="desktop-nav" aria-label="Navigasi utama">
        {primaryLinks.map((link) => (
          <a className={active === link.id ? 'active' : ''} href={`#${link.id}`} key={link.id} onClick={() => setActive(link.id)}>{link.label}</a>
        ))}
      </nav>
      <div className="mobile-nav">
        <Sheet>
          <SheetTrigger className="menu-trigger" aria-label="Buka navigasi"><Menu size={19} /></SheetTrigger>
          <SheetContent className="mobile-sheet" showCloseButton side="right">
            <SheetTitle className="sheet-title">Navigasi / 2026</SheetTitle>
            <nav aria-label="Navigasi seluler">
              {mobileLinks.map((link) => (
                <SheetClose key={link.id} render={<a href={`#${link.id}`} onClick={() => setActive(link.id)} />}>
                  {link.label}
                </SheetClose>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
