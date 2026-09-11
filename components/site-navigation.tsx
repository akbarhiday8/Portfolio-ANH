'use client';

import { useEffect, useState } from 'react';
import { Menu } from 'lucide-react';
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

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

  return (
    <>
      <nav className="desktop-nav" aria-label="Navigasi utama">
        {primaryLinks.map((link) => (
          <a className={link.id && active === link.id ? 'active' : ''} href={link.href} key={link.href} onClick={() => link.id && setActive(link.id)}>{link.label}</a>
        ))}
      </nav>
      <div className="mobile-nav">
        <Sheet>
          <SheetTrigger className="menu-trigger" aria-label="Buka navigasi"><Menu size={19} /></SheetTrigger>
          <SheetContent className="mobile-sheet" showCloseButton side="right">
            <SheetTitle className="sheet-title">Navigasi / 2026</SheetTitle>
            <nav aria-label="Navigasi seluler">
              {mobileLinks.map((link) => (
                <SheetClose key={link.href} render={<a href={link.href} aria-label={link.label} onClick={() => link.id && setActive(link.id)} />}>
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
