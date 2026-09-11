import { ArrowUp } from 'lucide-react';

const footerLinks = [
  { href: '/#about', label: 'Tentang' },
  { href: '/#education', label: 'Pendidikan' },
  { href: '/#experience', label: 'Pengalaman' },
  { href: '/#work', label: 'Portfolio' },
  { href: '/#certificates', label: 'Sertifikasi' },
  { href: '/artikel', label: 'Artikel' },
];

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="section-wrap site-footer-main">
        <div className="site-footer-brand">
          <a href="/#top" aria-label="ANH — kembali ke beranda">ANH</a>
          <p>Portofolio Pribadi</p>
        </div>
        <p className="site-footer-statement">Teknologi, dokumentasi, dan pemikiran terstruktur untuk menghasilkan pekerjaan yang jelas dan bermakna.</p>
        <nav className="site-footer-nav" aria-label="Navigasi footer">
          {footerLinks.map((link) => <a href={link.href} key={link.href}>{link.label}</a>)}
        </nav>
      </div>
      <div className="site-footer-rule" />
      <div className="section-wrap site-footer-bottom">
        <p>© {new Date().getFullYear()} Akbar Nur Hidayanto. Seluruh hak cipta dilindungi.</p>
        <p>Dirancang dengan tujuan.</p>
        <a className="site-footer-top" href="#top" aria-label="Kembali ke atas"><ArrowUp size={17} /></a>
      </div>
    </footer>
  );
}
