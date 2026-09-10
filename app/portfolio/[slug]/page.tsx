import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check } from 'lucide-react';
import { notFound } from 'next/navigation';
import { MotionController } from '@/components/motion-controller';
import { ThemeToggle } from '@/components/theme-toggle';
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
      <header className="masthead-shell detail-masthead-shell">
        <div className="masthead page-wrap detail-masthead">
          <Link className="brand" href="/" aria-label="ANH — kembali ke beranda">
            <strong>ANH</strong><span>Portofolio Pribadi</span>
          </Link>
          <Link className="detail-back" href="/#work"><ArrowLeft size={16} /> Kembali ke Portfolio</Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="project-detail-page">
        <section className="case-hero">
          <div className="section-wrap case-hero-grid">
            <div className="case-intro">
              <p className="case-kicker">{project.category} · {project.year}</p>
              <h1>{project.title}</h1>
              <p className="case-summary">{project.summary}</p>
              <dl className="case-meta">
                <div><dt>Peran</dt><dd>{project.role}</dd></div>
                <div><dt>Tahun</dt><dd>{project.year}</dd></div>
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
              <h2>Masalah yang jelas membutuhkan solusi yang terstruktur.</h2>
              <p>{project.summary} Halaman ini menyajikan lingkup, cara kerja, dan hasil secara ringkas agar kontribusi dalam proyek dapat dipahami tanpa kehilangan konteks.</p>
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

        <section className="case-result">
          <div className="section-wrap case-result-grid">
            <p>Hasil</p>
            <h2>{project.outcome}</h2>
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
            <Link href="/#contact">Mari berdiskusi <ArrowUpRight size={16} /></Link>
          </div>
        </footer>
      </main>
    </>
  );
}
