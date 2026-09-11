import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Eye, FileSpreadsheet, FileText, Globe2, Presentation } from 'lucide-react';
import { notFound } from 'next/navigation';
import { MotionController } from '@/components/motion-controller';
import { ReadingHeader } from '@/components/reading-header';
import { portfolioData } from '@/lib/portfolio-data';

const SITE_URL = 'https://akbar-nur-portfolio.akbar8nur.chatgpt.site';

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

function ArtifactIcon({ kind }: { kind: string }) {
  if (kind === 'website') return <Globe2 size={24} strokeWidth={1.6} />;
  if (kind === 'spreadsheet') return <FileSpreadsheet size={24} strokeWidth={1.6} />;
  if (kind === 'presentation') return <Presentation size={24} strokeWidth={1.6} />;
  return <FileText size={24} strokeWidth={1.6} />;
}

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
              <div className="case-tags" aria-label="Klasifikasi proyek">
                <span>{project.discipline}</span><span>{project.artifactType}</span><span>{project.status}</span>
              </div>
              <dl className="case-meta">
                <div><dt>Peran</dt><dd>{project.role}</dd></div>
                <div><dt>Tahun</dt><dd>{project.year}</dd></div>
                <div><dt>Bidang</dt><dd>{project.discipline}</dd></div>
                <div><dt>Jenis hasil</dt><dd>{project.artifactType}</dd></div>
              </dl>
            </div>
            <div className="case-cover">
              <Image src={project.image} fill priority sizes="(max-width: 850px) 100vw, 52vw" alt={`Dokumentasi visual ${project.title}`} />
              <span>Dokumentasi visual sementara</span>
            </div>
          </div>
        </section>

        <section className="case-section">
          <div className="section-wrap case-editorial-grid">
            <header><i /><p>Ringkasan Proyek</p></header>
            <div className="case-body case-overview">
              <h2>Konteks, keputusan, dan hasil dalam satu studi kasus.</h2>
              <div className="case-narrative">
                <article><small>Tantangan</small><p>{project.challenge}</p></article>
                <article><small>Pendekatan</small><p>{project.approach}</p></article>
              </div>
            </div>
          </div>
        </section>

        <section className="case-section case-section-muted">
          <div className="section-wrap case-editorial-grid">
            <header><i /><p>Lingkup Pekerjaan</p></header>
            <ul className="case-scope">
              {project.scope.map((item) => <li key={item}><Check size={18} /><span>{item}</span></li>)}
            </ul>
          </div>
        </section>

        <section className="case-section">
          <div className="section-wrap case-editorial-grid">
            <header><i /><p>Proses</p></header>
            <div className="case-process">
              {project.process.map((step) => (
                <article key={step.title}>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="case-section">
          <div className="section-wrap case-editorial-grid">
            <header><i /><p>Hasil Kerja</p></header>
            <div className="case-resources">
              <article>
                <h3>Deliverables</h3>
                <ul>{project.deliverables.map((item) => <li key={item}><Check size={16} />{item}</li>)}</ul>
              </article>
              <article>
                <h3>Perangkat & metode</h3>
                <ul>{project.tools.map((item) => <li key={item}><Check size={16} />{item}</li>)}</ul>
              </article>
            </div>
          </div>
        </section>

        <section className="case-result">
          <div className="section-wrap case-result-grid">
            <p>Hasil</p>
            <h2>{project.outcome}</h2>
          </div>
        </section>

        <section className="case-section case-artifacts-section">
          <div className="section-wrap case-editorial-grid">
            <header><i /><p>Artefak & Preview</p></header>
            <div className="case-artifacts">
              <div className="case-artifact-intro">
                <h2>Dokumentasi yang menyesuaikan bentuk setiap karya.</h2>
                <p>Bagian ini dapat menampilkan tautan website, workbook Excel, laporan PDF, presentasi, gambar, maupun dokumen proyek lainnya.</p>
              </div>
              <div>
                <div className="case-evidence">
                  <div className="case-evidence-heading"><span><Eye size={18} /> Tautan bukti proyek</span><small>Dibuka sebagai preview</small></div>
                  <div className="case-evidence-links">
                    {project.evidence.href ? (
                      <a href={project.evidence.href} target="_blank" rel="noreferrer">
                        <span><small>{project.evidence.type}</small><strong>{project.evidence.label}</strong></span><ArrowUpRight size={17} />
                      </a>
                    ) : (
                      <div className="is-pending">
                        <span><small>{project.evidence.type}</small><strong>{project.evidence.label}</strong></span><em>Tautan disiapkan</em>
                      </div>
                    )}
                  </div>
                </div>
                <div className="case-artifact-list">
                {project.artifacts.map((artifact) => {
                  const content = <><ArtifactIcon kind={artifact.kind} /><span><small>{artifact.format}</small><strong>{artifact.title}</strong><p>{artifact.description}</p></span><ArrowUpRight size={17} /></>;
                  return artifact.href
                    ? <a className="case-artifact-card" href={artifact.href} target="_blank" rel="noreferrer" key={artifact.title}>{content}</a>
                    : <article className="case-artifact-card is-pending" key={artifact.title}>{content}</article>;
                })}
                </div>
              </div>
            </div>
          </div>
        </section>

        <nav className="section-wrap case-pagination" aria-label="Navigasi proyek">
          <Link href={`/portfolio/${previous.slug}`}><ArrowLeft size={17} /><span><small>Proyek sebelumnya</small>{previous.title}</span></Link>
          <Link href={`/portfolio/${next.slug}`}><span><small>Proyek berikutnya</small>{next.title}</span><ArrowRight size={17} /></Link>
        </nav>

        <footer className="detail-footer">
          <div className="section-wrap">
            <Link href="/">ANH</Link>
            <p>© {new Date().getFullYear()} Akbar Nur Hidayanto.</p>
            <nav className="detail-footer-links"><Link href="/artikel">Artikel</Link><Link href="/#contact">Kontak</Link></nav>
          </div>
        </footer>
      </main>
    </>
  );
}
