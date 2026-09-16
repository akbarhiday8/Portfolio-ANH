import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ArrowUpRight, Eye } from 'lucide-react';
import { notFound } from 'next/navigation';
import { MotionController } from '@/components/motion-controller';
import { EditorialMedia } from '@/components/editorial-media';
import { ReadingHeader } from '@/components/reading-header';
import { SiteFooter } from '@/components/site-footer';
import { getPortfolioContent } from '@/lib/cms-repository';
import { SITE_URL } from '@/lib/site-url';

export const dynamic = 'force-dynamic';

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { projects } = await getPortfolioContent();
  const project = projects.find((item) => item.slug === slug);
  if (!project) return {};

  const seo = project as typeof project & { seoTitle?: string; seoDescription?: string; seoImage?: string };
  const pageTitle = seo.seoTitle || `${project.title} — Portfolio Akbar Nur Hidayanto`;
  const pageDescription = seo.seoDescription || project.summary;
  const image = new URL(seo.seoImage || project.image, SITE_URL).toString();

  return {
    title: pageTitle,
    description: pageDescription,
    openGraph: {
      title: seo.seoTitle || project.title,
      description: pageDescription,
      type: 'article',
      images: [{ url: image, alt: `Dokumentasi proyek ${project.title}` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.seoTitle || project.title,
      description: pageDescription,
      images: [image],
    },
  };
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const { projects, profile, siteContent } = await getPortfolioContent();
  const projectIndex = projects.findIndex((item) => item.slug === slug);
  if (projectIndex < 0) notFound();

  const project = projects[projectIndex];
  const challenge = String(project.challenge ?? '');
  const approach = String(project.approach ?? '');
  const previous = projects[(projectIndex - 1 + projects.length) % projects.length];
  const next = projects[(projectIndex + 1) % projects.length];

  return (
    <>
      <MotionController />
      <ReadingHeader activePage="work" profile={profile} siteContent={siteContent} />

      <main className="project-detail-page" id="top">
        <section className="case-hero">
          <div className="section-wrap case-hero-grid case-hero-grid--editorial">
            <div className="case-intro">
              <p className="case-kicker">{project.category} · {project.year}</p>
              <h1>{project.title}</h1>
              <p className="case-summary">{project.summary}</p>
              <dl className="case-meta case-meta--compact">
                {project.role ? <div><dt>Peran</dt><dd>{project.role}</dd></div> : null}
                {project.discipline ? <div><dt>Bidang</dt><dd>{project.discipline}</dd></div> : null}
                {project.artifactType ? <div><dt>Jenis hasil</dt><dd>{project.artifactType}</dd></div> : null}
              </dl>
              {project.evidence?.href ? <div className="case-proof"><a href={project.evidence.href} target="_blank" rel="noreferrer"><Eye size={17} />{project.evidence.label || 'Lihat bukti proyek'}<ArrowUpRight size={16} /></a></div> : null}
            </div>
            {project.image ? <div className="case-hero-media"><EditorialMedia src={project.image} priority alt={`Dokumentasi visual proyek ${project.title}`} /></div> : null}
          </div>
        </section>

        <section className="case-section case-study">
          <div className="section-wrap case-study-shell">
            <header className="case-study-heading">
              <div><i /><p className="case-label">Studi kasus</p></div>
              <h2>Ringkasan proyek</h2>
            </header>

            {challenge || approach ? <div className="case-story-grid">
              {challenge ? <article>
                <h3>Konteks</h3>
                <p>{challenge}</p>
              </article> : null}
              {approach ? <article>
                <h3>Solusi</h3>
                <p>{approach}</p>
              </article> : null}
            </div> : null}

            <div className="case-details-grid">
              {project.scope?.length ? <section>
                <h3>Kontribusi utama</h3>
                <ul className="case-scope">
                  {project.scope.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </section> : null}
              {project.process?.length ? <section>
                <h3>Proses singkat</h3>
                <ol className="case-process">
                  {project.process.map((step) => (
                    <li key={step.title}>
                      <strong>{step.title}</strong>
                      <p>{step.description}</p>
                    </li>
                  ))}
                </ol>
              </section> : null}
            </div>

            {project.outcome ? <aside className="case-outcome">
              <p className="case-label">Hasil</p>
              <p>{project.outcome}</p>
            </aside> : null}
          </div>
        </section>

        <nav className="section-wrap case-pagination" aria-label="Navigasi proyek">
          <Link href={`/portfolio/${previous.slug}`}><ArrowLeft size={17} /><span><small>Proyek sebelumnya</small>{previous.title}</span></Link>
          <Link href={`/portfolio/${next.slug}`}><span><small>Proyek berikutnya</small>{next.title}</span><ArrowRight size={17} /></Link>
        </nav>

        <SiteFooter />
      </main>
    </>
  );
}
