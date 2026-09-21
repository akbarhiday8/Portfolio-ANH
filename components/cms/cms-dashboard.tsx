'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowDown, ArrowUp, BarChart3, BookOpen, BriefcaseBusiness,
  Check, ChevronDown, ChevronRight, Eye, FileBadge2, FileText, FolderKanban, GraduationCap,
  Download, GripVertical, History, ImageIcon, Link2, ListChecks, LogOut, Menu, MoreHorizontal, PanelRightOpen, Plus, Save, Search,
  Settings2, Sparkles, Trash2, Upload, UserRound, X,
} from 'lucide-react';
import { BrandIdentity } from '@/components/brand-identity';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { brandingModule, cmsModules, legalModule, type CmsField, type CmsModuleDefinition } from '@/lib/cms-fields';
import type { CmsAdmin } from '@/lib/cms-auth';
import type { CmsCollection, CmsRecord, CmsStatus } from '@/lib/cms/types';
import { discardTemporaryMedia, prepareMediaFile, uploadPreparedMedia } from '@/lib/media-client';
import { formatMediaSize, IMAGE_ACCEPT, MEDIA_ACCEPT, type MediaItem } from '@/lib/media-policy';
import { siteContentDefaults } from '@/lib/site-content-defaults';

type CmsCollections = Record<string, CmsRecord[]>;
type ActiveView = 'overview' | 'media' | 'branding' | 'legal' | CmsCollection;
type EditorSection = { title: string; description: string; fields: string[]; collapsed?: boolean };
type CmsIcon = React.ComponentType<{ size?: number }>;
type NavItem = { label: string; view: ActiveView; Icon: CmsIcon };
type ValidationIssue = { label: string; detail: string; level: 'error' | 'warning'; field?: string };
type RevisionSnapshot = { savedAt: string; status: CmsStatus; title: string; data: Record<string, unknown> };
type ArticleSectionDraft = { heading: string; body: string };
type GalleryDraft = { src: string; caption: string; description: string };

const moduleIcons: Record<CmsCollection, React.ComponentType<{ size?: number }>> = {
  siteContent: Settings2,
  profile: UserRound,
  statistics: BarChart3,
  capabilities: Sparkles,
  education: GraduationCap,
  experience: BriefcaseBusiness,
  projects: FolderKanban,
  certifications: FileBadge2,
  articles: FileText,
  socials: Link2,
};

const navPrimary: NavItem[] = [
  { label: 'Ikhtisar', view: 'overview', Icon: BarChart3 },
  { label: 'Beranda & Profil', view: 'profile', Icon: UserRound },
  { label: 'Pendidikan', view: 'education', Icon: GraduationCap },
  { label: 'Pengalaman', view: 'experience', Icon: BriefcaseBusiness },
  { label: 'Portfolio', view: 'projects', Icon: FolderKanban },
  { label: 'Sertifikasi', view: 'certifications', Icon: FileBadge2 },
  { label: 'Artikel', view: 'articles', Icon: FileText },
  { label: 'Media', view: 'media', Icon: ImageIcon },
];

const navSettings: NavItem[] = [
  { label: 'Branding', view: 'branding', Icon: Sparkles },
  { label: 'Teks Website', view: 'siteContent', Icon: Settings2 },
  { label: 'Kebijakan Situs', view: 'legal', Icon: FileText },
  { label: 'Statistik', view: 'statistics', Icon: BarChart3 },
  { label: 'Keunggulan', view: 'capabilities', Icon: Sparkles },
  { label: 'Kontak & Sosial', view: 'socials', Icon: Link2 },
];

const editorSections: Partial<Record<CmsCollection, EditorSection[]>> = {
  siteContent: [
    { title: 'Branding', description: 'Logo utama, variasi konteks, favicon, dan label aksesibel.', fields: ['branding.primaryLogo', 'branding.publicLogo', 'branding.cmsLogo', 'branding.loginLogo', 'branding.favicon', 'branding.altText', 'branding.label'] },
    { title: 'Identitas website', description: 'Logo, footer, dan identitas utama.', fields: ['brandSubtitle', 'footerName', 'footerSubtitle', 'copyrightText'] },
    { title: 'Tentang saya', description: 'Judul dan narasi pada section Tentang.', fields: ['aboutTitle', 'aboutCaption', 'aboutHeading', 'aboutBody', 'aboutCta'] },
    { title: 'Judul section', description: 'Nama dan caption setiap bagian portfolio.', fields: ['educationTitle', 'educationCaption', 'educationNote', 'experienceTitle', 'experienceCaption', 'portfolioTitle', 'portfolioCaption', 'certificatesTitle', 'certificatesCaption'] },
    { title: 'Kontak', description: 'Ajakan dan informasi pada bagian kontak.', fields: ['contactTitle', 'contactCaption', 'contactHeading', 'contactDescription', 'contactLinksLabel'] },
    { title: 'Halaman artikel', description: 'Pengantar untuk daftar artikel.', fields: ['articleEyebrow', 'articleHeading', 'articleDescription'] },
    { title: 'Kebijakan Privasi', description: 'Judul, tanggal pembaruan, dan isi halaman privasi.', fields: ['privacyEyebrow', 'privacyTitle', 'privacyDescription', 'privacyUpdatedAt', 'privacySections'] },
    { title: 'Disclaimer', description: 'Judul, tanggal pembaruan, dan isi halaman disclaimer.', fields: ['disclaimerEyebrow', 'disclaimerTitle', 'disclaimerDescription', 'disclaimerUpdatedAt', 'disclaimerSections'] },
  ],
  profile: [
    { title: 'Identitas', description: 'Nama dan penanda personal.', fields: ['name', 'monogram', 'eyebrow', 'tagline'] },
    { title: 'Perkenalan', description: 'Ringkasan yang dibaca pengunjung.', fields: ['introduction', 'about'] },
    { title: 'Visual utama', description: 'Gambar profil pada beranda.', fields: ['artwork'] },
  ],
  experience: [
    { title: 'Informasi pekerjaan', description: 'Posisi, organisasi, dan periode kerja.', fields: ['role', 'organization', 'period'] },
    { title: 'Deskripsi peran', description: 'Ringkasan serta tanggung jawab utama.', fields: ['description', 'responsibilities'] },
    { title: 'Visual kartu', description: 'Gambar dan aksen tampilan.', fields: ['image', 'tone'] },
  ],
  projects: [
    { title: 'Ringkasan proyek', description: 'Identitas, susunan judul, gambar utama, pengantar, dan metadata pada bagian teratas halaman detail.', fields: ['slug', 'title', 'displayTitle', 'category', 'year', 'image', 'summary', 'role', 'discipline', 'artifactType', 'technologies'] },
    { title: 'Cerita proyek', description: 'Konteks, tujuan, pendekatan, kontribusi, hasil, dan proses yang membentuk studi kasus.', fields: ['challenge', 'objective', 'approach', 'scope', 'outcome', 'process'] },
    { title: 'Bukti proyek', description: 'Satu tautan utama dan galeri visual pendukung. Label tombol dipilih otomatis dari jenis hasil.', fields: ['evidence.href', 'gallery'] },
    { title: 'SEO & Bagikan', description: 'Pengaturan opsional untuk hasil pencarian dan pratinjau saat halaman dibagikan.', fields: ['seoTitle', 'seoDescription', 'seoImage'], collapsed: true },
  ],
  certifications: [
    { title: 'Informasi sertifikasi', description: 'Identitas, status, dan kredensial yang tampil terstruktur pada halaman detail.', fields: ['name', 'issuer', 'year', 'category', 'type', 'status', 'credentialId', 'issuedAt', 'credentialUrl'] },
    { title: 'Bukti sertifikat', description: 'Halaman utama, sisi belakang, dan lampiran ditampilkan berurutan. Ukuran gambar menyesuaikan otomatis.', fields: ['image', 'pages'] },
    { title: 'Ringkasan pembelajaran', description: 'Deskripsi singkat serta daftar materi yang dapat dibuka jika isinya panjang.', fields: ['description', 'topics'] },
  ],
  articles: [
    { title: 'Informasi penerbitan', description: 'Judul, kategori, alamat, dan waktu baca.', fields: ['slug', 'title', 'category', 'publishedAt', 'readTime', 'excerpt'] },
    { title: 'Pembuka', description: 'Lead dan rangkuman gagasan utama.', fields: ['lead', 'takeaways'] },
    { title: 'Isi artikel', description: 'Bagian utama tulisan.', fields: ['sections', 'quote'] },
    { title: 'Penutup', description: 'Kesimpulan artikel.', fields: ['closingHeading', 'closing'] },
    { title: 'Tampilan di pencarian & berbagi', description: 'Judul, deskripsi, dan gambar saat artikel ditemukan atau dibagikan.', fields: ['seoTitle', 'seoDescription', 'seoImage'] },
  ],
};

function sectionsForModule(module: CmsModuleDefinition) {
  const configured = editorSections[module.collection];
  if (!configured) return [{ title: 'Informasi konten', description: module.description, fields: module.fields.map((field) => field.key) }];
  const availableFields = new Set(module.fields.map((field) => field.key));
  const relevant = configured
    .map((section) => ({ ...section, fields: section.fields.filter((field) => availableFields.has(field)) }))
    .filter((section) => section.fields.length > 0);
  const knownFields = new Set(relevant.flatMap((section) => section.fields));
  const remaining = module.fields.filter((field) => !knownFields.has(field.key)).map((field) => field.key);
  return remaining.length ? [...relevant, { title: 'Informasi lainnya', description: 'Pengaturan tambahan untuk konten ini.', fields: remaining }] : relevant;
}

function getPath(data: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((value, key) => value && typeof value === 'object' ? (value as Record<string, unknown>)[key] : undefined, data);
}

function setPath(data: Record<string, unknown>, path: string, value: unknown) {
  // Keep the typing hot path cheap: clone only the objects along the edited path.
  const clone: Record<string, unknown> = { ...data };
  const keys = path.split('.');
  let cursor = clone;
  keys.forEach((key, index) => {
    if (index === keys.length - 1) cursor[key] = value;
    else {
      cursor[key] = cursor[key] && typeof cursor[key] === 'object' && !Array.isArray(cursor[key])
        ? { ...(cursor[key] as Record<string, unknown>) }
        : {};
      cursor = cursor[key] as Record<string, unknown>;
    }
  });
  return clone;
}

function fieldText(field: CmsField, value: unknown) {
  if (field.type === 'list') return Array.isArray(value) ? value.join('\n') : '';
  if (field.type === 'steps') return Array.isArray(value) ? value.map((item) => {
    const step = item as { title?: string; description?: string };
    return `${step.title ?? ''} | ${step.description ?? ''}`;
  }).join('\n') : typeof value === 'string' ? value : '';
  if (field.type === 'articleSections') return Array.isArray(value) ? value.map((item) => {
    const section = item as { heading?: string; paragraphs?: string[] };
    return `## ${section.heading ?? ''}\n${(section.paragraphs ?? []).join('\n\n')}`;
  }).join('\n\n') : '';
  return typeof value === 'string' || typeof value === 'number' ? String(value) : '';
}

