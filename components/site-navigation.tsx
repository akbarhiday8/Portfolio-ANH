'use client';

import { useEffect, useState } from 'react';
import { Menu } from 'lucide-react';
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

const links = [
  { id: 'top', label: 'Beranda' },
  { id: 'about', label: 'Tentang' },
  { id: 'experience', label: 'Pengalaman' },
  { id: 'work', label: 'Portofolio' },
  { id: 'certificates', label: 'Sertifikat' },
  { id: 'contact', label: 'Kontak' },
];

export function SiteNavigation() {
  const [active, setActive] = useState('top');

  useEffect(() => {
    const sections = links.map(({ id }) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const observer = new IntersectionObserver(
      (entries) => {
        const current = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (current) setActive(current.target.id);
      },
      { rootMargin: '-25% 0px -60% 0px', threshold: [0, 0.15, 0.4] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <nav className="desktop-nav" aria-label="Navigasi utama">
        {links.map((link) => (
          <a className={active === link.id ? 'active' : ''} href={`#${link.id}`} key={link.id}>{link.label}</a>
        ))}
      </nav>
      <div className="mobile-nav">
        <Sheet>
          <SheetTrigger className="menu-trigger" aria-label="Buka navigasi"><Menu size={19} /></SheetTrigger>
          <SheetContent className="mobile-sheet" showCloseButton side="right">
            <SheetTitle className="sheet-title">Navigasi / 2026</SheetTitle>
            <nav aria-label="Navigasi seluler">
              {links.map((link) => (
                <SheetClose key={link.id} render={<a href={`#${link.id}`} />}>
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
