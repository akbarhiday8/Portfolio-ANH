export const portfolioData = {
  profile: {
    name: 'Akbar Nur',
    monogram: 'ANH',
    eyebrow: 'Discipline turns plans into progress',
    tagline: 'Perjalanan Berkarya, Belajar & Mencipta.',
    introduction:
      'Profesional multidisiplin yang bersemangat memecahkan masalah nyata melalui teknologi, pemikiran terstruktur, dan pembelajaran berkelanjutan.',
    about:
      'Saya bekerja di bidang teknologi, operasional, administrasi, dan dokumentasi—menghadirkan struktur pada pekerjaan kompleks serta mengubah gagasan menjadi hasil yang nyata.',
    artwork: '/profile-artwork.webp',
  },
  statistics: [
    { value: '4+', label: 'Tahun Pengalaman' },
    { value: '10+', label: 'Proyek' },
    { value: '15+', label: 'Sertifikasi' },
    { value: '∞', label: 'Terus Belajar' },
  ],
  capabilities: [
    { title: 'Pendidikan', description: 'Fondasi yang kokoh', icon: 'book' },
    { title: 'Pengalaman', description: 'Mengubah pengetahuan menjadi praktik', icon: 'briefcase' },
    { title: 'Pelatihan', description: 'Peningkatan berkelanjutan', icon: 'pencil' },
    { title: 'Proyek', description: 'Gagasan menjadi solusi nyata', icon: 'grid' },
    { title: 'Sertifikasi', description: 'Keahlian dan kompetensi tervalidasi', icon: 'award' },
    { title: 'Minat', description: 'Menjelajah melampaui batas', icon: 'compass' },
  ],
  journey: [
    { period: '2018 — 2022', title: 'Pendidikan', description: 'Membangun fondasi' },
    { period: '2022 — 2023', title: 'Langkah Awal', description: 'Memasuki dunia profesional' },
    { period: '2023 — 2024', title: 'Pertumbuhan', description: 'Memperluas keterampilan dan pengalaman' },
    { period: '2024 — Sekarang', title: 'Cakrawala Baru', description: 'Menciptakan dampak yang lebih besar' },
  ],
  experience: [
    {
      index: '01',
      role: 'Staf Operasional',
      organization: 'Operasional Profesional',
      period: '2020 — 2022',
      description: 'Mendukung operasional harian dan meningkatkan efisiensi alur kerja melalui pelaksanaan yang jelas dan dapat diandalkan.',
      tone: 'charcoal',
    },
    {
      index: '02',
      role: 'Dukungan Administratif',
      organization: 'Administrasi Bisnis',
      period: '2022 — 2024',
      description: 'Menata arsip, mengoordinasikan proses, dan memastikan pekerjaan penting berjalan dengan akurat.',
      tone: 'paper',
    },
    {
      index: '03',
      role: 'Kontributor Proyek Digital',
      organization: 'Praktik Mandiri',
      period: '2024 — Sekarang',
      description: 'Menghubungkan riset, teknologi, dan dokumentasi untuk menciptakan hasil digital yang bermanfaat.',
      tone: 'crimson',
    },
  ],
  projects: [
    { index: '01', title: 'BYD Harmony Auto', category: 'Aplikasi Web', year: '2026', layout: 'wide' },
    { index: '02', title: 'Arsip Operasional', category: 'Operasional · Dokumentasi', year: '2025', layout: 'tall' },
    { index: '03', title: 'Sistem Pelaporan', category: 'Data · Administrasi', year: '2025', layout: 'square' },
    { index: '04', title: 'Catatan Lapangan', category: 'Riset · Pekerjaan Profesional', year: '2024', layout: 'wide' },
  ],
  certifications: [
    { name: 'Sertifikasi Dukungan TI', issuer: 'Sertifikasi Profesional', year: '2025', category: 'Teknologi' },
    { name: 'Sertifikasi Peretasan Etis', issuer: 'Sertifikasi Profesional', year: '2025', category: 'Keamanan' },
    { name: 'Sertifikasi Ahli Microsoft Excel', issuer: 'Sertifikasi Profesional', year: '2024', category: 'Produktivitas' },
    { name: 'Sertifikat Lainnya', issuer: 'Arsip Pembelajaran', year: 'Berkelanjutan', category: 'Pengembangan' },
  ],
  socials: [
    { label: 'LinkedIn', href: '#' },
    { label: 'Surel', href: '#' },
    { label: 'GitHub', href: '#' },
  ],
} as const;
