import { z } from 'zod';
import type { CmsCollection, CmsStatus } from '@/lib/cms/types';

const shortText = z.string().trim().max(240);
const longText = z.string().trim().max(12_000);
const optionalShortText = shortText.optional().default('');
const optionalLongText = longText.optional().default('');
const textList = z.array(z.string().trim().min(1).max(500)).max(100).optional().default([]);
const legalSections = z.array(z.object({
  heading: shortText,
  paragraphs: z.array(longText).min(1).max(30),
}).loose()).max(30).optional().default([]);

export function isSafeCmsLink(value: string) {
  if (!value) return true;
  if (value.startsWith('/') && !value.startsWith('//')) return true;
  try {
    const protocol = new URL(value).protocol;
    return protocol === 'https:' || protocol === 'http:' || protocol === 'mailto:' || protocol === 'tel:';
  } catch {
    return false;
  }
}

const link = z.string().trim().max(2_048).refine(isSafeCmsLink, 'Tautan harus menggunakan HTTPS, HTTP, mailto, tel, atau path internal.');
const optionalLink = z.union([link, z.literal(''), z.null()]).optional().default('');
const galleryItems = z.array(z.object({
  src: link,
  caption: optionalShortText,
  description: optionalLongText,
}).loose()).max(24).optional().default([]);
const slug = z.string().trim().toLowerCase().max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung.');
const isoDate = z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, 'Tanggal harus menggunakan format YYYY-MM-DD.').optional().default('');

