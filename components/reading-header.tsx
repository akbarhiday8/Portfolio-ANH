'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { BrandIdentity } from '@/components/brand-identity';
import type { BrandingSource } from '@/lib/branding';

const readingLinks = [
  { id: 'home', href: '/', label: 'Beranda' },
  { id: 'about', href: '/#about', label: 'Tentang' },
  { id: 'education', href: '/#education', label: 'Pendidikan' },
  { id: 'experience', href: '/#experience', label: 'Pengalaman' },
  { id: 'work', href: '/#work', label: 'Portfolio' },
  { id: 'certificates', href: '/#certificates', label: 'Sertifikasi' },
  { id: 'article', href: '/artikel', label: 'Artikel' },
] as const;

export function ReadingHeader({
  activePage,
  profile,
  siteContent,
}: {
  activePage: 'article' | 'work';
  profile: BrandingSource;
  siteContent: BrandingSource;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <header className={`reading-header-shell${expanded ? ' is-expanded' : ' is-collapsed'}`}>
      <div className="reading-header-bar page-wrap">
        <Link className="brand" href="/" aria-label="ANH — kembali ke beranda"><BrandIdentity context="public" profile={profile} siteContent={siteContent} /></Link>
        <nav className="reading-header-nav" aria-label="Navigasi halaman dalam">
          {readingLinks.map((link) => <Link className={activePage === link.id ? 'active' : ''} href={link.href} key={link.id}>{link.label}</Link>)}
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
