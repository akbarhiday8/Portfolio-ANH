import type { Metadata } from 'next';
import { ArrowRight, Clock3 } from 'lucide-react';
import { notFound } from 'next/navigation';
import { MotionController } from '@/components/motion-controller';
import { ReadingHeader } from '@/components/reading-header';
import { SiteFooter } from '@/components/site-footer';
import { getPortfolioContent } from '@/lib/cms-server';

type ArticlePageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const { articles } = await getPortfolioContent();
  const article = articles.find((item) => item.slug === slug);
  if (!article) return {};
  return {
    title: `${article.title} — Akbar Nur Hidayanto`,
    description: article.excerpt,
    openGraph: { title: article.title, description: article.excerpt, type: 'article', images: [] },
    twitter: { card: 'summary', title: article.title, description: article.excerpt, images: [] },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const { articles } = await getPortfolioContent();
  const articleIndex = articles.findIndex((item) => item.slug === slug);
  if (articleIndex < 0) notFound();

  const article = articles[articleIndex];
  const next = articles[(articleIndex + 1) % articles.length];

  return (
    <>
      <MotionController />
      <ReadingHeader activePage="article" />

      <main className="article-page" id="top">
        <article>
          <header className="article-hero">
            <div className="section-wrap article-hero-inner">
              <p className="article-kicker"><a href="/artikel">Artikel</a> / {article.category}</p>
              <h1>{article.title}</h1>
              <p className="article-lead">{article.lead}</p>
              <div className="article-byline"><span>Akbar Nur Hidayanto</span><span>{article.publishedAt}</span><span><Clock3 size={14} /> {article.readTime}</span></div>
            </div>
          </header>

          <div className="section-wrap article-reading-grid">
            <aside>
              <p>Dalam artikel ini</p>
              <nav aria-label="Daftar isi">
                <a href="#ringkasan">Ringkasan utama</a>
                {article.sections.map((section) => <a href={`#${section.heading.toLowerCase().replaceAll(' ', '-')}`} key={section.heading}>{section.heading}</a>)}
                <a href="#penutup">Penutup</a>
              </nav>
            </aside>
            <div className="article-body">
              <section className="article-summary-box" id="ringkasan">
                <small>Ringkasan utama</small>
                <h2>Hal yang perlu dibawa dari artikel ini.</h2>
                <ul>{article.takeaways.map((item) => <li key={item}>{item}</li>)}</ul>
              </section>
              {article.sections.map((section) => (
                <section id={section.heading.toLowerCase().replaceAll(' ', '-')} key={section.heading}>
                  <h2>{section.heading}</h2>
                  {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                </section>
              ))}
              {article.quote ? <blockquote>{article.quote}</blockquote> : null}
              <section className="article-closing" id="penutup">
                <small>Penutup</small><h2>{article.closingHeading || 'Merangkum gagasan menjadi tindakan.'}</h2><p>{article.closing}</p>
              </section>
            </div>
          </div>
        </article>

        <a className="article-next" href={`/artikel/${next.slug}`}>
          <span className="section-wrap"><small>Baca selanjutnya</small><strong>{next.title}</strong><ArrowRight size={24} /></span>
        </a>

        <SiteFooter />
      </main>
    </>
  );
}
