import Image from 'next/image';
import {
  ArrowRight, ArrowUp, ArrowUpRight, BarChart3, BookOpen,
  BriefcaseBusiness, FileBadge2, Gamepad2, GraduationCap,
  Mail, Monitor, ShieldCheck,
} from 'lucide-react';
import { MotionController } from '@/components/motion-controller';
import { SiteNavigation } from '@/components/site-navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { portfolioData } from '@/lib/portfolio-data';

const experienceImages = ['/work-building.jpg', '/work-code.jpg', '/work-laptop.jpg'];
const projectImages = ['/work-dashboard.jpg', '/work-mobile.jpg', '/work-branding.jpg', '/work-building.jpg'];
const capabilityIcons = [GraduationCap, BriefcaseBusiness, BarChart3, BookOpen, FileBadge2, Gamepad2];
const certificateIcons = [Monitor, ShieldCheck, BarChart3, FileBadge2];

function SectionIndex({ title, caption }: { title: string; caption: string }) {
  return (
    <header className="section-index" data-reveal>
      <i aria-hidden="true" />
      <h2>{title}</h2>
      <p>{caption}</p>
    </header>
  );
}

function LinkedInLogo() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" /></svg>;
}

function GitHubLogo() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .7C5.73.7.65 5.78.65 12.05c0 5.02 3.25 9.28 7.76 10.78.57.1.78-.25.78-.55v-2.17c-3.16.69-3.83-1.34-3.83-1.34-.52-1.31-1.26-1.66-1.26-1.66-1.03-.71.08-.69.08-.69 1.14.08 1.74 1.17 1.74 1.17 1.01 1.74 2.66 1.24 3.31.95.1-.73.4-1.24.72-1.52-2.52-.29-5.17-1.26-5.17-5.61 0-1.24.44-2.25 1.17-3.05-.12-.29-.51-1.44.11-3 0 0 .95-.3 3.12 1.16a10.8 10.8 0 0 1 5.68 0c2.17-1.47 3.12-1.16 3.12-1.16.62 1.56.23 2.71.11 3 .73.8 1.17 1.81 1.17 3.05 0 4.36-2.66 5.32-5.19 5.6.41.36.77 1.06.77 2.13v3.16c0 .31.2.66.78.55A11.36 11.36 0 0 0 23.35 12.05C23.35 5.78 18.27.7 12 .7z" /></svg>;
}

function InstagramLogo() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.16c3.2 0 3.58.02 4.85.07 1.37.06 2.63.35 3.61 1.33.97.97 1.26 2.24 1.32 3.6.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.06 1.37-.35 2.63-1.32 3.61-.98.97-2.24 1.26-3.61 1.32-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.37-.06-2.63-.35-3.61-1.32-.97-.98-1.26-2.24-1.32-3.61-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.06-1.36.35-2.63 1.32-3.6.98-.98 2.24-1.27 3.61-1.33C8.42 2.18 8.8 2.16 12 2.16zm0 1.95c-3.15 0-3.52.01-4.76.07-1.15.05-1.77.24-2.18.4-.55.22-.94.47-1.35.88-.41.42-.67.81-.88 1.36-.16.41-.35 1.03-.4 2.18-.06 1.24-.07 1.61-.07 4.76s.01 3.52.07 4.76c.05 1.15.24 1.77.4 2.18.21.55.47.94.88 1.35.41.42.8.67 1.35.89.41.16 1.03.35 2.18.4 1.24.06 1.61.07 4.76.07s3.52-.01 4.76-.07c1.15-.05 1.77-.24 2.18-.4.55-.22.94-.47 1.35-.89.41-.41.67-.8.88-1.35.16-.41.35-1.03.4-2.18.06-1.24.07-1.61.07-4.76s-.01-3.52-.07-4.76c-.05-1.15-.24-1.77-.4-2.18-.21-.55-.47-.94-.88-1.36-.41-.41-.8-.66-1.35-.88-.41-.16-1.03-.35-2.18-.4-1.24-.06-1.61-.07-4.76-.07zm0 3.73a4.16 4.16 0 1 1 0 8.32 4.16 4.16 0 0 1 0-8.32zm0 6.86a2.7 2.7 0 1 0 0-5.4 2.7 2.7 0 0 0 0 5.4zm5.37-7.88a.97.97 0 1 1-1.94 0 .97.97 0 0 1 1.94 0z" /></svg>;
}

