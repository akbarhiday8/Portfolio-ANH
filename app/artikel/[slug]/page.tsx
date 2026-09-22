import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Clock3 } from 'lucide-react';
import { notFound } from 'next/navigation';
import { MotionController } from '@/components/motion-controller';
import { ReadingHeader } from '@/components/reading-header';
import { SiteFooter } from '@/components/site-footer';
import { getPortfolioContent } from '@/lib/cms-repository';
import { SITE_URL } from '@/lib/site-url';

export const dynamic = 'force-dynamic';

type ArticlePageProps = { params: Promise<{ slug: string }> };

function publicMediaSource(value: unknown) {
  if (typeof value !== 'string') return '';
  const src = value.trim();
  if (src.startsWith('/')) return src;
  try {
    const url = new URL(src);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : '';
  } catch {
    return '';
  }
}

function heroObjectPosition(value: unknown) {
  if (value === 'left') return 'left center';
  if (value === 'right') return 'right center';
  return 'center center';
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const { articles } = await getPortfolioContent();
  const article = articles.find((item) => item.slug === slug);
  if (!article) return {};

  const seo = article as typeof article & { seoTitle?: string; seoDescription?: string; seoImage?: string; heroImage?: string };
  const title = seo.seoTitle || `${article.title} — Akbar Nur Hidayanto`;
  const description = seo.seoDescription || article.excerpt;
  const sourceImage = publicMediaSource(seo.seoImage) || publicMediaSource(seo.heroImage);
  const image = sourceImage ? new URL(sourceImage, SITE_URL).toString() : null;

  return {
    title,
    description,
    openGraph: { title: seo.seoTitle || article.title, description, type: 'article', images: image ? [{ url: image, alt: article.title }] : [] },
    twitter: { card: image ? 'summary_large_image' : 'summary', title: seo.seoTitle || article.title, description, images: image ? [image] : [] },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const { articles, profile, siteContent } = await getPortfolioContent();
  const articleIndex = articles.findIndex((item) => item.slug === slug);
  if (articleIndex < 0) notFound();

  const article = articles[articleIndex];
  const next = articles[(articleIndex + 1) % articles.length];
  const visual = article as typeof article & { heroImage?: unknown; heroPosition?: unknown; seoImage?: unknown };
  const heroImage = publicMediaSource(visual.heroImage) || publicMediaSource(visual.seoImage);
  const imagePosition = heroObjectPosition(visual.heroPosition);

  return (
    <>
      <MotionController />
      <ReadingHeader activePage="article" profile={profile} siteContent={siteContent} />

      <main className="article-page" id="top">
        <article>
          <header className={`article-hero${heroImage ? ' has-media' : ''}`}>
            {heroImage ? <div className="article-hero-media" aria-hidden="true">
              <Image src={heroImage} alt="" fill sizes="100vw" priority style={{ objectPosition: imagePosition }} />
            </div> : null}
            {heroImage ? <div className="article-hero-overlay" aria-hidden="true" /> : null}
            <div className="section-wrap article-hero-inner">
              <p className="article-kicker"><Link href="/artikel">Artikel</Link> / {article.category}</p>
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

        <Link className="article-next" href={`/artikel/${next.slug}`}>
          <span className="section-wrap"><small>Baca selanjutnya</small><strong>{next.title}</strong><ArrowRight size={24} /></span>
        </Link>

        <SiteFooter />
      </main>
    </>
  );
}
