import Image from 'next/image';
import {
  ArrowRight, ArrowUp, ArrowUpRight, BarChart3, BookOpen,
  BriefcaseBusiness, Code2, FileBadge2, Gamepad2, GraduationCap,
  Link2, Mail, Monitor, ShieldCheck,
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
          <h1 id="hero-title"><span>Akbar</span><span>Nur</span></h1>
          <p className="hero-tagline">Perjalanan Berkarya,<br />Belajar &amp; Mencipta.</p>
          <p className="hero-intro">{profile.introduction}</p>
          <a className="dark-button" href="#journey">Lihat Perjalanan Saya <ArrowRight size={14} /></a>
          <dl className="stats" aria-label="Statistik karier">
            {statistics.map((stat) => <div key={stat.label}><dt>{stat.value}</dt><dd>{stat.label}</dd></div>)}
          </dl>
        </div>

        <div className="hero-art" aria-label="Ilustrasi potret Akbar Nur">
          <Image className="hero-portrait" src="/profile-artwork-transparent.webp" width={941} height={1671} priority sizes="(max-width: 820px) 100vw, 60vw" alt="Potret Akbar Nur bergaya tinta dengan kastel, bulan, buku, laptop, globe, dan kamera" />
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
              <a href={socials[0].href} aria-label="LinkedIn"><Link2 size={18} /></a>
              <a href={socials[1].href} aria-label="Surel"><Mail size={18} /></a>
              <a href={socials[2].href} aria-label="GitHub"><Code2 size={18} /></a>
            </div>
          </div>
          <p className="contact-note">Same<br />curiosity<br />a brighter<br />horizon</p>
        </div>
      </section>

      <footer><div className="section-wrap footer-grid"><a href="#top">ANH</a><p>© {new Date().getFullYear()} Akbar Nur. Seluruh hak cipta dilindungi.</p><p>Dibangun dengan tujuan.</p><a href="#top" aria-label="Kembali ke atas"><ArrowUp size={17} /></a></div></footer>
    </main>
  );
}
