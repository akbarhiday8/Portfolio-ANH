import type { CmsCollection } from '@/lib/cms/types';

export type CmsFieldType = 'text' | 'textarea' | 'url' | 'date' | 'image' | 'asset' | 'list' | 'select' | 'steps' | 'articleSections' | 'gallery';
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

export const brandingFields: CmsField[] = [
  { key: 'branding.primaryLogo', label: 'Logo utama', type: 'image', wide: true, helper: 'Fallback bersama untuk website, CMS, dan halaman login. Gunakan PNG atau WebP transparan.' },
  { key: 'branding.publicLogo', label: 'Override logo website', type: 'image', wide: true, helper: 'Opsional. Kosongkan untuk memakai logo utama.' },
  { key: 'branding.cmsLogo', label: 'Override logo CMS', type: 'image', wide: true, helper: 'Opsional. Kosongkan untuk memakai logo utama.' },
  { key: 'branding.loginLogo', label: 'Override logo login', type: 'image', wide: true, helper: 'Opsional. Kosongkan untuk memakai logo utama.' },
  { key: 'branding.favicon', label: 'Favicon', type: 'image', wide: true, helper: 'Gunakan PNG atau WebP persegi. SVG tidak dibuka melalui uploader CMS.' },
  text('branding.altText', 'Teks alternatif logo', { helper: 'Jelaskan identitas logo secara singkat untuk pembaca layar.' }),
  text('branding.label', 'Label merek', { helper: 'Nama identitas yang dipakai sebagai fallback aksesibilitas.' }),
];

export const legalFields: CmsField[] = [
  text('privacyEyebrow', 'Label halaman Privasi', { required: true }), text('privacyTitle', 'Judul halaman Privasi', { required: true }), area('privacyDescription', 'Pengantar halaman Privasi', { required: true }),
  { key: 'privacyUpdatedAt', label: 'Tanggal pembaruan Privasi', type: 'date', required: true },
  { key: 'privacySections', label: 'Isi Kebijakan Privasi', type: 'articleSections', required: true, wide: true, helper: 'Tambahkan judul dan isi untuk setiap bagian.' },
  text('disclaimerEyebrow', 'Label halaman Disclaimer', { required: true }), text('disclaimerTitle', 'Judul halaman Disclaimer', { required: true }), area('disclaimerDescription', 'Pengantar halaman Disclaimer', { required: true }),
  { key: 'disclaimerUpdatedAt', label: 'Tanggal pembaruan Disclaimer', type: 'date', required: true },
  { key: 'disclaimerSections', label: 'Isi Disclaimer', type: 'articleSections', required: true, wide: true, helper: 'Tambahkan judul dan isi untuk setiap bagian.' },
];

export const brandingModule: CmsModuleDefinition = {
  collection: 'siteContent',
  label: 'Branding',
  singular: 'branding',
  description: 'Logo bersama dan override untuk website, CMS, halaman login, serta favicon.',
  singleton: true,
  fields: brandingFields,
};