function parseField(field: CmsField, value: string): unknown {
  if (field.type === 'list') return value.split('\n').map((item) => item.trim()).filter(Boolean);
  if (field.type === 'steps') return value.split('\n').map((item) => {
    const [title, ...description] = item.split('|');
    return { title: title.trim(), description: description.join('|').trim() };
  }).filter((item) => item.title || item.description);
  if (field.type === 'articleSections') {
    return value.split(/^##\s+/m).map((block) => block.trim()).filter(Boolean).map((block) => {
      const [heading, ...content] = block.split('\n');
      return { heading: heading.trim(), paragraphs: content.join('\n').split(/\n\s*\n/).map((item) => item.trim()).filter(Boolean) };
    });
  }
  return value;
}

function bufferedFieldValues(module: CmsModuleDefinition, data: Record<string, unknown>) {
  return Object.fromEntries(
    module.fields
      .filter((field) => field.type === 'list')
      .map((field) => [field.key, fieldText(field, getPath(data, field.key))]),
  );
}

function mergeBufferedFields(module: CmsModuleDefinition, data: Record<string, unknown>, values: Record<string, string>) {
  return module.fields.reduce((next, field) => {
    if (field.type !== 'list') return next;
    return setPath(next, field.key, parseField(field, values[field.key] ?? ''));
  }, data);
}

function articleSectionDraftValues(module: CmsModuleDefinition, data: Record<string, unknown>) {
  return Object.fromEntries(module.fields.filter((field) => field.type === 'articleSections').map((field) => {
    const sections = getPath(data, field.key);
    const drafts = Array.isArray(sections) ? sections.map((item) => {
      const section = item as { heading?: string; paragraphs?: string[] };
      return { heading: section.heading ?? '', body: (section.paragraphs ?? []).join('\n\n') };
    }) : [];
    return [field.key, drafts];
  })) as Record<string, ArticleSectionDraft[]>;
}

function mergeArticleSectionDrafts(module: CmsModuleDefinition, data: Record<string, unknown>, drafts: Record<string, ArticleSectionDraft[]>) {
  return module.fields.reduce((next, field) => {
    if (field.type !== 'articleSections') return next;
    const sections = (drafts[field.key] ?? []).map((section) => ({
      heading: section.heading.trim(),
      paragraphs: section.body.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean),
    })).filter((section) => section.heading || section.paragraphs.length);
    return setPath(next, field.key, sections);
  }, data);
}

function slugify(value: string) {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-{2,}/g, '-').replace(/^-|-$/g, '');
}

function normalizeEditorData(module: CmsModuleDefinition, source: Record<string, unknown>) {
  return module.fields.reduce((next, field) => {
    const value = getPath(next, field.key);
    if (field.type === 'steps' && typeof value === 'string') return setPath(next, field.key, parseField(field, value));
    if (field.type === 'gallery' && Array.isArray(value)) return setPath(next, field.key, value.map((item) => {
      const entry = item && typeof item === 'object' ? item as Record<string, unknown> : {};
      return {
        src: typeof entry.src === 'string' ? entry.src : typeof entry.image === 'string' ? entry.image : '',
        caption: typeof entry.caption === 'string' ? entry.caption : '',
        description: typeof entry.description === 'string' ? entry.description : '',
      };
    }));
    return next;
  }, structuredClone(source));
}

function mapServerValidationIssues(module: CmsModuleDefinition, details: string[] = [], fallback = ''): ValidationIssue[] {
  const issues = details.flatMap((detail) => {
    const separator = detail.indexOf(':');
    if (separator < 1) return [];
    const path = detail.slice(0, separator).trim();
    const field = module.fields.find((candidate) => path === candidate.key || path.startsWith(`${candidate.key}.`));
    return field ? [{ field: field.key, level: 'error' as const, label: `${field.label} belum valid`, detail: detail.slice(separator + 1).trim() }] : [];
  });
  if (!issues.length && /alamat halaman sudah digunakan/i.test(fallback) && module.fields.some((field) => field.key === 'slug')) {
    issues.push({ field: 'slug', level: 'error', label: 'Alamat halaman sudah digunakan', detail: 'Gunakan alamat halaman yang berbeda.' });
  }
  return issues;
}

function recordTitle(record: CmsRecord, module: CmsModuleDefinition) {
  const data = record.data;
  const candidate = data.title ?? data.name ?? data.role ?? data.label ?? data.value;
  return typeof candidate === 'string' || typeof candidate === 'number' ? String(candidate) : module.singular;
}

function recordSummary(record: CmsRecord, fallback: string) {
  const candidate = record.data.description ?? record.data.summary ?? record.data.excerpt ?? record.data.introduction;
  return typeof candidate === 'string' || typeof candidate === 'number' ? String(candidate) : fallback;
}

function recordImage(record: CmsRecord) {
  const candidate = record.data.image ?? record.data.artwork;
  return typeof candidate === 'string' && candidate ? candidate : null;
}

function stringValue(data: Record<string, unknown>, path: string) {
  const value = getPath(data, path);
  return typeof value === 'string' || typeof value === 'number' ? String(value).trim() : '';
}

function simpleValue(value: unknown) {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value).trim();
  return '';
}

function listLength(data: Record<string, unknown>, path: string) {
  const value = getPath(data, path);
  return Array.isArray(value) ? value.length : 0;
}

function isValidLink(value: string) {
  if (!value) return true;
  return value.startsWith('/') || value.startsWith('mailto:') || value.startsWith('tel:') || /^https?:\/\//i.test(value);
}

function validateRecord(module: CmsModuleDefinition, data: Record<string, unknown>, nextStatus: CmsStatus): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  module.fields.forEach((field) => {
    const value = getPath(data, field.key);
    const fieldValue = simpleValue(value);
    const empty = Array.isArray(value) ? value.length === 0 : !fieldValue;
    if (field.required && empty) {
      issues.push({ field: field.key, level: 'error', label: `${field.label} wajib diisi`, detail: `Isi ${field.label.toLowerCase()} sebelum menyimpan.` });
    }
    if ((field.type === 'url' || field.type === 'asset') && !isValidLink(fieldValue)) {
      issues.push({ field: field.key, level: 'error', label: `${field.label} belum valid`, detail: 'Masukkan alamat website yang valid, misalnya https://contoh.com.' });
    }
    if (field.type === 'date' && fieldValue && !/^\d{4}-\d{2}-\d{2}$/.test(fieldValue)) {
      issues.push({ field: field.key, level: 'error', label: `${field.label} belum valid`, detail: 'Pilih tanggal yang sesuai.' });
    }
    if (field.type === 'gallery' && Array.isArray(value) && value.some((item) => {
      const src = item && typeof item === 'object' && typeof (item as Record<string, unknown>).src === 'string'
        ? String((item as Record<string, unknown>).src).trim()
        : '';
      return !src || !isValidLink(src);
    })) {
      issues.push({ field: field.key, level: 'error', label: `${field.label} belum lengkap`, detail: 'Setiap item galeri harus memiliki gambar atau tautan gambar yang valid.' });
    }
  });

  const slug = stringValue(data, 'slug');
  if ((module.collection === 'projects' || module.collection === 'articles') && slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    issues.push({ field: 'slug', level: 'error', label: 'Alamat halaman belum valid', detail: 'Gunakan huruf kecil, angka, dan tanda penghubung. Contoh: portfolio-byd.' });
  }

  const year = stringValue(data, 'year');
  if ((module.collection === 'projects' || module.collection === 'certifications') && year && !/^\d{4}$/.test(year)) {
    issues.push({ field: 'year', level: 'error', label: 'Tahun belum valid', detail: 'Masukkan tahun menggunakan empat angka, misalnya 2026.' });
  }

  if (module.collection === 'projects') {
    if (!stringValue(data, 'image')) issues.push({ field: 'image', level: nextStatus === 'published' ? 'error' : 'warning', label: 'Gambar utama belum ada', detail: 'Tambahkan visual utama sebelum proyek dipublikasikan.' });
    const evidenceHref = stringValue(data, 'evidence.href');
    if (!evidenceHref) issues.push({ field: 'evidence.href', level: 'warning', label: 'Tautan bukti belum ada', detail: 'Tambahkan satu tautan website atau dokumen agar proyek lebih kredibel.' });
    if (evidenceHref && /\.(?:avif|gif|jpe?g|png|svg|webp)(?:[?#].*)?$/i.test(evidenceHref)) {
      issues.push({ field: 'evidence.href', level: 'error', label: 'Link publik mengarah ke gambar', detail: 'Gunakan alamat website, dashboard, atau dokumen publik. Gambar proyek dikelola melalui Gambar utama dan Galeri.' });
    }
    if (nextStatus === 'published') {
      ([['role', 'Peran'], ['discipline', 'Bidang'], ['artifactType', 'Jenis hasil'], ['challenge', 'Konteks'], ['objective', 'Tujuan proyek'], ['approach', 'Pendekatan'], ['outcome', 'Hasil akhir']] as const).forEach(([key, label]) => {
        if (!stringValue(data, key)) issues.push({ field: key, level: 'error', label: `${label} belum diisi`, detail: 'Bagian ini tampil pada halaman studi kasus dan wajib dilengkapi sebelum publikasi.' });
      });
      if (!listLength(data, 'scope')) issues.push({ field: 'scope', level: 'error', label: 'Kontribusi utama masih kosong', detail: 'Tambahkan minimal satu kontribusi sebelum publikasi.' });
      if (!listLength(data, 'process')) issues.push({ field: 'process', level: 'error', label: 'Proses singkat masih kosong', detail: 'Tambahkan minimal satu tahapan sebelum publikasi.' });
    }
  }

  if (module.collection === 'certifications' && !stringValue(data, 'image')) {
    issues.push({ field: 'image', level: nextStatus === 'published' ? 'error' : 'warning', label: 'Bukti sertifikat belum diunggah', detail: 'Unggah bukti visual sebelum sertifikasi dipublikasikan.' });
  }

  if (module.collection === 'certifications' && nextStatus === 'published' && !listLength(data, 'topics')) {
    issues.push({ field: 'topics', level: 'error', label: 'Materi sertifikasi masih kosong', detail: 'Tambahkan minimal satu materi yang dipelajari atau diujikan.' });
  }

  if (module.collection === 'experience' && nextStatus === 'published') {
    if (!stringValue(data, 'image')) issues.push({ field: 'image', level: 'error', label: 'Gambar pengalaman belum ada', detail: 'Tambahkan visual sebelum pengalaman dipublikasikan.' });
    if (!listLength(data, 'responsibilities')) issues.push({ field: 'responsibilities', level: 'error', label: 'Tanggung jawab masih kosong', detail: 'Tambahkan minimal satu tugas atau tanggung jawab.' });
  }

  if (module.collection === 'articles') {
    if (!listLength(data, 'sections')) issues.push({ field: 'sections', level: nextStatus === 'published' ? 'error' : 'warning', label: 'Isi artikel masih kosong', detail: 'Tambahkan minimal satu bagian agar artikel siap dibaca.' });
    if (nextStatus === 'published' && !stringValue(data, 'lead')) issues.push({ field: 'lead', level: 'error', label: 'Paragraf pembuka masih kosong', detail: 'Tambahkan pembuka sebelum artikel dipublikasikan.' });
    if (nextStatus === 'published' && !stringValue(data, 'closing')) issues.push({ field: 'closing', level: 'error', label: 'Penutup artikel masih kosong', detail: 'Tambahkan kesimpulan sebelum artikel dipublikasikan.' });
    if (!stringValue(data, 'seoDescription')) issues.push({ field: 'seoDescription', level: 'warning', label: 'Deskripsi pencarian belum diisi', detail: 'Jika kosong, ringkasan artikel akan digunakan.' });
  }

  if (module.collection === 'profile' && !stringValue(data, 'artwork')) {
    issues.push({ field: 'artwork', level: 'error', label: 'Gambar profil belum ada', detail: 'Visual profil utama wajib tersedia.' });
  }

  if (module.collection === 'projects' && !stringValue(data, 'seoDescription')) {
    issues.push({ field: 'seoDescription', level: 'warning', label: 'Deskripsi pencarian belum diisi', detail: 'Jika kosong, ringkasan proyek akan digunakan.' });
  }

  return issues;
}

function previewTitle(module: CmsModuleDefinition, data: Record<string, unknown>) {
  return stringValue(data, 'title') || stringValue(data, 'name') || stringValue(data, 'role') || stringValue(data, 'label') || module.singular;
}

function previewSummary(module: CmsModuleDefinition, data: Record<string, unknown>) {
  return stringValue(data, 'summary') || stringValue(data, 'excerpt') || stringValue(data, 'description') || stringValue(data, 'introduction') || module.description;
}

function previewImage(data: Record<string, unknown>) {
  return stringValue(data, 'seoImage') || stringValue(data, 'image') || stringValue(data, 'artwork');
}

function formatUpdatedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { date: 'Belum tersimpan', time: '' };
  return {
    date: date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
    time: date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
  };
}