const baseSchemas: Record<CmsCollection, z.ZodType<Record<string, unknown>>> = {
  siteContent: z.object({
    branding: z.object({
      primaryLogo: optionalLink,
      publicLogo: optionalLink,
      cmsLogo: optionalLink,
      loginLogo: optionalLink,
      favicon: optionalLink,
      altText: optionalShortText,
      label: optionalShortText,
    }).loose().optional().default({
      primaryLogo: '', publicLogo: '', cmsLogo: '', loginLogo: '', favicon: '', altText: '', label: '',
    }),
    brandSubtitle: optionalShortText,
    aboutTitle: optionalShortText,
    aboutCaption: optionalShortText,
    aboutHeading: optionalLongText,
    aboutBody: optionalLongText,
    aboutCta: optionalShortText,
    educationTitle: optionalShortText,
    educationCaption: optionalShortText,
    educationNote: optionalLongText,
    experienceTitle: optionalShortText,
    experienceCaption: optionalShortText,
    portfolioTitle: optionalShortText,
    portfolioCaption: optionalShortText,
    certificatesTitle: optionalShortText,
    certificatesCaption: optionalShortText,
    contactTitle: optionalShortText,
    contactCaption: optionalShortText,
    contactHeading: optionalShortText,
    contactDescription: optionalLongText,
    contactLinksLabel: optionalShortText,
    articleEyebrow: optionalShortText,
    articleHeading: optionalShortText,
    articleDescription: optionalLongText,
    privacyEyebrow: optionalShortText,
    privacyTitle: optionalShortText,
    privacyDescription: optionalLongText,
    privacyUpdatedAt: isoDate,
    privacySections: legalSections,
    disclaimerEyebrow: optionalShortText,
    disclaimerTitle: optionalShortText,
    disclaimerDescription: optionalLongText,
    disclaimerUpdatedAt: isoDate,
    disclaimerSections: legalSections,
    footerName: optionalShortText,
    footerSubtitle: optionalShortText,
    copyrightText: optionalShortText,
  }).loose(),
  profile: z.object({
    name: optionalShortText,
    monogram: optionalShortText,
    eyebrow: optionalShortText,
    tagline: optionalShortText,
    introduction: optionalLongText,
    about: optionalLongText,
    artwork: optionalLink,
  }).loose(),
  statistics: z.object({ value: optionalShortText, label: optionalShortText }).loose(),
  capabilities: z.object({ title: optionalShortText, description: optionalLongText, icon: optionalShortText }).loose(),
  education: z.object({ period: optionalShortText, title: optionalShortText, description: optionalLongText }).loose(),
  experience: z.object({
    role: optionalShortText,
    organization: optionalShortText,
    period: optionalShortText,
    description: optionalLongText,
    responsibilities: textList,
    image: optionalLink,
    tone: z.union([z.enum(['charcoal', 'paper', 'crimson']), z.literal('')]).optional().default(''),
  }).loose(),
  projects: z.object({
    slug: slug.optional(),
    title: optionalShortText,
    displayTitle: optionalShortText,
    category: optionalShortText,
    year: optionalShortText,
    layout: z.union([z.enum(['wide', 'tall', 'square']), z.literal('')]).optional().default(''),
    image: optionalLink,
    role: optionalShortText,
    discipline: optionalShortText,
    artifactType: optionalShortText,
    technologies: textList,
    summary: optionalLongText,
    challenge: optionalLongText,
    objective: optionalLongText,
    approach: optionalLongText,
    evidence: z.object({ label: optionalShortText, href: optionalLink }).loose().optional().default({ label: '', href: '' }),
    repositoryUrl: optionalLink,
    scope: textList,
    process: z.array(z.object({ title: shortText, description: longText }).loose()).max(30).optional().default([]),
    outcome: optionalLongText,
    gallery: galleryItems,
    seoTitle: optionalShortText,
    seoDescription: optionalLongText,
    seoImage: optionalLink,
  }).loose().superRefine((data, context) => {
    const href = data.evidence?.href || '';
    if (href && /\.(?:avif|gif|jpe?g|png|svg|webp)(?:[?#].*)?$/i.test(href)) {
      context.addIssue({
        code: 'custom',
        path: ['evidence', 'href'],
        message: 'Gunakan alamat website atau dokumen publik, bukan URL file gambar.',
      });
    }
  }),
  certifications: z.object({
    name: optionalShortText,
    issuer: optionalShortText,
    year: optionalShortText,
    category: optionalShortText,
    type: optionalShortText,
    status: optionalShortText,
    credentialId: optionalShortText,
    issuedAt: isoDate,
    credentialUrl: optionalLink,
    image: optionalLink,
    pages: galleryItems,
    description: optionalLongText,
    topics: textList,
  }).loose(),
  articles: z.object({
    slug: slug.optional(),
    title: optionalShortText,
    category: optionalShortText,
    publishedAt: optionalShortText,
    readTime: optionalShortText,
    excerpt: optionalLongText,
    lead: optionalLongText,
    takeaways: textList,
    sections: z.array(z.object({
      heading: shortText,
      paragraphs: z.array(longText).min(1).max(30),
    }).loose()).max(50).optional().default([]),
    quote: optionalLongText,
    closingHeading: optionalShortText,
    closing: optionalLongText,
    seoTitle: optionalShortText,
    seoDescription: optionalLongText,
    seoImage: optionalLink,
  }).loose(),
  socials: z.object({
    label: optionalShortText,
    icon: optionalShortText,
    customIcon: optionalLink,
    href: optionalLink,
  }).loose(),
};

const hasText = (data: Record<string, unknown>, key: string) => typeof data[key] === 'string' && data[key].trim().length > 0;
const hasList = (data: Record<string, unknown>, key: string) => Array.isArray(data[key]) && data[key].length > 0;

function publishingErrors(collection: CmsCollection, data: Record<string, unknown>) {
  const required: Partial<Record<CmsCollection, Array<[string, string]>>> = {
    siteContent: [
      ['brandSubtitle', 'Subjudul logo'],
      ['privacyEyebrow', 'Label halaman Privasi'], ['privacyTitle', 'Judul halaman Privasi'],
      ['privacyDescription', 'Pengantar halaman Privasi'], ['privacyUpdatedAt', 'Tanggal pembaruan Privasi'],
      ['disclaimerEyebrow', 'Label halaman Disclaimer'], ['disclaimerTitle', 'Judul halaman Disclaimer'],
      ['disclaimerDescription', 'Pengantar halaman Disclaimer'], ['disclaimerUpdatedAt', 'Tanggal pembaruan Disclaimer'],
    ],
    profile: [['name', 'Nama lengkap'], ['monogram', 'Monogram'], ['introduction', 'Perkenalan'], ['artwork', 'Gambar profil']],
    statistics: [['value', 'Nilai'], ['label', 'Keterangan']],
    capabilities: [['title', 'Judul'], ['description', 'Deskripsi']],
    education: [['period', 'Periode'], ['title', 'Institusi atau gelar'], ['description', 'Deskripsi']],
    experience: [['role', 'Posisi'], ['period', 'Periode'], ['description', 'Ringkasan'], ['image', 'Gambar pengalaman']],
    projects: [
      ['slug', 'Alamat halaman'], ['title', 'Judul proyek'], ['category', 'Kategori'], ['summary', 'Ringkasan'],
      ['image', 'Gambar utama'], ['role', 'Peran'], ['discipline', 'Bidang'], ['artifactType', 'Jenis hasil'],
      ['challenge', 'Konteks'], ['objective', 'Tujuan proyek'], ['approach', 'Pendekatan'], ['outcome', 'Hasil akhir'],
    ],
    certifications: [['name', 'Nama sertifikasi'], ['issuer', 'Instansi penerbit'], ['image', 'Bukti sertifikat'], ['description', 'Deskripsi']],
    articles: [['slug', 'Alamat artikel'], ['title', 'Judul artikel'], ['excerpt', 'Ringkasan kartu'], ['lead', 'Paragraf pembuka'], ['closing', 'Penutup']],
    socials: [['label', 'Nama tampilan'], ['href', 'Tautan']],
  };

  const errors = (required[collection] ?? []).filter(([key]) => !hasText(data, key)).map(([, label]) => `${label} wajib diisi sebelum dipublikasikan.`);
  if (collection === 'siteContent') {
    if (!hasList(data, 'privacySections')) errors.push('Isi Kebijakan Privasi wajib memiliki minimal satu bagian.');
    if (!hasList(data, 'disclaimerSections')) errors.push('Isi Disclaimer wajib memiliki minimal satu bagian.');
  }
  if (collection === 'experience' && !hasList(data, 'responsibilities')) errors.push('Minimal satu tugas dan tanggung jawab wajib diisi.');
  if (collection === 'projects') {
    if (!hasList(data, 'scope')) errors.push('Minimal satu kontribusi utama wajib diisi.');
    if (!hasList(data, 'process')) errors.push('Minimal satu langkah proses wajib diisi.');
  }
  if (collection === 'certifications' && !hasList(data, 'topics')) errors.push('Minimal satu materi sertifikasi wajib diisi.');
  if (collection === 'articles' && !hasList(data, 'sections')) errors.push('Minimal satu bagian artikel wajib diisi.');
  return errors;
}

export function validateCmsRecord(collection: CmsCollection, input: unknown, status: CmsStatus) {
  const parsed = baseSchemas[collection].safeParse(input);
  if (!parsed.success) {
    return {
      success: false as const,
      errors: parsed.error.issues.map((issue) => `${issue.path.join('.') || 'Konten'}: ${issue.message}`),
    };
  }
  const errors = status === 'published' ? publishingErrors(collection, parsed.data) : [];
  return errors.length
    ? { success: false as const, errors }
    : { success: true as const, data: parsed.data };
}
