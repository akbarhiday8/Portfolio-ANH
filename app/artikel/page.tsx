import type { Metadata } from 'next';
import { ArrowRight, Clock3 } from 'lucide-react';
import { MotionController } from '@/components/motion-controller';
import { SiteNavigation } from '@/components/site-navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { portfolioData } from '@/lib/portfolio-data';

export const metadata: Metadata = {
  title: 'Artikel — Akbar Nur Hidayanto',
  description: 'Catatan tentang teknologi, dokumentasi, produktivitas, desain sistem, dan cara kerja yang lebih terstruktur.',
};

export default function ArticleIndexPage() {
  return (
    <>
      <MotionController />
      <header className="masthead-shell detail-masthead-shell">
        <div className="masthead page-wrap">
          <a className="brand" href="/" aria-label="ANH — kembali ke beranda"><strong>ANH</strong><span>Portofolio Pribadi</span></a>
          <SiteNavigation homePrefix="/" activePage="article" />
          <ThemeToggle />
        </div>
      </header>

      <main className="article-index-page">
        <section className="article-index-hero">
          <div className="section-wrap article-index-hero-grid">
            <div>
              <p className="article-kicker">Artikel / Catatan</p>
              <h1>Pengetahuan yang<br />dirapikan menjadi<br /><span>gagasan.</span></h1>
            </div>
            <p>Catatan tentang teknologi, dokumentasi, produktivitas, desain sistem, dan cara kerja yang lebih terstruktur.</p>
          </div>
        </section>

        <section className="article-library">
          <div className="section-wrap article-library-grid">
            <header><i /><h2>Artikel Terbaru</h2><p>Wawasan / proses / pembelajaran</p></header>
            <div className="article-cards">
              {portfolioData.articles.map((article) => (
                <a className="article-card" href={`/artikel/${article.slug}`} key={article.slug}>
                  <div className="article-card-meta"><span>{article.category}</span><span><Clock3 size={13} /> {article.readTime}</span></div>
                  <h3>{article.title}</h3>
                  <p>{article.excerpt}</p>
                  <div className="article-card-footer"><span>{article.publishedAt}</span><span>Baca artikel <ArrowRight size={16} /></span></div>
                </a>
              ))}
            </div>
          </div>
        </section>

        <footer className="detail-footer">
          <div className="section-wrap"><a href="/">ANH</a><p>© {new Date().getFullYear()} Akbar Nur Hidayanto.</p><a href="/#contact">Mari berdiskusi <ArrowRight size={16} /></a></div>
        </footer>
      </main>
    </>
  );
}
