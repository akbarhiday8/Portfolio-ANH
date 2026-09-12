import type { CmsCollection } from '@/lib/cms-server';

export type CmsFieldType = 'text' | 'textarea' | 'url' | 'image' | 'list' | 'select' | 'steps' | 'articleSections';
export type CmsField = {
  key: string;
  label: string;
  type: CmsFieldType;
  required?: boolean;
  helper?: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  wide?: boolean;
};

export type CmsModuleDefinition = {
  collection: CmsCollection;
  label: string;
  singular: string;
  description: string;
  singleton?: boolean;
  fields: CmsField[];
};

const text = (key: string, label: string, options: Partial<CmsField> = {}): CmsField => ({ key, label, type: 'text', ...options });
const area = (key: string, label: string, options: Partial<CmsField> = {}): CmsField => ({ key, label, type: 'textarea', wide: true, ...options });

export const cmsModules: CmsModuleDefinition[] = [
  {
    collection: 'siteContent', label: 'Teks & Struktur', singular: 'pengaturan teks', singleton: true,
    description: 'Judul section, teks kontak, artikel, identitas footer, dan label utama website.',
    fields: [
      text('brandSubtitle', 'Subjudul logo', { required: true }),
      text('aboutTitle', 'Judul section Tentang'), text('aboutCaption', 'Caption section Tentang'),
      area('aboutHeading', 'Headline Tentang', { helper: 'Pisahkan baris dengan Enter. Coretan merah tetap mengikuti kata terakhir.' }),
      area('aboutBody', 'Deskripsi Tentang'), text('aboutCta', 'Label tombol Tentang'),
      text('educationTitle', 'Judul Pendidikan'), text('educationCaption', 'Caption Pendidikan'), area('educationNote', 'Catatan samping Pendidikan'),
      text('experienceTitle', 'Judul Pengalaman'), text('experienceCaption', 'Caption Pengalaman'),
      text('portfolioTitle', 'Judul Portfolio'), text('portfolioCaption', 'Caption Portfolio'),
      text('certificatesTitle', 'Judul Sertifikasi'), text('certificatesCaption', 'Caption Sertifikasi'),
      text('contactTitle', 'Judul Kontak'), text('contactCaption', 'Caption Kontak'), text('contactHeading', 'Headline Kontak'),
      area('contactDescription', 'Deskripsi Kontak'), text('contactAvailability', 'Status kontak'), area('contactNote', 'Catatan dekoratif Kontak'),
      text('articleEyebrow', 'Label halaman Artikel'), text('articleHeading', 'Headline halaman Artikel'), area('articleDescription', 'Deskripsi halaman Artikel'),
      text('footerName', 'Nama pada footer'), text('footerSubtitle', 'Subjudul footer'), text('copyrightText', 'Teks hak cipta'),
    ],
  },
  {
    collection: 'profile', label: 'Profil & Beranda', singular: 'profil', singleton: true,
    description: 'Nama, headline, perkenalan, dan visual utama pada bagian paling atas.',
    fields: [
      text('name', 'Nama lengkap', { required: true }), text('monogram', 'Monogram', { required: true }),
      text('eyebrow', 'Kalimat pembuka'), text('tagline', 'Tagline'),
      area('introduction', 'Perkenalan singkat', { required: true }), area('about', 'Ringkasan profil'),
      { key: 'artwork', label: 'Gambar profil utama', type: 'image', wide: true, helper: 'Gunakan WebP transparan untuk performa terbaik.' },
    ],
  },
  {
    collection: 'statistics', label: 'Statistik', singular: 'statistik',
    description: 'Angka ringkas yang tampil di bawah pengantar beranda.',
    fields: [text('value', 'Nilai', { required: true, placeholder: '4+' }), text('label', 'Keterangan', { required: true })],
  },
  {
    collection: 'capabilities', label: 'Keunggulan', singular: 'keunggulan',
    description: 'Daftar bidang pada section Tentang Saya.',
    fields: [
      text('title', 'Judul', { required: true }), area('description', 'Deskripsi', { required: true }),
      { key: 'icon', label: 'Ikon', type: 'select', options: [
        { value: 'book', label: 'Pendidikan' }, { value: 'briefcase', label: 'Tas kerja' },
        { value: 'chart', label: 'Grafik' }, { value: 'grid', label: 'Proyek' },
        { value: 'award', label: 'Sertifikasi' }, { value: 'game', label: 'Minat' },
      ] },
    ],
  },
  {
    collection: 'education', label: 'Pendidikan', singular: 'pendidikan',
    description: 'Riwayat pendidikan formal yang tampil sebagai lini masa.',
    fields: [text('period', 'Periode / Jenjang', { required: true }), text('title', 'Institusi atau gelar', { required: true }), area('description', 'Deskripsi', { required: true })],
  },
  {
    collection: 'experience', label: 'Pengalaman', singular: 'pengalaman',
    description: 'Riwayat pekerjaan beserta tugas dan tanggung jawabnya.',
    fields: [
      text('index', 'Nomor urut'), text('role', 'Posisi', { required: true }), text('organization', 'Organisasi / Bidang'), text('period', 'Periode', { required: true }),
      area('description', 'Ringkasan', { required: true }),
      { key: 'responsibilities', label: 'Tugas dan tanggung jawab', type: 'list', wide: true, helper: 'Satu tanggung jawab per baris.' },
      { key: 'image', label: 'Gambar pengalaman', type: 'image', wide: true },
      { key: 'tone', label: 'Aksen warna', type: 'select', options: [
        { value: 'charcoal', label: 'Charcoal' }, { value: 'paper', label: 'Paper' }, { value: 'crimson', label: 'Crimson' },
      ] },
    ],
  },
  {
    collection: 'projects', label: 'Portfolio', singular: 'proyek',
    description: 'Studi kasus, proyek digital, dokumen, data, dan hasil pekerjaan lainnya.',
    fields: [
      text('index', 'Nomor urut'), text('slug', 'Alamat halaman', { required: true, helper: 'Huruf kecil dan tanda hubung, contoh: sistem-pelaporan.' }),
      text('title', 'Judul proyek', { required: true }), text('category', 'Kategori', { required: true }), text('year', 'Tahun'),
      { key: 'layout', label: 'Proporsi kartu', type: 'select', options: [
        { value: 'wide', label: 'Lebar' }, { value: 'tall', label: 'Tinggi' }, { value: 'square', label: 'Persegi' },
      ] },
      { key: 'image', label: 'Gambar utama', type: 'image', wide: true },
      text('role', 'Peran'), text('discipline', 'Bidang'), text('artifactType', 'Jenis hasil'),
      area('summary', 'Ringkasan proyek', { required: true }), area('challenge', 'Konteks / Tantangan'), area('approach', 'Pendekatan / Solusi'),
      text('evidence.label', 'Label tautan bukti'), { key: 'evidence.href', label: 'Tautan bukti proyek', type: 'url', helper: 'Satu tautan: website atau dokumen yang dapat dilihat.' },
      { key: 'scope', label: 'Kontribusi utama', type: 'list', wide: true, helper: 'Satu kontribusi per baris.' },
      { key: 'process', label: 'Proses singkat', type: 'steps', wide: true, helper: 'Format setiap baris: Judul | Penjelasan.' },
      area('outcome', 'Hasil akhir'),
    ],
  },
  {
    collection: 'certifications', label: 'Sertifikasi', singular: 'sertifikasi',
    description: 'Bukti sertifikat, instansi penerbit, dan materi yang dipelajari atau diujikan.',
    fields: [
      text('name', 'Nama sertifikasi', { required: true }), text('issuer', 'Instansi penerbit', { required: true }), text('year', 'Tahun'), text('category', 'Kategori'),
      { key: 'image', label: 'Bukti sertifikat', type: 'image', wide: true, helper: 'Portrait dan landscape didukung otomatis pada viewer publik.' },
      area('description', 'Deskripsi'),
      { key: 'topics', label: 'Materi dipelajari / diujikan', type: 'list', wide: true, helper: 'Satu materi per baris. Daftar panjang akan diringkas otomatis pada website.' },
    ],
  },
  {
    collection: 'articles', label: 'Artikel', singular: 'artikel',
    description: 'Tulisan, ringkasan, struktur isi, dan informasi penerbitan.',
    fields: [
      text('slug', 'Alamat artikel', { required: true }), text('title', 'Judul artikel', { required: true }), text('category', 'Kategori'),
      text('publishedAt', 'Tanggal terbit'), text('readTime', 'Estimasi baca'), area('excerpt', 'Ringkasan kartu', { required: true }),
      area('lead', 'Paragraf pembuka'), { key: 'takeaways', label: 'Ringkasan utama', type: 'list', wide: true, helper: 'Satu poin per baris.' },
      { key: 'sections', label: 'Isi artikel', type: 'articleSections', wide: true, helper: 'Gunakan ## untuk judul bagian. Pisahkan paragraf dengan satu baris kosong.' },
      area('quote', 'Kutipan penekanan'), text('closingHeading', 'Judul penutup'), area('closing', 'Penutup'),
    ],
  },
  {
    collection: 'socials', label: 'Kontak & Sosial', singular: 'tautan',
    description: 'Tautan LinkedIn, email, GitHub, Instagram, WhatsApp, dan media sosial lainnya.',
    fields: [
      text('label', 'Nama tampilan', { required: true }),
      { key: 'icon', label: 'Ikon bawaan', type: 'select', helper: 'Pilih ikon yang sesuai. Jika memakai ikon kustom, pilihan ini menjadi fallback.', options: [
        { value: 'linkedin', label: 'LinkedIn' }, { value: 'github', label: 'GitHub' },
        { value: 'instagram', label: 'Instagram' }, { value: 'whatsapp', label: 'WhatsApp' },
        { value: 'email', label: 'Email / Surel' }, { value: 'website', label: 'Website' },
        { value: 'youtube', label: 'YouTube' }, { value: 'tiktok', label: 'TikTok' },
        { value: 'x', label: 'X / Twitter' }, { value: 'facebook', label: 'Facebook' },
        { value: 'telegram', label: 'Telegram' }, { value: 'discord', label: 'Discord' },
        { value: 'dribbble', label: 'Dribbble' }, { value: 'behance', label: 'Behance' },
        { value: 'medium', label: 'Medium' }, { value: 'threads', label: 'Threads' },
        { value: 'figma', label: 'Figma' },
      ] },
      { key: 'customIcon', label: 'Ikon kustom', type: 'image', wide: true, helper: 'Opsional. Gunakan PNG/WebP/JPG kecil dengan latar transparan; file akan tersimpan di Media agar mudah dikelola.' },
      { key: 'href', label: 'Tautan', type: 'url', required: true, helper: 'Untuk email gunakan mailto:, untuk WhatsApp gunakan https://wa.me/...' },
    ],
  },
];

export const cmsModuleMap = new Map(cmsModules.map((module) => [module.collection, module]));
