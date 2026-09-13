import type { Metadata } from 'next';
import Link from 'next/link';
import { ReadingHeader } from '@/components/reading-header';
import { SiteFooter } from '@/components/site-footer';
import { getPortfolioContent } from '@/lib/cms-repository';
import { formatLegalDate, resolveLegalContent, type LegalPageKey } from '@/lib/legal-content';

export async function LegalPage({
  page,
}: {
  page: LegalPageKey;
}) {
  const { profile, siteContent } = await getPortfolioContent();
  const content = resolveLegalContent(siteContent, page);

  return (
    <>
      <ReadingHeader activePage="legal" profile={profile} siteContent={siteContent} />
      <main className="legal-page" id="top">
        <header className="legal-hero">
          <div className="section-wrap legal-hero-grid">
            <div>
              <p className="article-kicker">{content.eyebrow}</p>
              <h1>{content.title}</h1>
            </div>
            <div>
              <p className="legal-lead">{content.description}</p>
              <p className="legal-updated">
                Diperbarui <time dateTime={content.updatedAt}>{formatLegalDate(content.updatedAt)}</time>
              </p>
              <nav className="legal-page-switcher" aria-label="Halaman kebijakan">
                <Link className={page === 'privacy' ? 'is-active' : ''} href="/privasi">Privasi</Link>
                <Link className={page === 'disclaimer' ? 'is-active' : ''} href="/disclaimer">Disclaimer</Link>
              </nav>
            </div>
          </div>
        </header>
        <article className="section-wrap legal-content">
          {content.sections.map((section) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </section>
          ))}
        </article>
      </main>
      <SiteFooter />
    </>
  );
}

export function legalMetadata(title: string, description: string, path: string): Metadata {
  return {
    title: `${title} — Akbar Nur Hidayanto`,
    description,
    alternates: { canonical: path },
    robots: { index: true, follow: true },
  };
}
