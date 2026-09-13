import { ArrowUp } from 'lucide-react';
import Link from 'next/link';
import { BrandIdentity } from '@/components/brand-identity';
import { getPortfolioContent } from '@/lib/cms-repository';

const footerLinks = [
  { href: '/#top', label: 'Beranda' },
  { href: '/#about', label: 'Tentang' },
  { href: '/#education', label: 'Pendidikan' },
  { href: '/#experience', label: 'Pengalaman' },
  { href: '/#work', label: 'Portfolio' },
  { href: '/#certificates', label: 'Sertifikasi' },
  { href: '/artikel', label: 'Artikel' },
  { href: '/#contact', label: 'Kontak' },
];

export async function SiteFooter() {
  const { profile, siteContent } = await getPortfolioContent();
  const primaryLinks = footerLinks.slice(0, 4);
  const secondaryLinks = footerLinks.slice(4);
  return (
    <footer className="site-footer">
      <div className="section-wrap site-footer-main">
        <div className="site-footer-identity">
          <Link href="/#top" aria-label={`${profile.monogram} — kembali ke beranda`}>
            <BrandIdentity context="public" profile={profile} siteContent={siteContent} />
          </Link>
          <p>© {new Date().getFullYear()} {siteContent.copyrightText}</p>
        </div>
        <nav className="site-footer-nav-group" aria-label="Navigasi utama footer">
          {primaryLinks.map((link) => <Link href={link.href} key={link.href}>{link.label}</Link>)}
        </nav>
        <div className="site-footer-third-column">
          <nav className="site-footer-nav-group" aria-label="Navigasi lanjutan footer">
            {secondaryLinks.map((link) => <Link href={link.href} key={link.href}>{link.label}</Link>)}
          </nav>
          <div className="site-footer-utility">
            <nav className="site-footer-legal" aria-label="Informasi kebijakan">
              <Link href="/privasi">Privasi</Link>
              <span aria-hidden="true">·</span>
              <Link href="/disclaimer">Disclaimer</Link>
            </nav>
            <a className="site-footer-top" href="#top" aria-label="Kembali ke atas">
              <ArrowUp size={16} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
