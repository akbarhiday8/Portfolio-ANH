import type { Metadata } from 'next';
import { ArrowRight, Clock3 } from 'lucide-react';
import { MotionController } from '@/components/motion-controller';
import { ReadingHeader } from '@/components/reading-header';
import { SiteFooter } from '@/components/site-footer';
import { getPortfolioContent } from '@/lib/cms-repository';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Artikel — Akbar Nur Hidayanto',
  description: 'Catatan tentang teknologi, dokumentasi, produktivitas, desain sistem, dan cara kerja yang lebih terstruktur.',
};

export default async function ArticleIndexPage() {
  const { articles, profile, siteContent } = await getPortfolioContent();
  return (
    <>
      <MotionController />
      <ReadingHeader activePage="article" profile={profile} siteContent={siteContent} />

      <main className="article-index-page" id="top">
        <section className="article-index-hero">
          <div className="section-wrap article-index-hero-grid">
            <div>
              <p className="article-kicker">{siteContent.articleEyebrow}</p>
              <h1>{siteContent.articleHeading}</h1>
            </div>
            <div className="article-index-context">
              <p>{siteContent.articleDescription}</p>
              <dl>
                <div><dt>{articles.length}</dt><dd>Artikel terbit</dd></div>
                <div><dt>{new Set(articles.map((article) => article.category)).size}</dt><dd>Bidang utama</dd></div>
              </dl>
              <div className="article-index-topics">{Array.from(new Set(articles.map((article) => article.category))).map((category) => <span key={category}>{category}</span>)}</div>
            </div>
          </div>
        </section>

        <section className="article-library">
          <div className="section-wrap article-library-grid">
            <header><i /><h2>Artikel Terbaru</h2><p>Wawasan / proses / pembelajaran</p></header>
            <div className="article-cards">
              {articles.map((article) => (
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
