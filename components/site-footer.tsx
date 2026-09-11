import { ArrowUp } from 'lucide-react';

const footerLinks = [
  { href: '/#about', label: 'Tentang' },
  { href: '/#experience', label: 'Pengalaman' },
  { href: '/#work', label: 'Portfolio' },
  { href: '/#certificates', label: 'Sertifikasi' },
  { href: '/artikel', label: 'Artikel' },
  { href: '/#contact', label: 'Kontak' },
];

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="section-wrap site-footer-main">
        <div className="site-footer-identity">
          <a href="/#top" aria-label="ANH — kembali ke beranda">ANH</a>
          <div>
            <strong>Akbar Nur Hidayanto</strong>
            <span>Portofolio Profesional</span>
          </div>
        </div>
        <div className="site-footer-navigation">
          <p>Navigasi</p>
          <nav className="site-footer-nav" aria-label="Navigasi footer">
            {footerLinks.map((link) => <a href={link.href} key={link.href}>{link.label}</a>)}
          </nav>
        </div>
      </div>
      <div className="section-wrap site-footer-bottom">
        <p>© {new Date().getFullYear()} Akbar Nur Hidayanto. Seluruh hak cipta dilindungi.</p>
        <a className="site-footer-top" href="#top" aria-label="Kembali ke atas">
          <span>Kembali ke atas</span>
          <ArrowUp size={16} />
        </a>
      </div>
    </footer>
  );
}
