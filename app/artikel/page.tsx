import type { Metadata } from 'next';
import { ArrowRight, Clock3 } from 'lucide-react';
import { MotionController } from '@/components/motion-controller';
import { ReadingHeader } from '@/components/reading-header';
import { SiteFooter } from '@/components/site-footer';
import { portfolioData } from '@/lib/portfolio-data';

export const metadata: Metadata = {
  title: 'Artikel — Akbar Nur Hidayanto',
  description: 'Catatan tentang teknologi, dokumentasi, produktivitas, desain sistem, dan cara kerja yang lebih terstruktur.',
};

export default function ArticleIndexPage() {
  return (
    <>
      <MotionController />
      <ReadingHeader activePage="article" />

      <main className="article-index-page" id="top">
        <section className="article-index-hero">
          <div className="section-wrap article-index-hero-grid">
            <div>
              <p className="article-kicker">Artikel / Catatan</p>
              <h1>Pengetahuan yang<br />dirapikan menjadi<br /><span>gagasan.</span></h1>
            </div>
            <div className="article-index-context">
              <p>Catatan tentang teknologi, dokumentasi, produktivitas, desain sistem, dan cara kerja yang lebih terstruktur.</p>
              <dl>
                <div><dt>{portfolioData.articles.length}</dt><dd>Artikel terbit</dd></div>
                <div><dt>3</dt><dd>Bidang utama</dd></div>
              </dl>
              <div className="article-index-topics"><span>Teknologi</span><span>Produktivitas</span><span>Desain Sistem</span></div>
            </div>
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

        <SiteFooter />
      </main>
    </>
  );
}
