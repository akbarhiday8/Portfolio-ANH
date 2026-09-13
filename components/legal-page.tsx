import type { Metadata } from 'next';
import { ReadingHeader } from '@/components/reading-header';
import { SiteFooter } from '@/components/site-footer';
import { getPortfolioContent } from '@/lib/cms-repository';

export type LegalSection = {
  heading: string;
  paragraphs: string[];
  items?: string[];
};

export async function LegalPage({
  eyebrow,
  title,
  description,
  sections,
}: {
  eyebrow: string;
  title: string;
  description: string;
  sections: LegalSection[];
}) {
  const { profile, siteContent } = await getPortfolioContent();

  return (
    <>
      <ReadingHeader activePage="legal" profile={profile} siteContent={siteContent} />
      <main className="legal-page" id="top">
        <header className="legal-hero">
          <div className="section-wrap legal-hero-grid">
            <div>
              <p className="article-kicker">{eyebrow}</p>
              <h1>{title}</h1>
            </div>
            <div>
              <p className="legal-lead">{description}</p>
              <p className="legal-updated">
                Diperbarui <time dateTime="2026-09-14">14 September 2026</time>
              </p>
            </div>
          </div>
        </header>
        <article className="section-wrap legal-content">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              {section.items ? (
                <ul>
                  {section.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              ) : null}
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