function newRecord(module: CmsModuleDefinition): CmsRecord {
  const data = module.fields.reduce<Record<string, unknown>>((result, field) => {
    return setPath(result, field.key, ['list', 'steps', 'articleSections', 'gallery'].includes(field.type) ? [] : '');
  }, {});
  return {
    id: 'new', collection: module.collection, slug: null, sortOrder: 999,
    status: 'draft', data, createdAt: '', updatedAt: '',
  };
}

function withEditorDefaults(module: CmsModuleDefinition, record: CmsRecord): CmsRecord {
  if (module.collection !== 'siteContent') return record;
  const branding = record.data.branding && typeof record.data.branding === 'object' && !Array.isArray(record.data.branding)
    ? record.data.branding as Record<string, unknown>
    : {};
  return {
    ...record,
    data: {
      ...siteContentDefaults,
      ...record.data,
      branding: { ...siteContentDefaults.branding, ...branding },
    },
  };
}

function BrandingPreview({ data, profile }: { data: Record<string, unknown>; profile: Record<string, unknown> }) {
  const contexts = [
    { context: 'public' as const, label: 'Website publik' },
    { context: 'cms' as const, label: 'Sidebar CMS' },
    { context: 'login' as const, label: 'Halaman login' },
  ];
  const favicon = stringValue(data, 'branding.favicon');

  return (
    <section className="cms-branding-preview" aria-label="Preview branding">
      <header><Eye size={17} /><div><strong>Preview setiap konteks</strong><p>Logo override yang kosong otomatis memakai logo utama, lalu fallback teks ANH.</p></div></header>
      <div className="cms-branding-preview-grid">
        {contexts.map(({ context, label }) => (
          <article className={`is-${context}`} key={context}>
            <small>{label}</small>
            <BrandIdentity context={context} siteContent={data} profile={profile} />
          </article>
        ))}
        <article className="is-favicon">
          <small>Favicon</small>
          <Image src={favicon || '/favicon.svg'} width={40} height={40} unoptimized alt="Pratinjau favicon ANH" />
        </article>
      </div>
    </section>
  );
}

function CmsAdaptiveImage({ src, alt }: { src: string; alt: string }) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const ratio = dimensions.width && dimensions.height ? dimensions.width / dimensions.height : 16 / 9;
  const shape = ratio < .86 ? 'portrait' : ratio > 1.15 ? 'landscape' : 'square';

  return (
    <div className={`cms-adaptive-image is-${shape}`}>
      <div style={{ aspectRatio: ratio }}>
        <Image
          src={src}
          fill
          unoptimized
          sizes="(max-width: 560px) 100vw, 240px"
          alt={alt}
          onLoad={(event) => setDimensions({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })}
        />
      </div>
      {dimensions.width && dimensions.height ? <span>{shape === 'portrait' ? 'Portrait' : shape === 'landscape' ? 'Landscape' : 'Persegi'} · {dimensions.width}×{dimensions.height}</span> : null}
    </div>
  );
}

