import type { Metadata } from 'next';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Eye } from 'lucide-react';
import { notFound } from 'next/navigation';
import { MotionController } from '@/components/motion-controller';
import { ReadingHeader } from '@/components/reading-header';
import { portfolioData } from '@/lib/portfolio-data';

const SITE_URL = 'https://akbar-nur-portfolio.akbar8nur.chatgpt.site';

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return portfolioData.projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = portfolioData.projects.find((item) => item.slug === slug);
  if (!project) return {};

  const image = new URL(project.image, SITE_URL).toString();
  return {
    title: `${project.title} — Portfolio Akbar Nur Hidayanto`,
    description: project.summary,
    openGraph: {
      title: project.title,
      description: project.summary,
      type: 'article',
      images: [{ url: image, alt: `Dokumentasi proyek ${project.title}` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description: project.summary,
      images: [image],
    },
  };
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const projectIndex = portfolioData.projects.findIndex((item) => item.slug === slug);
  if (projectIndex < 0) notFound();

  const project = portfolioData.projects[projectIndex];
  const previous = portfolioData.projects[(projectIndex - 1 + portfolioData.projects.length) % portfolioData.projects.length];
  const next = portfolioData.projects[(projectIndex + 1) % portfolioData.projects.length];

  return (
    <>
      <MotionController />
      <ReadingHeader activePage="work" />

      <main className="project-detail-page">
        <section className="case-hero">
          <div className="section-wrap case-hero-grid">
            <div className="case-intro">
              <p className="case-kicker">{project.category} · {project.year}</p>
              <h1>{project.title}</h1>
              <p className="case-summary">{project.summary}</p>
              <dl className="case-meta case-meta--compact">
                <div><dt>Peran</dt><dd>{project.role}</dd></div>
                <div><dt>Bidang</dt><dd>{project.discipline}</dd></div>
                <div><dt>Jenis hasil</dt><dd>{project.artifactType}</dd></div>
              </dl>
              <div className="case-proof">
                {project.evidence.href ? <a href={project.evidence.href} target="_blank" rel="noreferrer"><Eye size={17} />{project.evidence.label}<ArrowUpRight size={16} /></a> : <span><Eye size={17} />Tautan bukti proyek akan ditambahkan</span>}
              </div>
            </div>
            <div className="case-cover">
              <Image src={project.image} fill priority sizes="(max-width: 850px) 100vw, 52vw" alt={`Dokumentasi visual ${project.title}`} />
              <span>Dokumentasi visual sementara</span>
            </div>
          </div>
        </section>

        <section className="case-section case-study">
          <div className="section-wrap case-editorial-grid">
            <header><i /><p>Detail Proyek</p></header>
            <div className="case-body case-study-body">
              <div className="case-overview">
                <p className="case-label">Tantangan &amp; pendekatan</p>
                <h2>{project.challenge}</h2>
                <p>{project.approach}</p>
              </div>

              <div className="case-study-columns">
                <section>
                  <h3>Kontribusi</h3>
                  <ul className="case-scope">
                    {project.scope.map((item) => <li key={item}><Check size={17} /><span>{item}</span></li>)}
                  </ul>
                </section>
                <section>
                  <h3>Alur kerja</h3>
                  <ol className="case-process">
                    {project.process.map((step, index) => (
                      <li key={step.title}>
                        <span>{String(index + 1).padStart(2, '0')}</span>
                        <div><strong>{step.title}</strong><p>{step.description}</p></div>
                      </li>
                    ))}
                  </ol>
                </section>
              </div>

              <div className="case-outcome">
                <p className="case-label">Hasil</p>
                <p>{project.outcome}</p>
              </div>
            </div>
          </div>
        </section>

        <nav className="section-wrap case-pagination" aria-label="Navigasi proyek">
          <a href={`/portfolio/${previous.slug}`}><ArrowLeft size={17} /><span><small>Proyek sebelumnya</small>{previous.title}</span></a>
          <a href={`/portfolio/${next.slug}`}><span><small>Proyek berikutnya</small>{next.title}</span><ArrowRight size={17} /></a>
        </nav>

        <footer className="detail-footer">
          <div className="section-wrap">
            <a href="/">ANH</a>
            <p>© {new Date().getFullYear()} Akbar Nur Hidayanto.</p>
            <nav className="detail-footer-links"><a href="/artikel">Artikel</a><a href="/#contact">Kontak</a></nav>
          </div>
        </footer>
      </main>
    </>
  );
}
