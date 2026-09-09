'use client';

import { useEffect, useState } from 'react';
import { Menu } from 'lucide-react';
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

const links = [
  { id: 'top', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'work', label: 'Portfolio' },
  { id: 'certificates', label: 'Certificates' },
  { id: 'contact', label: 'Contact' },
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
      <nav className="desktop-nav" aria-label="Primary navigation">
        {links.map((link) => (
          <a className={active === link.id ? 'active' : ''} href={`#${link.id}`} key={link.id}>{link.label}</a>
        ))}
      </nav>
      <div className="mobile-nav">
        <Sheet>
          <SheetTrigger className="menu-trigger" aria-label="Open navigation"><Menu size={19} /></SheetTrigger>
          <SheetContent className="mobile-sheet" showCloseButton side="right">
            <SheetTitle className="sheet-title">Index / 2026</SheetTitle>
            <nav aria-label="Mobile navigation">
              {links.map((link, index) => (
                <SheetClose key={link.id} render={<a href={`#${link.id}`} />}>
                  <span>{String(index + 1).padStart(2, '0')}</span>{link.label}
                </SheetClose>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
