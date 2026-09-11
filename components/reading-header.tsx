'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

const readingLinks = [
  { id: 'home', href: '/', label: 'Beranda' },
  { id: 'work', href: '/#work', label: 'Portfolio' },
  { id: 'article', href: '/artikel', label: 'Artikel' },
  { id: 'contact', href: '/#contact', label: 'Kontak' },
] as const;

export function ReadingHeader({ activePage }: { activePage: 'article' | 'work' }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <header className={`reading-header-shell${expanded ? ' is-expanded' : ' is-collapsed'}`}>
      <div className="reading-header-bar page-wrap">
        <a className="brand" href="/" aria-label="ANH — kembali ke beranda"><strong>ANH</strong><span>Portofolio Pribadi</span></a>
        <nav className="reading-header-nav" aria-label="Navigasi halaman dalam">
          {readingLinks.map((link) => <a className={activePage === link.id ? 'active' : ''} href={link.href} key={link.id}>{link.label}</a>)}
        </nav>
        <ThemeToggle />
      </div>
      <button
        className="reading-header-handle"
        type="button"
        aria-expanded={expanded}
        aria-label={expanded ? 'Sembunyikan navbar' : 'Tampilkan navbar'}
        title={expanded ? 'Sembunyikan navbar' : 'Tampilkan navbar'}
        onClick={() => setExpanded((value) => !value)}
      >
        {expanded ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
      </button>
    </header>
  );
}
