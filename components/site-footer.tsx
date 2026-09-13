import { ArrowUp } from 'lucide-react';
import Link from 'next/link';
import { BrandIdentity } from '@/components/brand-identity';
import { getPortfolioContent } from '@/lib/cms-repository';

const footerLinks = [
  { href: '/#about', label: 'Tentang' },
  { href: '/#experience', label: 'Pengalaman' },
  { href: '/#work', label: 'Portfolio' },
  { href: '/#certificates', label: 'Sertifikasi' },
  { href: '/artikel', label: 'Artikel' },
  { href: '/#contact', label: 'Kontak' },
];

export async function SiteFooter() {
  const { profile, siteContent } = await getPortfolioContent();
  return (
    <footer className="site-footer">
      <div className="section-wrap site-footer-main">
        <div className="site-footer-identity">
          <Link href="/#top" aria-label={`${profile.monogram} — kembali ke beranda`}>
            <BrandIdentity context="public" profile={profile} siteContent={siteContent} />
          </Link>
        </div>
        <div className="site-footer-navigation">
          <p>Navigasi</p>
          <nav className="site-footer-nav" aria-label="Navigasi footer">
            {footerLinks.map((link) => <Link href={link.href} key={link.href}>{link.label}</Link>)}
          </nav>
        </div>
      </div>
      <div className="section-wrap site-footer-bottom">
        <p>© {new Date().getFullYear()} {siteContent.copyrightText}</p>
        <a className="site-footer-top" href="#top" aria-label="Kembali ke atas">
          <span>Kembali ke atas</span>
          <ArrowUp size={16} />
        </a>
      </div>
    </footer>
  );
}