export const legalModule: CmsModuleDefinition = {
  collection: 'siteContent',
  label: 'Kebijakan Situs',
  singular: 'kebijakan situs',
  description: 'Kelola Kebijakan Privasi dan Disclaimer sebagai dua halaman publik yang terpisah.',
  singleton: true,
  fields: legalFields,
};

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
      area('contactDescription', 'Deskripsi Kontak'), text('contactLinksLabel', 'Label tautan kontak'),
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
      text('role', 'Posisi', { required: true }), text('organization', 'Organisasi / Bidang'), text('period', 'Periode', { required: true }),
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
      text('slug', 'Alamat halaman', { required: true, placeholder: 'contoh: website-portfolio-anh' }),
      text('title', 'Judul proyek', { required: true }), text('category', 'Kategori', { required: true }), text('year', 'Tahun'),
      { key: 'layout', label: 'Proporsi kartu', type: 'select', options: [
        { value: 'wide', label: 'Lebar' }, { value: 'tall', label: 'Tinggi' }, { value: 'square', label: 'Persegi' },
      ] },
      { key: 'image', label: 'Gambar utama', type: 'image', wide: true },
      text('role', 'Peran'), text('discipline', 'Bidang'), text('artifactType', 'Jenis hasil'),
      { key: 'technologies', label: 'Teknologi / alat', type: 'list', wide: true, helper: 'Satu teknologi atau alat per baris.' },
      area('summary', 'Ringkasan proyek', { required: true }), area('challenge', 'Konteks / Tantangan'), area('objective', 'Tujuan proyek'), area('approach', 'Pendekatan / Solusi'),
      text('evidence.label', 'Teks tombol bukti'), { key: 'evidence.href', label: 'Link proyek atau dokumen', type: 'asset', wide: true, helper: 'Masukkan link website atau unggah dokumen proyek.' },
      { key: 'repositoryUrl', label: 'Link repository', type: 'url', wide: true, helper: 'Opsional. Isi jika kode proyek dapat dilihat publik.' },
      { key: 'scope', label: 'Kontribusi utama', type: 'list', wide: true, helper: 'Satu kontribusi per baris.' },
      { key: 'process', label: 'Proses singkat', type: 'steps', wide: true, helper: 'Tambahkan langkah satu per satu. Data lama dengan format “Judul | Penjelasan” tetap dibaca.' },
      area('outcome', 'Hasil akhir'),
      { key: 'gallery', label: 'Galeri proyek', type: 'gallery', wide: true, helper: 'Tambahkan dokumentasi portrait atau landscape. Rasio asli dipertahankan dan gambar dapat diperbesar.' },
      text('seoTitle', 'Judul untuk mesin pencari', { helper: 'Opsional. Jika kosong, judul proyek digunakan.' }),
      area('seoDescription', 'Deskripsi untuk mesin pencari', { helper: 'Opsional. Tulis ringkasan singkat sekitar 120–160 karakter.' }),
      { key: 'seoImage', label: 'Gambar saat dibagikan', type: 'image', wide: true, helper: 'Opsional. Jika kosong, gambar utama digunakan.' },
    ],
  },
  {
    collection: 'certifications', label: 'Sertifikasi', singular: 'sertifikasi',
    description: 'Bukti sertifikat, instansi penerbit, dan materi yang dipelajari atau diujikan.',
    fields: [
      text('name', 'Nama sertifikasi', { required: true }), text('issuer', 'Instansi penerbit', { required: true }), text('year', 'Tahun'), text('category', 'Kategori'),
      text('type', 'Jenis sertifikat', { placeholder: 'Contoh: Sertifikat Pelatihan' }), text('status', 'Status', { placeholder: 'Contoh: Sertifikat Resmi' }),
      text('credentialId', 'ID kredensial'), { key: 'issuedAt', label: 'Tanggal terbit', type: 'date' },
      { key: 'credentialUrl', label: 'Link verifikasi kredensial', type: 'url', wide: true },
      { key: 'image', label: 'Bukti sertifikat', type: 'image', wide: true, helper: 'Portrait dan landscape didukung otomatis pada viewer publik.' },
      area('description', 'Deskripsi'),
      { key: 'topics', label: 'Materi dipelajari / diujikan', type: 'list', wide: true, helper: 'Satu materi per baris. Daftar panjang akan diringkas otomatis pada website.' },
    ],
  },
  {
    collection: 'articles', label: 'Artikel', singular: 'artikel',
    description: 'Tulisan, ringkasan, struktur isi, dan informasi penerbitan.',
    fields: [
      text('slug', 'Alamat halaman', { required: true, placeholder: 'contoh: panduan-keamanan-data' }), text('title', 'Judul artikel', { required: true }), text('category', 'Kategori'),
      { key: 'publishedAt', label: 'Tanggal publikasi', type: 'date' }, text('readTime', 'Estimasi waktu baca'), area('excerpt', 'Ringkasan artikel', { required: true }),
      area('lead', 'Paragraf pembuka'), { key: 'takeaways', label: 'Ringkasan utama', type: 'list', wide: true, helper: 'Satu poin per baris.' },
      { key: 'sections', label: 'Isi artikel', type: 'articleSections', wide: true, helper: 'Tambahkan bagian artikel satu per satu.' },
      area('quote', 'Kutipan penekanan'), text('closingHeading', 'Judul penutup'), area('closing', 'Penutup'),
      text('seoTitle', 'Judul untuk mesin pencari', { helper: 'Opsional. Jika kosong, judul artikel digunakan.' }),
      area('seoDescription', 'Deskripsi untuk mesin pencari', { helper: 'Opsional. Tulis ringkasan singkat sekitar 120–160 karakter.' }),
      { key: 'seoImage', label: 'Gambar saat dibagikan', type: 'image', wide: true, helper: 'Opsional. Digunakan ketika artikel dibagikan.' },
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
      { key: 'href', label: 'Link kontak', type: 'url', required: true, placeholder: 'https://contoh.com', helper: 'Untuk email gunakan mailto:, untuk WhatsApp gunakan https://wa.me/...' },
    ],
  },
];

export const cmsModuleMap = new Map(cmsModules.map((module) => [module.collection, module]));
