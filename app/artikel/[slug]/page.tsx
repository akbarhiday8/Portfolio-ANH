import type { Metadata } from 'next';
import { ArrowRight, Clock3 } from 'lucide-react';
import { notFound } from 'next/navigation';
import { MotionController } from '@/components/motion-controller';
import { SiteNavigation } from '@/components/site-navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { portfolioData } from '@/lib/portfolio-data';

type ArticlePageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return portfolioData.articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = portfolioData.articles.find((item) => item.slug === slug);
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
  const articleIndex = portfolioData.articles.findIndex((item) => item.slug === slug);
  if (articleIndex < 0) notFound();

  const article = portfolioData.articles[articleIndex];
  const next = portfolioData.articles[(articleIndex + 1) % portfolioData.articles.length];

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

      <main className="article-page">
        <article>
          <header className="article-hero">
            <div className="section-wrap article-hero-inner">
              <p className="article-kicker">{article.category}</p>
              <h1>{article.title}</h1>
              <p className="article-lead">{article.lead}</p>
              <div className="article-byline"><span>Akbar Nur Hidayanto</span><span>{article.publishedAt}</span><span><Clock3 size={14} /> {article.readTime}</span></div>
            </div>
          </header>

          <div className="section-wrap article-reading-grid">
            <aside>
              <p>Dalam artikel ini</p>
              <nav aria-label="Daftar isi">{article.sections.map((section) => <a href={`#${section.heading.toLowerCase().replaceAll(' ', '-')}`} key={section.heading}>{section.heading}</a>)}</nav>
            </aside>
            <div className="article-body">
              {article.sections.map((section) => (
                <section id={section.heading.toLowerCase().replaceAll(' ', '-')} key={section.heading}>
                  <h2>{section.heading}</h2>
                  {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                </section>
              ))}
              <blockquote>Catatan yang baik tidak berhenti pada informasi; ia membantu orang memahami dan mengambil langkah berikutnya.</blockquote>
            </div>
          </div>
        </article>

        <a className="article-next" href={`/artikel/${next.slug}`}>
          <span className="section-wrap"><small>Baca selanjutnya</small><strong>{next.title}</strong><ArrowRight size={24} /></span>
        </a>

        <footer className="detail-footer">
          <div className="section-wrap"><a href="/">ANH</a><p>© {new Date().getFullYear()} Akbar Nur Hidayanto.</p><a href="/artikel">Semua Artikel <ArrowRight size={16} /></a></div>
        </footer>
      </main>
    </>
  );
}