function ContentEditor({
  module, record, profileData, onClose, onSaved,
}: {
  module: CmsModuleDefinition;
  record: CmsRecord;
  profileData: Record<string, unknown>;
  onClose: () => void;
  onSaved: (record: CmsRecord) => void;
}) {
  const initialEditorData = useMemo(() => normalizeEditorData(module, record.data), [module, record.data]);
  const initialArticleDrafts = useMemo(() => articleSectionDraftValues(module, record.data), [module, record.data]);
  const [data, setData] = useState<Record<string, unknown>>(initialEditorData);
  const [bufferedValues, setBufferedValues] = useState<Record<string, string>>(() => bufferedFieldValues(module, record.data));
  const [articleDrafts, setArticleDrafts] = useState<Record<string, ArticleSectionDraft[]>>(initialArticleDrafts);
  const [status, setStatus] = useState<CmsStatus>(record.status);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [serverFieldIssues, setServerFieldIssues] = useState<ValidationIssue[]>([]);
  const [uploading, setUploading] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const uploadRequest = useRef<AbortController | null>(null);
  const [baseline, setBaseline] = useState({ data: initialEditorData, status: record.status });
  const [baselineBufferedValues, setBaselineBufferedValues] = useState<Record<string, string>>(() => bufferedFieldValues(module, record.data));
  const [baselineArticleDrafts, setBaselineArticleDrafts] = useState<Record<string, ArticleSectionDraft[]>>(initialArticleDrafts);
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});
  const temporaryUploads = useRef<Record<string, MediaItem>>({});
  const sections = useMemo(() => sectionsForModule(module), [module]);
  const dirty = useMemo(
    () => data !== baseline.data
      || Object.keys(bufferedValues).some((key) => bufferedValues[key] !== baselineBufferedValues[key])
      || articleDrafts !== baselineArticleDrafts
      || status !== baseline.status,
    [articleDrafts, baseline, baselineArticleDrafts, baselineBufferedValues, bufferedValues, data, status],
  );
  const [previewOpen, setPreviewOpen] = useState(false);
  const [autosaveState, setAutosaveState] = useState('');
  const [history, setHistory] = useState<RevisionSnapshot[]>([]);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(() => new Set());
  const [submitAttempt, setSubmitAttempt] = useState(0);
  const [attentionField, setAttentionField] = useState('');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(record.id !== 'new');
  const autosaveKey = useMemo(() => `anh-cms-draft:${module.collection}:${record.id}`, [module.collection, record.id]);
  const historyKey = useMemo(() => `anh-cms-history:${module.collection}:${record.id}`, [module.collection, record.id]);
  const validationIssues = useMemo(() => validateRecord(module, data, module.singleton ? 'published' : status), [data, module, status]);
  const displayedValidationIssues = useMemo(() => [
    ...validationIssues.filter((issue) => issue.level === 'warning' || submitAttempt > 0 || Boolean(issue.field && touchedFields.has(issue.field))),
    ...serverFieldIssues,
  ], [serverFieldIssues, submitAttempt, touchedFields, validationIssues]);
  const preview = useMemo(() => ({
    title: previewTitle(module, data),
    summary: previewSummary(module, data),
    image: previewImage(data),
    meta: [stringValue(data, 'category'), stringValue(data, 'year') || stringValue(data, 'period'), stringValue(data, 'issuer')].filter(Boolean).join(' / '),
  }), [data, module]);

  useEffect(() => {
    function protectDraft(event: BeforeUnloadEvent) {
      if (!dirty) return;
      event.preventDefault();
    }
    window.addEventListener('beforeunload', protectDraft);
    return () => window.removeEventListener('beforeunload', protectDraft);
  }, [dirty]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(autosaveKey);
        if (!saved) return;
        const draft = JSON.parse(saved) as { data?: Record<string, unknown>; status?: CmsStatus; updatedAt?: number };
        if (!draft.data || JSON.stringify(draft.data) === JSON.stringify(record.data)) return;
        const time = draft.updatedAt ? new Date(draft.updatedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '';
        if (window.confirm(`Ada draft otomatis yang belum disimpan${time ? ` dari ${time}` : ''}. Pulihkan draft ini?`)) {
          setData(normalizeEditorData(module, draft.data));
          setBufferedValues(bufferedFieldValues(module, draft.data));
          setArticleDrafts(articleSectionDraftValues(module, draft.data));
          if (draft.status) setStatus(draft.status);
          setMessage('Draft otomatis dipulihkan. Cek kembali lalu simpan.');
        }
      } catch {
        window.localStorage.removeItem(autosaveKey);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [autosaveKey, module, record.data]);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(historyKey);
        setHistory(saved ? JSON.parse(saved) as RevisionSnapshot[] : []);
      } catch {
        setHistory([]);
      }
      if (record.id !== 'new') {
        void fetch(`/api/cms/content/${module.collection}/${record.id}/revisions`)
          .then((response) => response.ok ? response.json() : Promise.reject(new Error('Riwayat tidak tersedia.')))
          .then((result) => {
            const payload = result as { revisions?: Array<{ status: CmsStatus; data: Record<string, unknown>; createdAt: string }> };
            if (!active || !payload.revisions?.length) return;
            setHistory(payload.revisions.map((revision) => ({
              savedAt: revision.createdAt,
              status: revision.status,
              title: previewTitle(module, revision.data),
              data: revision.data,
            })));
          })
          .catch(() => undefined);
      }
    }, 0);
    return () => { active = false; window.clearTimeout(timer); };
  }, [historyKey, module, record.id]);

  useEffect(() => {
    if (!dirty) return;
    const timer = window.setTimeout(() => {
      const bufferedData = mergeBufferedFields(module, data, bufferedValues);
      const draft = { data: mergeArticleSectionDrafts(module, bufferedData, articleDrafts), status, updatedAt: Date.now() };
      window.localStorage.setItem(autosaveKey, JSON.stringify(draft));
      setAutosaveState(`Autosave ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`);
    }, 800);
    return () => window.clearTimeout(timer);
  }, [articleDrafts, autosaveKey, bufferedValues, data, dirty, module, status]);

  function closeEditor() {
    if (dirty && !window.confirm('Tutup editor dan abaikan perubahan yang belum disimpan?')) return;
    const abandoned = Object.values(temporaryUploads.current);
    temporaryUploads.current = {};
    uploadRequest.current?.abort();
    void Promise.all(abandoned.map((item) => discardTemporaryMedia(item)));
    onClose();
  }

  function saveRevision(savedRecord: CmsRecord) {
    const snapshot: RevisionSnapshot = {
      savedAt: new Date().toISOString(),
      status: savedRecord.status,
      title: recordTitle(savedRecord, module),
      data: structuredClone(savedRecord.data),
    };
    const next = [snapshot, ...history].slice(0, 5);
    setHistory(next);
    window.localStorage.setItem(`anh-cms-history:${module.collection}:${savedRecord.id}`, JSON.stringify(next));
  }

  function restoreRevision(snapshot: RevisionSnapshot) {
    if (!window.confirm('Pulihkan versi ini ke editor? Konten belum berubah di website sampai Anda menekan Simpan.')) return;
    setData(normalizeEditorData(module, snapshot.data));
    setBufferedValues(bufferedFieldValues(module, snapshot.data));
    setArticleDrafts(articleSectionDraftValues(module, snapshot.data));
    setStatus(snapshot.status);
    setMessage('Versi sebelumnya dimuat ke editor. Simpan untuk menerapkan.');
  }

  async function upload(field: CmsField, file?: File) {
    if (!file) return;
    setUploading(field.key);
    setUploadProgress(0);
    setMessage(file.type.startsWith('image/') ? 'Mengoptimalkan gambar sebelum diunggah...' : 'Memeriksa dokumen sebelum diunggah...');
    try {
      const prepared = await prepareMediaFile(file, field.key === 'customIcon' || field.key.startsWith('branding.') ? 'icon' : 'content');
      setMessage('Mengunggah media teroptimasi...');
      const controller = new AbortController();
      uploadRequest.current = controller;
      const uploaded = await uploadPreparedMedia(prepared, { signal: controller.signal, onProgress: setUploadProgress });
      const previousTemporary = temporaryUploads.current[field.key];
      temporaryUploads.current[field.key] = uploaded;
      setData((current) => setPath(current, field.key, uploaded.url));
      if (previousTemporary) void discardTemporaryMedia(previousTemporary);
      setMessage(prepared.message);
    } catch (error) {
      setMessage(error instanceof DOMException && error.name === 'AbortError' ? 'Unggahan dibatalkan.' : error instanceof Error ? error.message : 'Media tidak dapat diunggah.');
    } finally {
      uploadRequest.current = null;
      setUploading('');
      setUploadProgress(0);
    }
  }

  async function uploadGalleryImage(field: CmsField, index: number, file?: File) {
    if (!file) return;
    const uploadKey = `${field.key}-${index}`;
    setUploading(uploadKey);
    setUploadProgress(0);
    setMessage('Mengoptimalkan gambar galeri sebelum diunggah...');
    try {
      const prepared = await prepareMediaFile(file, 'content');
      const controller = new AbortController();
      uploadRequest.current = controller;
      const uploaded = await uploadPreparedMedia(prepared, { signal: controller.signal, onProgress: setUploadProgress });
      const existingItems = Array.isArray(getPath(data, field.key)) ? getPath(data, field.key) as GalleryDraft[] : [];
      const previousTemporary = Object.entries(temporaryUploads.current).find(([, item]) => item.url === existingItems[index]?.src);
      if (previousTemporary) {
        delete temporaryUploads.current[previousTemporary[0]];
        void discardTemporaryMedia(previousTemporary[1]);
      }
      temporaryUploads.current[`gallery:${uploaded.id}`] = uploaded;
      setData((current) => {
        const items = Array.isArray(getPath(current, field.key)) ? [...getPath(current, field.key) as GalleryDraft[]] : [];
        items[index] = { ...items[index], src: uploaded.url, caption: items[index]?.caption ?? '', description: items[index]?.description ?? '' };
        return setPath(current, field.key, items);
      });
      clearServerFieldIssue(field.key);
      setMessage(prepared.message);
    } catch (error) {
      setMessage(error instanceof DOMException && error.name === 'AbortError' ? 'Unggahan dibatalkan.' : error instanceof Error ? error.message : 'Gambar galeri tidak dapat diunggah.');
    } finally {
      uploadRequest.current = null;
      setUploading('');
      setUploadProgress(0);
    }
  }

  function removeGalleryItem(field: CmsField, index: number, src: string) {
    const temporary = Object.entries(temporaryUploads.current).find(([, item]) => item.url === src);
    if (temporary) {
      delete temporaryUploads.current[temporary[0]];
      void discardTemporaryMedia(temporary[1]);
    }
    setData((current) => {
      const items = Array.isArray(getPath(current, field.key)) ? getPath(current, field.key) as GalleryDraft[] : [];
      return setPath(current, field.key, items.filter((_, itemIndex) => itemIndex !== index));
    });
  }

  function updateGallerySource(field: CmsField, index: number, currentSrc: string, nextSrc: string) {
    const temporary = Object.entries(temporaryUploads.current).find(([, item]) => item.url === currentSrc);
    if (temporary && currentSrc !== nextSrc) {
      delete temporaryUploads.current[temporary[0]];
      void discardTemporaryMedia(temporary[1]);
    }
    clearServerFieldIssue(field.key);
    setData((current) => {
      const items = Array.isArray(getPath(current, field.key)) ? [...getPath(current, field.key) as GalleryDraft[]] : [];
      items[index] = { ...items[index], src: nextSrc };
      return setPath(current, field.key, items);
    });
  }

  function updateMediaValue(field: CmsField, value: string) {
    const temporary = temporaryUploads.current[field.key];
    if (temporary && temporary.url !== value) {
      delete temporaryUploads.current[field.key];
      void discardTemporaryMedia(temporary);
    }
    setData((current) => setPath(current, field.key, value));
    setServerFieldIssues((current) => current.filter((issue) => issue.field !== field.key));
  }

  function clearServerFieldIssue(fieldKey: string) {
    setServerFieldIssues((current) => current.filter((issue) => issue.field !== fieldKey));
  }

  function markTouched(fieldKey: string) {
    setTouchedFields((current) => current.has(fieldKey) ? current : new Set(current).add(fieldKey));
  }

  function focusField(fieldKey: string) {
    const element = document.getElementById(`field-${fieldKey.replace('.', '-')}`);
    const collapsedSection = element?.closest('details');
    if (collapsedSection instanceof HTMLDetailsElement) collapsedSection.open = true;
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    window.setTimeout(() => (element as HTMLElement | null)?.focus(), 180);
  }

  function updateTextField(field: CmsField, value: string) {
    clearServerFieldIssue(field.key);
    if (field.key === 'slug') {
      setSlugManuallyEdited(true);
      setData((current) => setPath(current, field.key, value));
      return;
    }
    setData((current) => {
      const next = setPath(current, field.key, value);
      if (record.id === 'new' && field.key === 'title' && !slugManuallyEdited && (module.collection === 'projects' || module.collection === 'articles')) {
        return setPath(next, 'slug', slugify(value));
      }
      return next;
    });
  }

  async function save(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerFieldIssues([]);
    const bufferedData = mergeBufferedFields(module, data, bufferedValues);
    const normalizedData = mergeArticleSectionDrafts(module, bufferedData, articleDrafts);
    const currentIssues = validateRecord(module, normalizedData, module.singleton ? 'published' : status);
    const blockingIssues = currentIssues.filter((issue) => issue.level === 'error');
    if (blockingIssues.length) {
      setSubmitAttempt((current) => current + 1);
      setServerFieldIssues(blockingIssues.filter((issue) => !validationIssues.some((current) => current.field === issue.field && current.label === issue.label)));
      setMessage(`Ada ${blockingIssues.length} bagian yang perlu diperbaiki.`);
      const first = blockingIssues.find((issue) => issue.field);
      if (first?.field) {
        setAttentionField('');
        window.requestAnimationFrame(() => {
          setAttentionField(first.field!);
          focusField(first.field!);
          window.setTimeout(() => setAttentionField(''), 650);
        });
      }
      return;
    }
    setBusy(true);
    setMessage('');
    const endpoint = record.id === 'new'
      ? `/api/cms/content/${module.collection}`
      : `/api/cms/content/${module.collection}/${record.id}`;
    const response = await fetch(endpoint, {
      method: record.id === 'new' ? 'POST' : 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        data: normalizedData,
        status: module.singleton ? 'published' : status,
        version: record.version,
      }),
    });
    const result = await response.json().catch(() => ({})) as { error?: string; details?: string[]; record?: CmsRecord };
    if (!response.ok || !result.record) {
      const mappedIssues = mapServerValidationIssues(module, result.details, result.error);
      setServerFieldIssues(mappedIssues);
      setMessage(mappedIssues.length ? `Periksa ${mappedIssues.length} field sebelum menyimpan.` : result.details?.join(' ') || result.error || 'Perubahan tidak dapat disimpan.');
      if (mappedIssues[0]?.field) {
        window.requestAnimationFrame(() => {
          setAttentionField(mappedIssues[0].field!);
          focusField(mappedIssues[0].field!);
          window.setTimeout(() => setAttentionField(''), 650);
        });
      }
    } else {
      setMessage('Perubahan tersimpan.');
      saveRevision(result.record);
      window.localStorage.removeItem(autosaveKey);
      temporaryUploads.current = {};
      setAutosaveState('');
      const savedData = normalizeEditorData(module, result.record.data);
      setBaseline({ data: savedData, status: result.record.status });
      const savedBufferedValues = bufferedFieldValues(module, result.record.data);
      const savedArticleDrafts = articleSectionDraftValues(module, result.record.data);
      setData(savedData);
      setBufferedValues(savedBufferedValues);
      setBaselineBufferedValues(savedBufferedValues);
      setArticleDrafts(savedArticleDrafts);
      setBaselineArticleDrafts(savedArticleDrafts);
      setSubmitAttempt(0);
      setTouchedFields(new Set());
      setServerFieldIssues([]);
      onSaved(result.record);
    }
    setBusy(false);
  }

  function renderField(field: CmsField) {
    const isBuffered = field.type === 'list';
    const value = field.type === 'steps' || field.type === 'articleSections'
      ? ''
      : isBuffered ? bufferedValues[field.key] ?? '' : fieldText(field, getPath(data, field.key));
    const inputId = `field-${field.key.replace('.', '-')}`;
    const fieldIssue = displayedValidationIssues.find((issue) => issue.level === 'error' && issue.field === field.key);
    const describedBy = fieldIssue ? `${inputId}-error` : undefined;
    const fieldControlProps = { 'aria-invalid': Boolean(fieldIssue), 'aria-describedby': describedBy };
    return (
      <div className={`cms-field${field.wide ? ' is-wide' : ''}${fieldIssue ? ' has-error' : ''}${attentionField === field.key ? ' is-attention' : ''}`} key={field.key}>
        <Label htmlFor={inputId}>{field.label}{field.required ? <span>*</span> : null}</Label>
        {field.type === 'gallery' ? (
          <div className="cms-gallery-repeater" id={inputId} tabIndex={-1} onBlur={() => markTouched(field.key)} {...fieldControlProps}>
            {(Array.isArray(getPath(data, field.key)) ? getPath(data, field.key) as GalleryDraft[] : []).map((item, index) => {
              const uploadKey = `${field.key}-${index}`;
              const galleryItemLabel = field.key === 'pages' ? `Halaman tambahan ${index + 1}` : `Gambar ${index + 1}`;
              return <article className="cms-gallery-row" key={`${field.key}-${index}`}>
                {item.src ? <CmsAdaptiveImage src={item.src} alt={`Pratinjau ${galleryItemLabel.toLowerCase()}`} /> : <div className="cms-media-empty"><ImageIcon size={24} /><span>Belum ada gambar</span></div>}
                <div>
                  <strong>{galleryItemLabel}</strong>
                  <Input aria-label={`URL ${galleryItemLabel.toLowerCase()}`} placeholder="Unggah gambar atau masukkan link" value={item.src ?? ''} onChange={(event) => updateGallerySource(field, index, item.src, event.target.value)} />
                  <Input aria-label={`Judul ${galleryItemLabel.toLowerCase()}`} placeholder={field.key === 'pages' ? 'Contoh: Halaman belakang' : 'Judul gambar'} value={item.caption ?? ''} onChange={(event) => setData((current) => {
                    const items = Array.isArray(getPath(current, field.key)) ? [...getPath(current, field.key) as GalleryDraft[]] : [];
                    items[index] = { ...items[index], caption: event.target.value };
                    return setPath(current, field.key, items);
                  })} />
                  <Textarea aria-label={`Keterangan ${galleryItemLabel.toLowerCase()}`} placeholder="Keterangan singkat (opsional)" rows={2} value={item.description ?? ''} onChange={(event) => setData((current) => {
                    const items = Array.isArray(getPath(current, field.key)) ? [...getPath(current, field.key) as GalleryDraft[]] : [];
                    items[index] = { ...items[index], description: event.target.value };
                    return setPath(current, field.key, items);
                  })} />
                  <input ref={(element) => { fileInputs.current[uploadKey] = element; }} type="file" accept={IMAGE_ACCEPT} hidden onChange={(event) => { void uploadGalleryImage(field, index, event.target.files?.[0]); event.currentTarget.value = ''; }} />
                  <div className="cms-media-field-actions">
                    <Button type="button" variant="outline" onClick={() => fileInputs.current[uploadKey]?.click()} disabled={uploading === uploadKey}><Upload size={15} />{uploading === uploadKey ? uploadProgress ? `Mengunggah ${uploadProgress}%` : 'Memproses...' : item.src ? 'Ganti gambar' : 'Unggah gambar'}</Button>
                    {uploading === uploadKey ? <button className="cms-cancel-upload" type="button" onClick={() => uploadRequest.current?.abort()}>Batalkan</button> : null}
                    {field.key === 'pages' ? <span className="cms-gallery-order" aria-label={`Urutan ${galleryItemLabel.toLowerCase()}`}>
                      <button type="button" disabled={index === 0} aria-label={`Pindahkan ${galleryItemLabel.toLowerCase()} ke atas`} title="Pindahkan ke atas" onClick={() => setData((current) => {
                        const items = [...(getPath(current, field.key) as GalleryDraft[] ?? [])];
                        [items[index - 1], items[index]] = [items[index], items[index - 1]];
                        return setPath(current, field.key, items);
                      })}><ArrowUp size={14} /></button>
                      <button type="button" disabled={index === (getPath(data, field.key) as GalleryDraft[]).length - 1} aria-label={`Pindahkan ${galleryItemLabel.toLowerCase()} ke bawah`} title="Pindahkan ke bawah" onClick={() => setData((current) => {
                        const items = [...(getPath(current, field.key) as GalleryDraft[] ?? [])];
                        [items[index], items[index + 1]] = [items[index + 1], items[index]];
                        return setPath(current, field.key, items);
                      })}><ArrowDown size={14} /></button>
                    </span> : null}
                    <button className="cms-remove-media" type="button" onClick={() => removeGalleryItem(field, index, item.src)}><Trash2 size={14} />Hapus</button>
                  </div>
                </div>
              </article>;
            })}
            <Button type="button" variant="outline" onClick={() => setData((current) => setPath(current, field.key, [...(Array.isArray(getPath(current, field.key)) ? getPath(current, field.key) as GalleryDraft[] : []), { src: '', caption: '', description: '' }]))}><Plus size={15} />{field.key === 'pages' ? 'Tambah halaman' : 'Tambah gambar'}</Button>
          </div>
        ) : field.type === 'steps' ? (
          <div className="cms-steps-repeater" id={inputId} tabIndex={-1} onBlur={() => markTouched(field.key)} {...fieldControlProps}>
            {(Array.isArray(getPath(data, field.key)) ? getPath(data, field.key) as Array<{ title?: string; description?: string }> : []).map((step, index, steps) => (
              <article className="cms-step-row" key={`${field.key}-${index}`}>
                <strong>Langkah {index + 1}</strong>
                <Input aria-label={`Judul langkah ${index + 1}`} placeholder="Judul langkah" value={step.title ?? ''} onChange={(event) => { clearServerFieldIssue(field.key); setData((current) => { const next = [...(getPath(current, field.key) as Array<Record<string, unknown>> ?? [])]; next[index] = { ...next[index], title: event.target.value }; return setPath(current, field.key, next); }); }} />
                <Textarea aria-label={`Penjelasan langkah ${index + 1}`} placeholder="Penjelasan singkat" rows={3} value={step.description ?? ''} onChange={(event) => { clearServerFieldIssue(field.key); setData((current) => { const next = [...(getPath(current, field.key) as Array<Record<string, unknown>> ?? [])]; next[index] = { ...next[index], description: event.target.value }; return setPath(current, field.key, next); }); }} />
                <button type="button" className="cms-remove-media" onClick={() => setData((current) => setPath(current, field.key, (getPath(current, field.key) as unknown[] ?? []).filter((_, itemIndex) => itemIndex !== index)))}>Hapus langkah</button>
                {index < steps.length - 1 ? <hr /> : null}
              </article>
            ))}
            <Button type="button" variant="outline" onClick={() => setData((current) => setPath(current, field.key, [...(getPath(current, field.key) as unknown[] ?? []), { title: '', description: '' }]))}><Plus size={15} />Tambah langkah</Button>
          </div>
        ) : field.type === 'articleSections' ? (
          <div className="cms-article-sections" id={inputId} tabIndex={-1} onBlur={() => { markTouched(field.key); setData((current) => mergeArticleSectionDrafts(module, current, articleDrafts)); }} {...fieldControlProps}>
            {(articleDrafts[field.key] ?? []).map((section, index, fieldSections) => (
              <article className="cms-article-section-row" key={`${field.key}-${index}`}>
                <strong>Bagian {index + 1}</strong>
                <Input aria-label={`Judul bagian ${index + 1}`} placeholder="Judul bagian" value={section.heading} onChange={(event) => { clearServerFieldIssue(field.key); setArticleDrafts((current) => ({ ...current, [field.key]: (current[field.key] ?? []).map((item, itemIndex) => itemIndex === index ? { ...item, heading: event.target.value } : item) })); }} />
                <Textarea aria-label={`Isi bagian ${index + 1}`} placeholder="Tulis isi bagian di sini. Pisahkan paragraf dengan satu baris kosong." rows={8} value={section.body} onChange={(event) => { clearServerFieldIssue(field.key); setArticleDrafts((current) => ({ ...current, [field.key]: (current[field.key] ?? []).map((item, itemIndex) => itemIndex === index ? { ...item, body: event.target.value } : item) })); }} />
                <button type="button" className="cms-remove-media" onClick={() => setArticleDrafts((current) => ({ ...current, [field.key]: (current[field.key] ?? []).filter((_, itemIndex) => itemIndex !== index) }))}>Hapus bagian</button>
                {index < fieldSections.length - 1 ? <hr /> : null}
              </article>
            ))}
            <Button type="button" variant="outline" onClick={() => setArticleDrafts((current) => ({ ...current, [field.key]: [...(current[field.key] ?? []), { heading: '', body: '' }] }))}><Plus size={15} />Tambah bagian</Button>
          </div>
        ) : field.type === 'textarea' || field.type === 'list' ? (
          <Textarea id={inputId} {...fieldControlProps} value={value} required={field.required} rows={field.type === 'textarea' ? 5 : 7} placeholder={field.placeholder}
            onChange={(event) => {
              clearServerFieldIssue(field.key);
              if (isBuffered) setBufferedValues((current) => ({ ...current, [field.key]: event.target.value }));
              else setData((current) => setPath(current, field.key, event.target.value));
            }}
            onBlur={() => {
              markTouched(field.key);
              if (isBuffered) setData((current) => setPath(current, field.key, parseField(field, bufferedValues[field.key] ?? '')));
            }} />
        ) : field.type === 'select' ? (
          <select id={inputId} {...fieldControlProps} value={value} onBlur={() => markTouched(field.key)} onChange={(event) => { clearServerFieldIssue(field.key); setData((current) => setPath(current, field.key, event.target.value)); }}>
            <option value="">Pilih opsi</option>
            {field.options?.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
          </select>
        ) : field.type === 'image' || field.type === 'asset' ? (
          <div className="cms-media-field">
            {field.type === 'image' && value ? <CmsAdaptiveImage src={value} alt="Pratinjau media" /> : <div className="cms-media-empty">{field.type === 'asset' ? <FileText size={24} /> : <ImageIcon size={24} />}<span>{value ? 'Tautan media siap' : 'Belum ada media'}</span></div>}
            <div>
              <Input id={inputId} {...fieldControlProps} value={value} placeholder={field.type === 'asset' ? 'https://contoh.com atau unggah dokumen' : 'Unggah gambar atau masukkan link'} onBlur={() => markTouched(field.key)} onChange={(event) => updateMediaValue(field, event.target.value)} />
              <input ref={(element) => { fileInputs.current[field.key] = element; }} type="file" accept={field.type === 'asset' ? MEDIA_ACCEPT : IMAGE_ACCEPT} hidden onChange={(event) => { void upload(field, event.target.files?.[0]); event.currentTarget.value = ''; }} />
              <div className="cms-media-field-actions"><Button type="button" variant="outline" onClick={() => fileInputs.current[field.key]?.click()} disabled={uploading === field.key}><Upload size={15} />{uploading === field.key ? uploadProgress ? `Mengunggah ${uploadProgress}%` : 'Memproses...' : field.type === 'asset' ? 'Unggah dokumen' : 'Unggah gambar'}</Button>{uploading === field.key ? <button className="cms-cancel-upload" type="button" onClick={() => uploadRequest.current?.abort()}>Batalkan</button> : null}{value ? <><a href={value} target="_blank" rel="noreferrer"><Eye size={14} />Buka media</a><button className="cms-remove-media" type="button" onClick={() => updateMediaValue(field, '')} aria-label={`Hapus ${field.label}`} title={`Hapus ${field.label}`}><Trash2 size={14} />Hapus</button></> : null}</div>
              <small className="cms-upload-policy">Gambar otomatis menjadi WebP. Dokumen maksimal 24 MB dan diperiksa sebelum disimpan.</small>
            </div>
          </div>
        ) : (
          <Input id={inputId} {...fieldControlProps} type={field.type === 'url' ? 'url' : field.type === 'date' ? 'date' : 'text'} inputMode={field.key === 'year' ? 'numeric' : undefined} value={value} required={field.required} placeholder={field.placeholder} onBlur={() => markTouched(field.key)} onChange={(event) => updateTextField(field, event.target.value)} />
        )}
        {field.key === 'slug' ? <div className="cms-slug-helper"><small>{module.collection === 'projects' ? '/portfolio/' : '/artikel/'}{value || 'alamat-halaman'} · Dibuat otomatis dari judul. Ubah hanya jika diperlukan.</small>{fieldIssue ? <button type="button" onClick={() => { const fixed = slugify(value || stringValue(data, 'title')); clearServerFieldIssue('slug'); setData((current) => setPath(current, 'slug', fixed)); markTouched('slug'); }}>Perbaiki otomatis</button> : null}</div> : field.helper ? <small>{field.helper}</small> : null}
        {fieldIssue ? <small id={`${inputId}-error`} className="cms-field-error" role="alert">{fieldIssue.detail}</small> : null}
      </div>
    );
  }

  return (
    <dialog className="cms-editor-layer" open aria-label={`Editor ${module.singular}`}>
      <form className="cms-editor" onSubmit={save} noValidate>
        <header className="cms-editor-header">
          <div className="cms-editor-heading"><span className="cms-window-markers" aria-hidden="true"><i /><i /><i /></span><div><span>{record.id === 'new' ? 'Konten baru' : module.label}</span><h2>{record.id === 'new' ? `Tambah ${module.singular}` : recordTitle(record, module)}</h2></div></div>
          <div className="cms-editor-actions">
            <span className={`cms-editor-save-status ${dirty ? 'is-dirty' : 'is-saved'}`}><i aria-hidden="true" />{dirty ? 'Belum disimpan' : 'Tersimpan'}</span>
            <button className="cms-editor-action" type="button" onClick={() => setPreviewOpen((value) => !value)} aria-label={previewOpen ? 'Tutup preview' : 'Buka preview'} aria-pressed={previewOpen} title={previewOpen ? 'Tutup preview' : 'Buka preview'}><PanelRightOpen size={16} /><span>Preview</span></button>
            <button className="cms-editor-action cms-editor-action--save" type="submit" disabled={busy || !dirty} aria-label={busy ? 'Sedang menyimpan' : 'Simpan perubahan'} title="Simpan perubahan">{busy ? <i className="cms-inline-spinner" aria-hidden="true" /> : <Save size={16} />}<span>{busy ? 'Menyimpan' : 'Simpan'}</span></button>
            <button className="cms-editor-action cms-editor-action--close" type="button" onClick={closeEditor} aria-label="Tutup editor" title="Tutup editor"><X size={17} /><span>Tutup</span></button>
          </div>
        </header>

        <div className="cms-editor-body">
          <aside className="cms-editor-guide">
            <span className="cms-editor-guide-label">Isi konten</span>
            <p>{module.description}</p>
            <nav aria-label="Bagian formulir">
              {sections.map((section, index) => <a href={`#editor-section-${index}`} key={section.title}><i aria-hidden="true" />{section.title}</a>)}
            </nav>
            <div className="cms-editor-guide-note"><strong>Autosave aktif</strong><p>Draft tersimpan di browser. Website baru berubah setelah tombol Simpan ditekan.</p></div>
          </aside>

          <div className="cms-editor-main">
            <section className="cms-editor-status">
              <div><strong>Status publikasi</strong><p>{module.singleton ? 'Konten utama selalu ditampilkan di website.' : 'Aktifkan untuk menampilkan konten di website.'}</p></div>
              <div><span className={module.singleton || status === 'published' ? 'is-published' : ''}>{module.singleton || status === 'published' ? 'Ditampilkan' : 'Draft'}</span><Switch checked={module.singleton || status === 'published'} disabled={module.singleton} onCheckedChange={(checked) => setStatus(checked ? 'published' : 'draft')} aria-label="Status publikasi" /></div>
            </section>

            <div className="cms-editor-tools">
              <span>{autosaveState || (dirty ? 'Menunggu autosave...' : 'Tidak ada perubahan')}</span>
              <strong>{displayedValidationIssues.filter((issue) => issue.level === 'error').length} error / {displayedValidationIssues.filter((issue) => issue.level === 'warning').length} saran</strong>
            </div>
            <p className="cms-required-note"><span>*</span> Wajib diisi</p>

            {displayedValidationIssues.length ? (
              <section className="cms-validation-panel" aria-label="Validasi konten" aria-live="polite">
                <header><ListChecks size={17} /><div><strong>{displayedValidationIssues.filter((issue) => issue.level === 'error').length ? `Periksa ${displayedValidationIssues.filter((issue) => issue.level === 'error').length} bagian berikut sebelum menyimpan` : 'Saran penyempurnaan konten'}</strong><p>Pilih salah satu item untuk menuju bagian yang perlu diperiksa.</p></div></header>
                <div>{displayedValidationIssues.map((issue) => issue.field ? <button type="button" className={issue.level === 'error' ? 'is-error' : ''} onClick={() => focusField(issue.field!)} key={`${issue.level}-${issue.field}-${issue.label}`}><strong>{issue.label}</strong><p>{issue.detail}</p></button> : <article className={issue.level === 'error' ? 'is-error' : ''} key={`${issue.level}-${issue.label}`}><strong>{issue.label}</strong><p>{issue.detail}</p></article>)}</div>
              </section>
            ) : null}

            {previewOpen && module === brandingModule ? <BrandingPreview data={data} profile={profileData} /> : null}

            {previewOpen && module !== brandingModule ? (
              <section className="cms-preview-panel" aria-label="Preview konten">
                <header><Eye size={17} /><div><strong>Preview ringkas</strong><p>Tampilan ini membantu mengecek judul, visual, dan ringkasan sebelum disimpan.</p></div></header>
                <article>
                  {preview.image ? <Image src={preview.image} width={420} height={210} unoptimized alt="" /> : <div className="cms-preview-empty"><ImageIcon size={26} /><span>Belum ada visual</span></div>}
                  <div><span>{module.label}{preview.meta ? ` / ${preview.meta}` : ''}</span><h3>{preview.title}</h3><p>{preview.summary}</p></div>
                </article>
              </section>
            ) : null}

            {history.length ? (
              <section className="cms-history-panel" aria-label="Riwayat versi">
                <header><History size={17} /><div><strong>Riwayat versi</strong><p>5 penyimpanan terakhir tersimpan lokal sebagai cadangan cepat.</p></div></header>
                <div>{history.map((snapshot) => <button type="button" onClick={() => restoreRevision(snapshot)} key={snapshot.savedAt}><span>{snapshot.title}</span><small>{new Date(snapshot.savedAt).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</small></button>)}</div>
              </section>
            ) : null}

            <div className="cms-form-sections">
              {sections.map((section, index) => {
                const fields = section.fields.map((key) => module.fields.find((field) => field.key === key)).filter((field): field is CmsField => Boolean(field));
                const sectionErrorCount = displayedValidationIssues.filter((issue) => issue.level === 'error' && issue.field && section.fields.includes(issue.field)).length;
                if (!fields.length) return null;
                const sectionContent = <>
                  <header><i aria-hidden="true" /><div><h3>{section.title}</h3><p>{section.description}</p></div>{sectionErrorCount ? <span className="cms-section-error-count">{sectionErrorCount} perlu diperbaiki</span> : null}</header>
                  <div className="cms-editor-fields">{fields.map(renderField)}</div>
                </>;
                return section.collapsed ? (
                  <details className={`cms-form-section cms-form-section--collapsible${sectionErrorCount ? ' has-errors' : ''}`} id={`editor-section-${index}`} key={section.title} open={sectionErrorCount > 0 ? true : undefined}>
                    <summary><i aria-hidden="true" /><div><h3>{section.title}</h3><p>{section.description}</p></div><ChevronDown size={17} aria-hidden="true" /></summary>
                    <div className="cms-editor-fields">{fields.map(renderField)}</div>
                  </details>
                ) : (
                  <section className={`cms-form-section${sectionErrorCount ? ' has-errors' : ''}`} id={`editor-section-${index}`} key={section.title}>
                    {sectionContent}
                  </section>
                );
              })}
            </div>

            {message ? <output className={`cms-editor-message${message.includes('tersimpan') ? ' is-success' : ''}`}>{message.includes('tersimpan') ? <Check size={15} /> : null}{message}</output> : null}
            <footer className="cms-editor-footer"><Button type="button" variant="outline" onClick={closeEditor}>Batal</Button><Button className="cms-save-button" type="submit" disabled={busy || !dirty}><Save size={16} />{busy ? 'Menyimpan...' : 'Simpan perubahan'}</Button></footer>
          </div>
        </div>
      </form>
    </dialog>
  );
}

function MediaLibrary() {
  const [media, setMedia] = useState<MediaItem[] | null>(null);
  const [message, setMessage] = useState('');
  const [mediaQuery, setMediaQuery] = useState('');
  const [mediaFilter, setMediaFilter] = useState<'all' | 'image' | 'document'>('all');
  const fileRef = useRef<HTMLInputElement>(null);
  const filteredMedia = useMemo(() => {
    const term = mediaQuery.trim().toLowerCase();
    return (media ?? []).filter((item) => {
      const matchesType = mediaFilter === 'all' || (mediaFilter === 'image' ? item.contentType.startsWith('image/') : !item.contentType.startsWith('image/'));
      const matchesTerm = !term || item.name.toLowerCase().includes(term) || item.contentType.toLowerCase().includes(term);
      return matchesType && matchesTerm;
    });
  }, [media, mediaFilter, mediaQuery]);

  useEffect(() => {
    let active = true;
    void fetch('/api/cms/media')
      .then((response) => response.json() as Promise<{ media?: MediaItem[] }>)
      .then((result) => { if (active) setMedia(result.media ?? []); })
      .catch(() => { if (active) { setMedia([]); setMessage('Pustaka media tidak dapat dimuat.'); } });
    return () => { active = false; };
  }, []);

  async function upload(file?: File) {
    if (!file) return;
    setMessage(file.type.startsWith('image/') ? 'Mengoptimalkan gambar...' : 'Memeriksa dokumen...');
    try {
      const prepared = await prepareMediaFile(file);
      setMessage('Mengunggah media teroptimasi...');
      const uploaded = await uploadPreparedMedia(prepared, { temporary: false });
      setMedia((current) => [uploaded, ...(current ?? [])]);
      setMessage(prepared.message);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Media tidak dapat diunggah.');
    }
  }

  async function remove(item: MediaItem) {
    if (!window.confirm(`Hapus ${item.name} dari pustaka media?`)) return;
    const response = await fetch(`/api/cms/media/${item.id}`, { method: 'DELETE' });
    if (response.ok) setMedia((current) => current?.filter((value) => value.id !== item.id) ?? []);
  }

  return (
    <section className="cms-module-page">
      <header className="cms-module-header"><div><span>Pustaka aset</span><h1>Media</h1><p>Gambar otomatis dikonversi ke WebP dan diperkecil secara proporsional. PDF serta dokumen kerja disimpan dalam format asli yang aman agar isi tidak berubah. Aset yang tidak lagi dipakai dibersihkan otomatis.</p></div><Button className="cms-primary-button" onClick={() => fileRef.current?.click()}><Upload size={16} />Unggah media</Button></header>
      <input ref={fileRef} type="file" accept={MEDIA_ACCEPT} hidden onChange={(event) => { void upload(event.target.files?.[0]); event.currentTarget.value = ''; }} />
      {message ? <p className="cms-inline-message">{message}</p> : null}
      <div className="cms-media-controls">
        <label><Search size={15} /><input value={mediaQuery} onChange={(event) => setMediaQuery(event.target.value)} placeholder="Cari media..." /></label>
        <div>
          {(['all', 'image', 'document'] as const).map((filter) => <button className={mediaFilter === filter ? 'active' : ''} type="button" onClick={() => setMediaFilter(filter)} key={filter}>{filter === 'all' ? 'Semua' : filter === 'image' ? 'Gambar' : 'Dokumen'}</button>)}
        </div>
      </div>
      <div className="cms-media-grid">
        {filteredMedia.map((item) => <article key={item.id}>
          <div className="cms-media-thumbnail">{item.contentType.startsWith('image/') ? <Image src={item.url} width={360} height={170} unoptimized alt="" /> : <FileText size={30} />}</div>
          <div><strong>{item.name}</strong><span>{formatMediaSize(item.size)}{item.width && item.height ? ` · ${item.width}×${item.height}` : ''}</span>{item.optimized && item.originalSize && item.originalSize > item.size ? <small>WebP · hemat {Math.round((1 - item.size / item.originalSize) * 100)}%</small> : <small>{item.contentType.startsWith('image/') ? 'Gambar siap web' : 'Dokumen tervalidasi'}</small>}</div>
          <button type="button" onClick={() => remove(item)} aria-label={`Hapus ${item.name}`}><Trash2 size={15} /></button>
        </article>)}
        {media?.length === 0 ? <div className="cms-empty"><ImageIcon size={30} /><h2>Pustaka masih kosong</h2><p>Media yang diunggah dari editor akan tersimpan di sini.</p></div> : null}
        {media && media.length > 0 && filteredMedia.length === 0 ? <div className="cms-empty"><Search size={30} /><h2>Media tidak ditemukan</h2><p>Coba kata kunci atau filter lain.</p></div> : null}
      </div>
    </section>
  );
}

export function CmsDashboard({ admin, initialCollections }: { admin: CmsAdmin; initialCollections: CmsCollections }) {
  const [collections, setCollections] = useState<CmsCollections>(initialCollections);
  const [activeView, setActiveView] = useState<ActiveView>('overview');
  const [editor, setEditor] = useState<{ module: CmsModuleDefinition; record: CmsRecord } | null>(null);
  const [globalQuery, setGlobalQuery] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarCloseRef = useRef<HTMLButtonElement | null>(null);
  const [mediaCount, setMediaCount] = useState<number | null>(null);
  const [draggingId, setDraggingId] = useState('');
  const globalSearchRef = useRef<HTMLInputElement>(null);

  const activeModule = activeView === 'branding'
    ? brandingModule
    : activeView === 'legal'
      ? legalModule
      : cmsModules.find((module) => module.collection === activeView);
  const records = activeModule ? collections[activeModule.collection] ?? [] : [];
  const siteContentData = (collections.siteContent ?? [])[0]?.data ?? {};
  const profileData = (collections.profile ?? [])[0]?.data ?? {};
  const totalContent = Object.values(collections).reduce((sum, values) => sum + values.length, 0);
  const published = Object.values(collections).flat().filter((record) => record.status === 'published').length;
  const allRecords = useMemo(() => Object.values(collections).flat(), [collections]);
  const recentRecords = useMemo(() => [...allRecords].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5), [allRecords]);
  const globalResults = useMemo(() => {
    const term = globalQuery.trim().toLowerCase();
    if (!term) return [];
    return allRecords.filter((record) => JSON.stringify(record.data).toLowerCase().includes(term)).slice(0, 7);
  }, [allRecords, globalQuery]);
  const stats = [
    { label: 'Profil Selesai', value: collections.profile?.length ? '100%' : '0%', note: collections.profile?.length ? 'Lengkap' : 'Belum diisi' },
    { label: 'Pendidikan', value: collections.education?.length ?? 0, note: 'entri' },
    { label: 'Pengalaman', value: collections.experience?.length ?? 0, note: 'entri' },
    { label: 'Portfolio', value: collections.projects?.length ?? 0, note: 'entri' },
    { label: 'Sertifikasi', value: collections.certifications?.length ?? 0, note: 'entri' },
    { label: 'Artikel', value: collections.articles?.length ?? 0, note: 'entri' },
    { label: 'Media', value: mediaCount ?? '—', note: 'file' },
  ];

  const contentChecks = useMemo(() => {
    const projectsMissingEvidence = (collections.projects ?? []).filter((record) => !getPath(record.data, 'evidence.href')).length;
    const certificatesMissingImage = (collections.certifications ?? []).filter((record) => !record.data.image).length;
    const articlesMissingBody = (collections.articles ?? []).filter((record) => !Array.isArray(record.data.sections) || record.data.sections.length === 0).length;
    const missingSeo = [...(collections.projects ?? []), ...(collections.articles ?? [])].filter((record) => !record.data.seoDescription).length;
    const longTitles = allRecords.filter((record) => recordTitle(record, cmsModules.find((item) => item.collection === record.collection)!).length > 70).length;
    return [
      { label: 'Draft belum tampil', value: allRecords.filter((record) => record.status === 'draft').length, view: 'overview' as ActiveView },
      { label: 'Portfolio tanpa bukti', value: projectsMissingEvidence, view: 'projects' as ActiveView },
      { label: 'Sertifikat tanpa gambar', value: certificatesMissingImage, view: 'certifications' as ActiveView },
      { label: 'Artikel belum lengkap', value: articlesMissingBody, view: 'articles' as ActiveView },
      { label: 'Tampilan pencarian belum lengkap', value: missingSeo, view: 'projects' as ActiveView },
      { label: 'Judul terlalu panjang', value: longTitles, view: 'overview' as ActiveView },
      { label: 'Media tersimpan', value: mediaCount ?? 0, view: 'media' as ActiveView, positive: true },
    ];
  }, [allRecords, collections.articles, collections.certifications, collections.projects, mediaCount]);

  useEffect(() => {
    let active = true;
    void fetch('/api/cms/media').then((response) => response.json() as Promise<{ media?: MediaItem[] }>).then((result) => {
      if (active) setMediaCount(result.media?.length ?? 0);
    }).catch(() => { if (active) setMediaCount(0); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!sidebarOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    sidebarCloseRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSidebarOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [sidebarOpen]);

  useEffect(() => {
    function keyboard(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        globalSearchRef.current?.focus();
      }
      if (event.key === 'Escape') {
        setGlobalQuery('');
        setProfileOpen(false);
        globalSearchRef.current?.blur();
      }
    }
    window.addEventListener('keydown', keyboard);
    return () => window.removeEventListener('keydown', keyboard);
  }, []);

  function navigate(view: ActiveView) { setActiveView(view); setSidebarOpen(false); }
  function editRecord(record: CmsRecord) {
    const moduleDefinition = cmsModules.find((item) => item.collection === record.collection);
    if (!moduleDefinition) return;
    setActiveView(moduleDefinition.collection);
    setEditor({ module: moduleDefinition, record: withEditorDefaults(moduleDefinition, record) });
    setGlobalQuery('');
  }
  function createIn(collection: CmsCollection) {
    const moduleDefinition = cmsModules.find((item) => item.collection === collection);
    if (!moduleDefinition) return;
    setActiveView(collection);
    setEditor({ module: moduleDefinition, record: newRecord(moduleDefinition) });
  }
  function saveRecord(record: CmsRecord) {
    setCollections((current) => {
      const list = current[record.collection] ?? [];
      return { ...current, [record.collection]: list.some((item) => item.id === record.id) ? list.map((item) => item.id === record.id ? record : item) : [...list, record] };
    });
    setEditor((current) => current ? { ...current, record } : current);
  }

  async function remove(record: CmsRecord) {
    if (!window.confirm(`Hapus “${recordTitle(record, activeModule!)}”? Tindakan ini tidak dapat dibatalkan.`)) return;
    const response = await fetch(`/api/cms/content/${record.collection}/${record.id}`, {
      method: 'DELETE',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ version: record.version }),
    });
    if (response.ok) setCollections((current) => ({ ...current, [record.collection]: current[record.collection].filter((item) => item.id !== record.id) }));
  }

  async function move(record: CmsRecord, direction: -1 | 1) {
    const previous = records;
    const list = [...records];
    const index = list.findIndex((item) => item.id === record.id);
    const target = index + direction;
    if (target < 0 || target >= list.length) return;
    [list[index], list[target]] = [list[target], list[index]];
    setCollections((current) => ({ ...current, [record.collection]: list }));
    const response = await fetch(`/api/cms/content/${record.collection}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        ids: list.map((item) => item.id),
        expectedVersions: Object.fromEntries(list.map((item) => [item.id, item.version])),
      }),
    });
    const result = await response.json().catch(() => ({})) as { records?: CmsRecord[] };
    setCollections((current) => ({
      ...current,
      [record.collection]: response.ok && result.records ? result.records : previous,
    }));
  }

  async function moveTo(record: CmsRecord, targetIndex: number) {
    const previous = records;
    const list = [...records];
    const currentIndex = list.findIndex((item) => item.id === draggingId);
    if (currentIndex < 0 || currentIndex === targetIndex) {
      setDraggingId('');
      return;
    }
    const [dragged] = list.splice(currentIndex, 1);
    list.splice(targetIndex, 0, dragged);
    setDraggingId('');
    setCollections((current) => ({ ...current, [record.collection]: list }));
    const response = await fetch(`/api/cms/content/${record.collection}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        ids: list.map((item) => item.id),
        expectedVersions: Object.fromEntries(list.map((item) => [item.id, item.version])),
      }),
    });
    const result = await response.json().catch(() => ({})) as { records?: CmsRecord[] };
    setCollections((current) => ({
      ...current,
      [record.collection]: response.ok && result.records ? result.records : previous,
    }));
  }

  async function logout() {
    const response = await fetch('/api/cms/auth/logout', { method: 'POST' });
    if (response.ok) window.location.href = '/admin/login';
    else window.alert('Sesi tidak dapat diakhiri. Coba kembali.');
  }

  return (
    <main className="cms-shell">
      <aside className={`cms-sidebar${sidebarOpen ? ' is-open' : ''}`}>
        <div className="cms-sidebar-brand"><Link href="/" aria-label="Buka portfolio"><BrandIdentity context="cms" profile={profileData} siteContent={siteContentData} /></Link><button ref={sidebarCloseRef} type="button" onClick={() => setSidebarOpen(false)} aria-label="Tutup menu"><X size={18} /></button></div>
        <nav aria-label="Navigasi CMS">
          <p>Konten</p>
          {navPrimary.map(({ label, view, Icon }) => <button className={activeView === view ? 'active' : ''} type="button" onClick={() => navigate(view)} key={view}><Icon size={17} /><span>{label}</span></button>)}
          <p>Pengaturan</p>
          {navSettings.map(({ label, view, Icon }) => <button className={activeView === view ? 'active' : ''} type="button" onClick={() => navigate(view)} key={view}><Icon size={17} /><span>{label}</span></button>)}
        </nav>
      </aside>
      {sidebarOpen ? <button className="cms-sidebar-backdrop" type="button" aria-label="Tutup menu" onClick={() => setSidebarOpen(false)} /> : null}

      <div className="cms-workspace">
        <header className="cms-topbar">
          <button className="cms-menu-button" type="button" onClick={() => setSidebarOpen(true)} aria-label="Buka menu"><Menu size={19} /></button>
          <div className="cms-global-search">
            <Search size={17} />
            <input ref={globalSearchRef} value={globalQuery} onChange={(event) => setGlobalQuery(event.target.value)} placeholder="Cari konten, proyek, atau media..." aria-label="Cari seluruh konten" />
            <kbd>Ctrl K</kbd>
            {globalQuery ? <div className="cms-search-results">{globalResults.map((record) => { const moduleDefinition = cmsModules.find((item) => item.collection === record.collection)!; return <button type="button" onClick={() => editRecord(record)} key={record.id}><span><strong>{recordTitle(record, moduleDefinition)}</strong><small>{moduleDefinition.label}</small></span><ChevronRight size={15} /></button>; })}{!globalResults.length ? <p>Tidak ada konten yang cocok.</p> : null}</div> : null}
          </div>
          <div className="cms-topbar-actions"><ThemeToggle /><div className="cms-account"><button type="button" onClick={() => setProfileOpen((value) => !value)} aria-expanded={profileOpen}><span>{admin.displayName.slice(0, 1).toUpperCase()}</span><strong>{admin.displayName}</strong><ChevronDown size={15} /></button>{profileOpen ? <div><small>{admin.email}</small><Link href="/" target="_blank" rel="noreferrer"><Eye size={14} />Lihat website</Link><a href="/api/cms/export" download><Download size={14} />Unduh backup konten</a><button type="button" onClick={logout}><LogOut size={14} />Keluar</button></div> : null}</div></div>
        </header>

        <div className={`cms-content${activeView === 'overview' ? ' is-overview' : ''}`}>
          {activeView === 'overview' ? (
            <section className="cms-overview">
              <header className="cms-overview-hero"><div><i /><span>CMS PORTOFOLIO</span><h1>Ikhtisar Konten</h1><p>Kelola seluruh konten portofolio Anda di satu tempat.<br />Perbarui, tambah, dan kembangkan cerita profesional Anda.</p></div></header>
              <div className="cms-overview-stats">{stats.map((stat) => <article key={stat.label}><span>{stat.label}</span><strong>{stat.value}</strong><small>{stat.note}</small></article>)}</div>
              <div className="cms-overview-grid">
                <section className="cms-recent"><header><div><i /><h2>Terakhir Diperbarui</h2></div></header><div className="cms-recent-head"><span>Judul</span><span>Tipe</span><span>Status</span><span>Tanggal</span><span /></div><div className="cms-recent-list">{recentRecords.map((record) => { const moduleDefinition = cmsModules.find((item) => item.collection === record.collection)!; const Icon = moduleIcons[record.collection]; const updated = formatUpdatedAt(record.updatedAt); const image = recordImage(record); return <button type="button" onClick={() => editRecord(record)} key={record.id}><span className="cms-recent-title">{image ? <Image src={image} width={62} height={44} unoptimized alt="" /> : <i><Icon size={18} /></i>}<span><strong>{recordTitle(record, moduleDefinition)}</strong><small>{recordSummary(record, moduleDefinition.description)}</small></span></span><span className="cms-recent-type"><Icon size={16} />{moduleDefinition.label}</span><span className={`cms-recent-status ${record.status}`}><i />{record.status === 'published' ? 'Dipublikasikan' : 'Draft'}</span><span className="cms-recent-date">{updated.date}<small>{updated.time}</small></span><MoreHorizontal size={18} /></button>; })}</div></section>
                <aside className="cms-quick-actions"><header><i /><h2>Aksi Cepat</h2><p>Tambah atau lengkapi konten utama portfolio.</p></header><div>{([['projects','Tambah Proyek'],['experience','Tambah Pengalaman'],['certifications','Tambah Sertifikasi'],['articles','Tulis Artikel']] as [CmsCollection,string][]).map(([collection,label]) => { const Icon = moduleIcons[collection]; return <button type="button" onClick={() => createIn(collection)} key={collection}><Icon size={18} /><span>{label}</span><ChevronRight size={17} /></button>; })}<button type="button" onClick={() => editRecord((collections.profile ?? [])[0] ?? newRecord(cmsModules.find((module) => module.collection === 'profile')!))}><UserRound size={18} /><span>Edit Profil</span><ChevronRight size={17} /></button><button type="button" onClick={() => navigate('media')}><ImageIcon size={18} /><span>Unggah Media</span><ChevronRight size={17} /></button></div><footer><i /><h3>Status Konten</h3><div className="cms-health-list">{contentChecks.map((check) => <button type="button" onClick={() => navigate(check.view)} key={check.label}><span>{check.label}</span><strong className={check.positive || check.value === 0 ? 'is-ok' : ''}>{check.value}</strong></button>)}</div><p><span>{published}</span> dari <span>{totalContent}</span> konten tampil di website.</p></footer></aside>
              </div>
            </section>
          ) : activeView === 'media' ? <MediaLibrary /> : activeModule ? (
            <section className="cms-module-page">
              <header className="cms-module-header"><div><span>Modul konten</span><h1>{activeModule.label}</h1><p>{activeModule.description}</p></div>{!activeModule.singleton ? <Button className="cms-primary-button" onClick={() => setEditor({ module: activeModule, record: newRecord(activeModule) })}><Plus size={16} />Tambah {activeModule.singular}</Button> : null}</header>
              {activeModule.singleton ? (() => { const record = records[0] ?? newRecord(activeModule); const Icon = moduleIcons[activeModule.collection]; return <div className="cms-singleton-panel"><div className="cms-singleton-main"><span><Icon size={21} /></span><div><strong>{recordTitle(record, activeModule)}</strong><p>{recordSummary(record, activeModule.description)}</p><small>{records[0] ? `Diperbarui ${new Date(record.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}` : 'Belum dibuat'}</small></div><Button className="cms-primary-button" onClick={() => setEditor({ module: activeModule, record: withEditorDefaults(activeModule, record) })}>Sunting Pengaturan</Button></div><div className="cms-singleton-sections">{sectionsForModule(activeModule).map((section) => <article key={section.title}><i aria-hidden="true" /><strong>{section.title}</strong><small>{section.description}</small></article>)}</div></div>; })() : <><div className="cms-module-count"><span>{records.length} konten</span></div>
              <div className="cms-record-list">
                <div className="cms-record-head"><span>Urutan</span><span>Konten</span><span>Status</span><span>Aksi</span></div>
                {records.map((record, index) => <article className={draggingId === record.id ? 'is-dragging' : ''} key={record.id}>
                  <button className="cms-row-drop-target" type="button" onDragOver={(event) => event.preventDefault()} onDrop={() => moveTo(record, index)} aria-label={`Letakkan konten di posisi ${index + 1}`} />
                  <div className="cms-record-order"><button className="cms-drag-handle" type="button" draggable onDragStart={() => setDraggingId(record.id)} onDragEnd={() => setDraggingId('')} aria-label="Geser dengan drag"><GripVertical size={15} /></button><button type="button" onClick={() => move(record, -1)} disabled={index === 0} aria-label="Geser ke atas"><ArrowUp size={14} /></button><button type="button" onClick={() => move(record, 1)} disabled={index === records.length - 1} aria-label="Geser ke bawah"><ArrowDown size={14} /></button></div>
                  <div className="cms-record-copy"><strong>{recordTitle(record, activeModule)}</strong><p>{recordSummary(record, activeModule.description)}</p><small>Diperbarui {new Date(record.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</small></div>
                  <span className={`cms-record-status ${record.status}`}>{record.status === 'published' ? 'Ditampilkan' : 'Draft'}</span>
                  <div className="cms-record-actions"><Button variant="outline" onClick={() => setEditor({ module: activeModule, record })}>Sunting</Button>{!activeModule.singleton ? <button className="cms-delete-button" type="button" onClick={() => remove(record)} aria-label="Hapus"><Trash2 size={16} /></button> : null}</div>
                </article>)}
                {records.length === 0 ? <div className="cms-empty"><BookOpen size={30} /><h2>Belum ada konten</h2><p>Tambahkan konten pertama untuk modul ini.</p></div> : null}
              </div></>}
            </section>
          ) : null}
        </div>
      </div>
      {editor ? <ContentEditor key={`${editor.module.label}-${editor.record.id}`} module={editor.module} record={editor.record} profileData={profileData} onClose={() => setEditor(null)} onSaved={saveRecord} /> : null}
    </main>
  );
}