export default function Home() {
  const { profile, statistics, capabilities, journey, experience, projects, certifications, socials } = portfolioData;

  return (
    <main>
      <MotionController />

      <header className="masthead-shell">
        <div className="masthead page-wrap">
          <a className="brand" href="#top" aria-label="ANH — kembali ke atas">
            <strong>ANH</strong><span>Portofolio Pribadi</span>
          </a>
          <SiteNavigation />
          <ThemeToggle />
          <a className="header-cta" href="#contact">Mari Terhubung <ArrowRight size={14} /></a>
        </div>
      </header>

      <section className="hero page-wrap" id="top" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">Discipline turns plans<br />into progress</p>
          <h1 id="hero-title" aria-label="Akbar Nur Hidayanto">
            <span>Akbar</span>
            <span className="hero-name-row">
              <span className="hero-name-accent">Nur</span>
              <i className="hero-name-rule" aria-hidden="true" />
              <span className="hero-surname">Hidayanto</span>
            </span>
          </h1>
          <p className="hero-tagline">Perjalanan Berkarya,<br />Belajar &amp; Mencipta.</p>
          <p className="hero-intro">{profile.introduction}</p>
          <a className="dark-button" href="#journey">Lihat Perjalanan Saya <ArrowRight size={14} /></a>
          <dl className="stats" aria-label="Statistik karier">
            {statistics.map((stat) => <div key={stat.label}><dt>{stat.value}</dt><dd>{stat.label}</dd></div>)}
          </dl>
        </div>

        <div className="hero-art" aria-label="Ilustrasi potret Akbar Nur Hidayanto">
          <Image className="hero-portrait" src="/profile-artwork-transparent.webp" width={941} height={1671} priority sizes="(max-width: 820px) 100vw, 60vw" alt="Potret Akbar Nur Hidayanto bergaya tinta dengan kastel, bulan, buku, laptop, globe, dan kamera" />
          <p className="edge-copy">A<br />brighter<br />more<br />meaningful<br />tomorrow</p>
        </div>
      </section>

      <section className="about compact-section" id="about" aria-labelledby="about-heading">
        <div className="section-wrap about-grid">
          <SectionIndex title="Tentang Saya" caption="Manusia / Gagasan / Kemajuan" />
          <div className="about-copy" data-reveal>
            <h3 id="about-heading">Pikiran yang ingin tahu.<br />Pencipta solusi nyata.</h3>
            <p>Saya adalah pemecah masalah yang senang mengubah gagasan kompleks menjadi solusi sederhana dan bermakna. Dengan latar belakang teknologi, desain, dan semangat belajar berkelanjutan, saya selalu antusias menghadapi tantangan baru dan menciptakan dampak positif.</p>
          </div>
          <div className="capabilities" data-reveal>
            {capabilities.map((item, index) => {
              const Icon = capabilityIcons[index];
              return <article key={item.title}><Icon size={25} strokeWidth={1.6} /><div><h4>{item.title}</h4><p>{item.description}</p></div></article>;
            })}
          </div>
        </div>
      </section>

      <section className="journey compact-section" id="journey" aria-label="Perjalanan">
        <div className="section-wrap journey-grid">
          <SectionIndex title="Perjalanan" caption="Lini masa / pertumbuhan" />
          <div className="timeline" data-reveal id="journey-heading">
            {journey.map((item) => <article key={item.period}><i /><b>{item.period}</b><h3>{item.title}</h3><p>{item.description}</p></article>)}
          </div>
          <div className="journey-next" data-reveal><ArrowRight size={20} /><p>Versi yang<br />lebih baik<br />di depan</p></div>
        </div>
      </section>

      <section className="experience compact-section" id="experience" aria-label="Pengalaman">
        <div className="section-wrap indexed-grid">
          <SectionIndex title="Pengalaman" caption="Kerja nyata / dampak nyata" />
          <div className="experience-cards" id="experience-heading">
            {experience.map((item, index) => <article className="experience-card" key={item.index} data-reveal>
              <div className="card-image"><Image src={experienceImages[index]} fill sizes="(max-width: 820px) 90vw, 27vw" alt="" /></div>
              <div className="card-copy"><h3>{item.role}</h3><b>{item.period}</b><p>{item.description}</p><ArrowRight size={17} /></div>
            </article>)}
          </div>
        </div>
      </section>

      <section className="work compact-section" id="work" aria-label="Karya pilihan">
        <div className="section-wrap indexed-grid">
          <SectionIndex title="Karya Pilihan" caption="Gagasan / menjadi karya" />
          <div className="work-main">
            <div className="project-grid" id="work-heading">
              {projects.map((project, index) => <article className="project" key={project.index} data-reveal>
                <div className="project-image"><Image src={projectImages[index]} fill sizes="(max-width: 820px) 90vw, 20vw" alt="" /></div>
                <div><h3>{project.title}</h3><ArrowUpRight size={16} /><p>{project.category}<br />{project.year}</p></div>
              </article>)}
            </div>
          </div>
          <a className="outline-button projects-link" href="#work-heading">Lihat Semua Proyek <ArrowRight size={14} /></a>
        </div>
      </section>

      <section className="certificates compact-section" id="certificates" aria-label="Sertifikasi">
        <div className="section-wrap indexed-grid">
          <SectionIndex title="Sertifikasi" caption="Validasi / untuk kemajuan" />
          <div className="certificate-grid" id="certificates-heading">
            {certifications.map((item, index) => {
              const Icon = certificateIcons[index];
              return <article key={item.name} data-reveal>
                <div className="certificate-preview" aria-hidden="true"><Icon size={38} strokeWidth={1.35} /></div>
                <div className="certificate-details"><h3>{item.name}</h3><p>{item.year}</p></div>
              </article>;
            })}
          </div>
        </div>
      </section>

      <section className="contact" id="contact" aria-labelledby="contact-heading">
        <Image className="contact-art" src="/footer-castle-art.webp" fill sizes="100vw" alt="" />
        <div className="section-wrap contact-grid">
          <SectionIndex title="Mari Terhubung" caption="Terbuka untuk peluang / dan kolaborasi" />
          <div className="contact-copy" data-reveal>
            <h3 id="contact-heading">Mari Ciptakan Sesuatu yang Bermakna.</h3>
            <p>Saya selalu terbuka untuk peluang baru, kolaborasi,<br />dan percakapan yang bermakna.</p>
            <a className="light-button" href={socials[1].href}>Hubungi Saya <ArrowRight size={14} /></a>
            <div className="socials">
              <a href={socials[0].href} aria-label="LinkedIn" data-tooltip="LinkedIn"><LinkedInLogo /></a>
              <a href={socials[1].href} aria-label="Surel" data-tooltip="Surel"><Mail size={19} /></a>
              <a href={socials[2].href} aria-label="GitHub" data-tooltip="GitHub"><GitHubLogo /></a>
              <a href={socials[3].href} aria-label="Instagram" data-tooltip="Instagram"><InstagramLogo /></a>
            </div>
          </div>
          <p className="contact-note">Same<br />curiosity<br />a brighter<br />horizon</p>
        </div>
      </section>

      <footer><div className="section-wrap footer-grid"><a href="#top">ANH</a><p>© {new Date().getFullYear()} Akbar Nur Hidayanto. Seluruh hak cipta dilindungi.</p><p>Dibangun dengan tujuan.</p><a href="#top" aria-label="Kembali ke atas"><ArrowUp size={17} /></a></div></footer>
    </main>
  );
}
