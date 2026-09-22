'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';

export type NavigationLink = { id: string; href: string; label: string; external?: boolean };

const primaryLinks: NavigationLink[] = [
  { id: 'top', href: '#top', label: 'Beranda' },
  { id: 'about', href: '#about', label: 'Tentang' },
  { id: 'education', href: '#education', label: 'Pendidikan' },
  { id: 'experience', href: '#experience', label: 'Pengalaman' },
  { id: 'work', href: '#work', label: 'Portfolio' },
  { id: 'certificates', href: '#certificates', label: 'Sertifikasi' },
  { id: 'article', href: '/artikel', label: 'Artikel', external: true },
];

const mobileLinks: NavigationLink[] = [
  ...primaryLinks,
  { id: 'contact', href: '#contact', label: 'Kontak' },
];

type SiteNavigationProps = {
  homePrefix?: '' | '/';
  activePage?: 'article' | 'work';
};

type MobileNavigationProps = {
  links: NavigationLink[];
  currentActive: string;
  onNavigate?: (id: string) => void;
  className?: string;
};

export function MobileNavigation({ links, currentActive, onNavigate, className = '' }: MobileNavigationProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLElement>(null);
  const restoreFocusRef = useRef(false);
  const navigationId = useId();

  const closeNavigation = useCallback(() => {
    restoreFocusRef.current = true;
    setMobileOpen(false);
  }, []);

  useEffect(() => {
    if (!mobileOpen) {
      if (restoreFocusRef.current) {
        restoreFocusRef.current = false;
        window.requestAnimationFrame(() => triggerRef.current?.focus({ preventScroll: true }));
      }
      return;
    }
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeNavigation();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = Array.from(sheetRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? []);
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    closeButtonRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeNavigation, mobileOpen]);

  return (
    <div className={`mobile-nav${className ? ` ${className}` : ''}`}>
      <button
        ref={triggerRef}
        className={`menu-trigger${mobileOpen ? ' is-open' : ''}`}
        type="button"
        aria-label="Buka navigasi"
        aria-controls={navigationId}
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen(true)}
      >
        <span className="menu-trigger-glyph" aria-hidden="true"><i /><i /></span>
      </button>
      <dialog id={navigationId} className={`mobile-nav-overlay${mobileOpen ? ' is-open' : ''}`} open={mobileOpen} aria-label="Navigasi seluler">
        <button className="mobile-nav-dismiss" type="button" aria-label="Tutup navigasi" onClick={closeNavigation} />
        <aside ref={sheetRef} className="mobile-sheet">
          <header className="mobile-sheet-header">
            <div className="mobile-sheet-brand"><strong>ANH</strong><span>Portofolio<br />Pribadi</span></div>
            <button ref={closeButtonRef} className="mobile-nav-close" type="button" onClick={closeNavigation} aria-label="Tutup navigasi">
              <span aria-hidden="true"><i /><i /></span>
            </button>
          </header>
          <p className="sheet-title">Jelajahi halaman</p>
          <nav aria-label="Navigasi mobile">
            {links.map((link) => {
              const selected = currentActive === link.id;
              return (
                <a
                  className={selected ? 'active' : ''}
                  href={link.href}
                  key={link.href}
                  aria-current={selected ? 'page' : undefined}
                  onClick={() => {
                    onNavigate?.(link.id);
                    closeNavigation();
                  }}
                >
                  <span>{link.label}</span><i aria-hidden="true" />
                </a>
              );
            })}
          </nav>
          <footer><span>Akbar Nur Hidayanto</span><span>© 2026</span></footer>
        </aside>
      </dialog>
    </div>
  );
}

export function SiteNavigation({ homePrefix = '', activePage }: SiteNavigationProps = {}) {
  const [active, setActive] = useState('top');

  useEffect(() => {
    if (activePage) return;

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
  }, [activePage]);

  const currentActive = activePage ?? active;
  const resolvedMobileLinks = mobileLinks.map((link) => ({ ...link, href: link.external ? link.href : `${homePrefix}${link.href}` }));

  return (
    <>
      <nav className="desktop-nav" aria-label="Navigasi utama">
        {primaryLinks.map((link) => {
          const href = link.external ? link.href : `${homePrefix}${link.href}`;
          return <a className={currentActive === link.id ? 'active' : ''} href={href} key={link.href} onClick={() => setActive(link.id)}>{link.label}</a>;
        })}
      </nav>

      <MobileNavigation links={resolvedMobileLinks} currentActive={currentActive} onNavigate={setActive} />
    </>
  );
}
