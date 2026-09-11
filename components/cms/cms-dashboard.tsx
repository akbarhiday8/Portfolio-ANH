'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowDown, ArrowUp, BarChart3, BookOpen, BriefcaseBusiness,
  Check, ChevronDown, ChevronRight, Eye, FileBadge2, FileText, FolderKanban, GraduationCap,
  ImageIcon, Link2, LogOut, Menu, MoreHorizontal, Plus, Save, Search,
  Settings2, Sparkles, Trash2, Upload, UserRound, X,
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { cmsModules, type CmsField, type CmsModuleDefinition } from '@/lib/cms-fields';
import type { CmsAdmin } from '@/lib/cms-auth';
import type { CmsCollection, CmsRecord, CmsStatus } from '@/lib/cms-server';

type CmsCollections = Record<string, CmsRecord[]>;
type MediaItem = { id: string; url: string; name: string; contentType: string; size: number; createdAt: string };
type ActiveView = 'overview' | 'media' | CmsCollection;
type EditorSection = { title: string; description: string; fields: string[] };

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

const editorSections: Partial<Record<CmsCollection, EditorSection[]>> = {
  siteContent: [
    { title: 'Identitas website', description: 'Logo, footer, dan identitas utama.', fields: ['brandSubtitle', 'footerName', 'footerSubtitle', 'copyrightText'] },
    { title: 'Tentang saya', description: 'Judul dan narasi pada section Tentang.', fields: ['aboutTitle', 'aboutCaption', 'aboutHeading', 'aboutBody', 'aboutCta'] },
    { title: 'Judul section', description: 'Nama dan caption setiap bagian portfolio.', fields: ['educationTitle', 'educationCaption', 'educationNote', 'experienceTitle', 'experienceCaption', 'portfolioTitle', 'portfolioCaption', 'certificatesTitle', 'certificatesCaption'] },
    { title: 'Kontak', description: 'Ajakan dan informasi pada bagian kontak.', fields: ['contactTitle', 'contactCaption', 'contactHeading', 'contactDescription', 'contactAvailability', 'contactNote'] },
    { title: 'Halaman artikel', description: 'Pengantar untuk daftar artikel.', fields: ['articleEyebrow', 'articleHeading', 'articleDescription'] },
  ],
  profile: [
    { title: 'Identitas', description: 'Nama dan penanda personal.', fields: ['name', 'monogram', 'eyebrow', 'tagline'] },
    { title: 'Perkenalan', description: 'Ringkasan yang dibaca pengunjung.', fields: ['introduction', 'about'] },
    { title: 'Visual utama', description: 'Gambar profil pada beranda.', fields: ['artwork'] },
  ],
  experience: [
    { title: 'Informasi pekerjaan', description: 'Posisi, organisasi, dan periode kerja.', fields: ['index', 'role', 'organization', 'period'] },
    { title: 'Deskripsi peran', description: 'Ringkasan serta tanggung jawab utama.', fields: ['description', 'responsibilities'] },
    { title: 'Visual kartu', description: 'Gambar dan aksen tampilan.', fields: ['image', 'tone'] },
  ],
  projects: [
    { title: 'Identitas proyek', description: 'Judul, kategori, tahun, dan alamat halaman.', fields: ['index', 'slug', 'title', 'category', 'year', 'layout'] },
    { title: 'Gambaran proyek', description: 'Peran, disiplin, hasil kerja, dan visual utama.', fields: ['image', 'role', 'discipline', 'artifactType', 'summary'] },
    { title: 'Studi kasus', description: 'Konteks, pendekatan, kontribusi, dan proses.', fields: ['challenge', 'approach', 'scope', 'process'] },
    { title: 'Bukti dan hasil', description: 'Tautan bukti serta dampak akhir proyek.', fields: ['evidence.label', 'evidence.href', 'outcome'] },
  ],
  certifications: [
    { title: 'Informasi sertifikasi', description: 'Nama, penerbit, tahun, dan kategori.', fields: ['name', 'issuer', 'year', 'category'] },
    { title: 'Bukti dan materi', description: 'Dokumen visual serta kompetensi yang dipelajari.', fields: ['image', 'description', 'topics'] },
  ],
  articles: [
    { title: 'Informasi penerbitan', description: 'Judul, kategori, alamat, dan waktu baca.', fields: ['slug', 'title', 'category', 'publishedAt', 'readTime', 'excerpt'] },
    { title: 'Pembuka', description: 'Lead dan rangkuman gagasan utama.', fields: ['lead', 'takeaways'] },
    { title: 'Isi artikel', description: 'Bagian utama tulisan.', fields: ['sections', 'quote'] },
    { title: 'Penutup', description: 'Kesimpulan artikel.', fields: ['closingHeading', 'closing'] },
  ],
};

function sectionsForModule(module: CmsModuleDefinition) {
  const configured = editorSections[module.collection];
  if (!configured) return [{ title: 'Informasi konten', description: module.description, fields: module.fields.map((field) => field.key) }];
  const knownFields = new Set(configured.flatMap((section) => section.fields));
  const remaining = module.fields.filter((field) => !knownFields.has(field.key)).map((field) => field.key);
  return remaining.length ? [...configured, { title: 'Informasi lainnya', description: 'Pengaturan tambahan untuk konten ini.', fields: remaining }] : configured;
}

function getPath(data: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((value, key) => value && typeof value === 'object' ? (value as Record<string, unknown>)[key] : undefined, data);
}

function setPath(data: Record<string, unknown>, path: string, value: unknown) {
  const clone = structuredClone(data);
  const keys = path.split('.');
  let cursor = clone;
  keys.forEach((key, index) => {
    if (index === keys.length - 1) cursor[key] = value;
    else {
      if (!cursor[key] || typeof cursor[key] !== 'object') cursor[key] = {};
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
  }).join('\n') : '';
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
    return setPath(result, field.key, ['list', 'steps', 'articleSections'].includes(field.type) ? [] : '');
  }, {});
  return {
    id: 'new', collection: module.collection, slug: null, sortOrder: 999,
    status: 'draft', data, createdAt: '', updatedAt: '',
  };
}

function ContentEditor({
  module, record, onClose, onSaved,
}: {
  module: CmsModuleDefinition;
  record: CmsRecord;
  onClose: () => void;
  onSaved: (record: CmsRecord) => void;
}) {
  const [data, setData] = useState<Record<string, unknown>>(() => structuredClone(record.data));
  const [status, setStatus] = useState<CmsStatus>(record.status);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState('');
  const [baseline, setBaseline] = useState({ data: structuredClone(record.data), status: record.status });
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});
  const sections = useMemo(() => sectionsForModule(module), [module]);
  const dirty = useMemo(
    () => JSON.stringify(data) !== JSON.stringify(baseline.data) || status !== baseline.status,
    [baseline, data, status],
  );

  useEffect(() => {
    function protectDraft(event: BeforeUnloadEvent) {
      if (!dirty) return;
      event.preventDefault();
    }
    window.addEventListener('beforeunload', protectDraft);
    return () => window.removeEventListener('beforeunload', protectDraft);
  }, [dirty]);

  function closeEditor() {
    if (!dirty || window.confirm('Tutup editor dan abaikan perubahan yang belum disimpan?')) onClose();
  }

  async function upload(field: CmsField, file?: File) {
    if (!file) return;
    setUploading(field.key);
    setMessage('');
    const form = new FormData();
    form.set('file', file);
    const response = await fetch('/api/cms/media', { method: 'POST', body: form });
    const result = await response.json().catch(() => ({})) as { error?: string; media?: MediaItem };
    if (!response.ok || !result.media) setMessage(result.error ?? 'Media tidak dapat diunggah.');
    else setData((current) => setPath(current, field.key, result.media?.url ?? ''));
    setUploading('');
  }

  async function save(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    const endpoint = record.id === 'new'
      ? `/api/cms/content/${module.collection}`
      : `/api/cms/content/${module.collection}/${record.id}`;
    const response = await fetch(endpoint, {
      method: record.id === 'new' ? 'POST' : 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ data, status: module.singleton ? 'published' : status }),
    });
    const result = await response.json().catch(() => ({})) as { error?: string; record?: CmsRecord };
    if (!response.ok || !result.record) setMessage(result.error ?? 'Perubahan tidak dapat disimpan.');
    else {
      setMessage('Perubahan tersimpan.');
      setBaseline({ data: structuredClone(result.record.data), status: result.record.status });
      onSaved(result.record);
    }
    setBusy(false);
  }

  function renderField(field: CmsField) {
    const value = fieldText(field, getPath(data, field.key));
    const inputId = `field-${field.key.replace('.', '-')}`;
    return (
      <div className={`cms-field${field.wide ? ' is-wide' : ''}`} key={field.key}>
        <Label htmlFor={inputId}>{field.label}{field.required ? <span>*</span> : null}</Label>
        {field.type === 'textarea' || field.type === 'list' || field.type === 'steps' || field.type === 'articleSections' ? (
          <Textarea id={inputId} value={value} required={field.required} rows={field.type === 'articleSections' ? 14 : field.type === 'textarea' ? 5 : 7} placeholder={field.placeholder} onChange={(event) => setData((current) => setPath(current, field.key, parseField(field, event.target.value)))} />
        ) : field.type === 'select' ? (
          <select id={inputId} value={value} onChange={(event) => setData((current) => setPath(current, field.key, event.target.value))}>
            <option value="">Pilih opsi</option>
            {field.options?.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
          </select>
        ) : field.type === 'image' ? (
          <div className="cms-media-field">
            {value ? <Image src={value} width={190} height={126} unoptimized alt="Pratinjau media" /> : <div className="cms-media-empty"><ImageIcon size={24} /><span>Belum ada media</span></div>}
            <div>
              <Input id={inputId} value={value} placeholder="/media/... atau URL gambar" onChange={(event) => setData((current) => setPath(current, field.key, event.target.value))} />
              <input ref={(element) => { fileInputs.current[field.key] = element; }} type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden onChange={(event) => upload(field, event.target.files?.[0])} />
              <Button type="button" variant="outline" onClick={() => fileInputs.current[field.key]?.click()} disabled={uploading === field.key}><Upload size={15} />{uploading === field.key ? 'Mengunggah...' : 'Unggah gambar'}</Button>
            </div>
          </div>
        ) : (
          <Input id={inputId} type={field.type === 'url' ? 'url' : 'text'} value={value} required={field.required} placeholder={field.placeholder} onChange={(event) => setData((current) => setPath(current, field.key, event.target.value))} />
        )}
        {field.helper ? <small>{field.helper}</small> : null}
      </div>
    );
  }

  return (
    <dialog className="cms-editor-layer" open aria-label={`Editor ${module.singular}`}>
      <form className="cms-editor" onSubmit={save}>
        <header className="cms-editor-header">
          <div><span>{record.id === 'new' ? 'Konten baru' : module.label}</span><h2>{record.id === 'new' ? `Tambah ${module.singular}` : recordTitle(record, module)}</h2></div>
          <div className="cms-editor-actions">
            <span className={dirty ? 'is-dirty' : 'is-saved'}>{dirty ? 'Belum disimpan' : 'Tersimpan'}</span>
            <Button className="cms-save-button" type="submit" disabled={busy || !dirty}><Save size={16} />{busy ? 'Menyimpan...' : 'Simpan'}</Button>
            <button type="button" onClick={closeEditor} aria-label="Tutup editor"><X size={18} /></button>
          </div>
        </header>

        <div className="cms-editor-body">
          <aside className="cms-editor-guide">
            <span className="cms-editor-guide-label">Isi konten</span>
            <p>{module.description}</p>
            <nav aria-label="Bagian formulir">
              {sections.map((section, index) => <a href={`#editor-section-${index}`} key={section.title}><span>{String(index + 1).padStart(2, '0')}</span>{section.title}</a>)}
            </nav>
            <div className="cms-editor-guide-note"><strong>Simpan secara manual</strong><p>Perubahan baru tampil setelah tombol Simpan ditekan.</p></div>
          </aside>

          <div className="cms-editor-main">
            <section className="cms-editor-status">
              <div><strong>Status publikasi</strong><p>{module.singleton ? 'Konten utama selalu ditampilkan di website.' : 'Aktifkan untuk menampilkan konten di website.'}</p></div>
              <div><span>{module.singleton || status === 'published' ? 'Ditampilkan' : 'Draft'}</span><Switch checked={module.singleton || status === 'published'} disabled={module.singleton} onCheckedChange={(checked) => setStatus(checked ? 'published' : 'draft')} aria-label="Status publikasi" /></div>
            </section>

            <div className="cms-form-sections">
              {sections.map((section, index) => {
                const fields = section.fields.map((key) => module.fields.find((field) => field.key === key)).filter((field): field is CmsField => Boolean(field));
                if (!fields.length) return null;
                return (
                  <section className="cms-form-section" id={`editor-section-${index}`} key={section.title}>
                    <header><span>{String(index + 1).padStart(2, '0')}</span><div><h3>{section.title}</h3><p>{section.description}</p></div></header>
                    <div className="cms-editor-fields">{fields.map(renderField)}</div>
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
  const fileRef = useRef<HTMLInputElement>(null);

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
    setMessage('Mengunggah media...');
    const form = new FormData(); form.set('file', file);
    const response = await fetch('/api/cms/media', { method: 'POST', body: form });
    const result = await response.json().catch(() => ({})) as { error?: string; media?: MediaItem };
    if (result.media) { setMedia((current) => [result.media!, ...(current ?? [])]); setMessage('Media berhasil diunggah.'); }
    else setMessage(result.error ?? 'Media tidak dapat diunggah.');
  }

  async function remove(item: MediaItem) {
    if (!window.confirm(`Hapus ${item.name} dari pustaka media?`)) return;
    const response = await fetch(`/api/cms/media/${item.id}`, { method: 'DELETE' });
    if (response.ok) setMedia((current) => current?.filter((value) => value.id !== item.id) ?? []);
  }

  return (
    <section className="cms-module-page">
      <header className="cms-module-header"><div><span>Pustaka aset</span><h1>Media</h1><p>Kelola gambar dan dokumen yang digunakan pada konten.</p></div><Button className="cms-primary-button" onClick={() => fileRef.current?.click()}><Upload size={16} />Unggah media</Button></header>
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif,application/pdf" hidden onChange={(event) => upload(event.target.files?.[0])} />
      {message ? <p className="cms-inline-message">{message}</p> : null}
      <div className="cms-media-grid">
        {media?.map((item) => <article key={item.id}>
          <div className="cms-media-thumbnail">{item.contentType.startsWith('image/') ? <Image src={item.url} width={360} height={170} unoptimized alt="" /> : <FileText size={30} />}</div>
          <div><strong>{item.name}</strong><span>{(item.size / 1024).toFixed(0)} KB</span></div>
          <button type="button" onClick={() => remove(item)} aria-label={`Hapus ${item.name}`}><Trash2 size={15} /></button>
        </article>)}
        {media?.length === 0 ? <div className="cms-empty"><ImageIcon size={30} /><h2>Pustaka masih kosong</h2><p>Media yang diunggah dari editor akan tersimpan di sini.</p></div> : null}
      </div>
    </section>
  );
}

export function CmsDashboard({ admin, initialCollections }: { admin: CmsAdmin; initialCollections: CmsCollections }) {
  const [collections, setCollections] = useState<CmsCollections>(initialCollections);
  const [activeView, setActiveView] = useState<ActiveView>('overview');
  const [editor, setEditor] = useState<{ module: CmsModuleDefinition; record: CmsRecord } | null>(null);
  const [query, setQuery] = useState('');
  const [globalQuery, setGlobalQuery] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mediaCount, setMediaCount] = useState<number | null>(null);
  const globalSearchRef = useRef<HTMLInputElement>(null);

  const activeModule = cmsModules.find((module) => module.collection === activeView);
  const records = activeModule ? collections[activeModule.collection] ?? [] : [];
  const filteredRecords = records.filter((record) => JSON.stringify(record.data).toLowerCase().includes(query.toLowerCase()));
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

  useEffect(() => {
    let active = true;
    void fetch('/api/cms/media').then((response) => response.json() as Promise<{ media?: MediaItem[] }>).then((result) => {
      if (active) setMediaCount(result.media?.length ?? 0);
    }).catch(() => { if (active) setMediaCount(0); });
    return () => { active = false; };
  }, []);

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

  function navigate(view: ActiveView) { setActiveView(view); setSidebarOpen(false); setQuery(''); }
  function editRecord(record: CmsRecord) {
    const moduleDefinition = cmsModules.find((item) => item.collection === record.collection);
    if (!moduleDefinition) return;
    setActiveView(moduleDefinition.collection);
    setEditor({ module: moduleDefinition, record });
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
    const response = await fetch(`/api/cms/content/${record.collection}/${record.id}`, { method: 'DELETE' });
    if (response.ok) setCollections((current) => ({ ...current, [record.collection]: current[record.collection].filter((item) => item.id !== record.id) }));
  }

  async function move(record: CmsRecord, direction: -1 | 1) {
    const list = [...records];
    const index = list.findIndex((item) => item.id === record.id);
    const target = index + direction;
    if (target < 0 || target >= list.length) return;
    [list[index], list[target]] = [list[target], list[index]];
    setCollections((current) => ({ ...current, [record.collection]: list }));
    await fetch(`/api/cms/content/${record.collection}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ids: list.map((item) => item.id) }) });
  }

  async function logout() { await fetch('/api/cms/auth/logout', { method: 'POST' }); window.location.href = '/admin/login'; }

  return (
    <main className="cms-shell">
      <aside className={`cms-sidebar${sidebarOpen ? ' is-open' : ''}`}>
        <div className="cms-sidebar-brand"><Link href="/" aria-label="Buka portfolio"><strong>ANH</strong><span>Portofolio Pribadi</span></Link><button type="button" onClick={() => setSidebarOpen(false)} aria-label="Tutup menu"><X size={18} /></button></div>
        <nav aria-label="Navigasi CMS">
          <button className={activeView === 'overview' ? 'active' : ''} type="button" onClick={() => navigate('overview')}><b>00</b><span>Ikhtisar</span></button>
          {cmsModules.map((module, index) => <button className={activeView === module.collection ? 'active' : ''} type="button" onClick={() => navigate(module.collection)} key={module.collection}><b>{String(index + 1).padStart(2, '0')}</b><span>{module.label}</span></button>)}
          <button className={activeView === 'media' ? 'active' : ''} type="button" onClick={() => navigate('media')}><b>{String(cmsModules.length + 1).padStart(2, '0')}</b><span>Media</span></button>
        </nav>
        <div className="cms-sidebar-signature"><i /><span>CONTENT<br />MANAGEMENT<br />SYSTEM</span></div>
      </aside>
      {sidebarOpen ? <button className="cms-sidebar-backdrop" type="button" aria-label="Tutup menu" onClick={() => setSidebarOpen(false)} /> : null}

      <div className="cms-workspace">
        <header className="cms-topbar">
          <button className="cms-menu-button" type="button" onClick={() => setSidebarOpen(true)} aria-label="Buka menu"><Menu size={19} /></button>
          <div className="cms-global-search">
            <Search size={17} />
            <input ref={globalSearchRef} value={globalQuery} onChange={(event) => setGlobalQuery(event.target.value)} placeholder="Cari konten, proyek, atau media..." aria-label="Cari seluruh konten" />
            <kbd>⌘ K</kbd>
            {globalQuery ? <div className="cms-search-results">{globalResults.map((record) => { const moduleDefinition = cmsModules.find((item) => item.collection === record.collection)!; return <button type="button" onClick={() => editRecord(record)} key={record.id}><span><strong>{recordTitle(record, moduleDefinition)}</strong><small>{moduleDefinition.label}</small></span><ChevronRight size={15} /></button>; })}{!globalResults.length ? <p>Tidak ada konten yang cocok.</p> : null}</div> : null}
          </div>
          <div className="cms-topbar-actions"><ThemeToggle /><div className="cms-account"><button type="button" onClick={() => setProfileOpen((value) => !value)} aria-expanded={profileOpen}><span>{admin.displayName.slice(0, 1).toUpperCase()}</span><strong>{admin.displayName}</strong><ChevronDown size={15} /></button>{profileOpen ? <div><small>{admin.email}</small><Link href="/" target="_blank" rel="noreferrer"><Eye size={14} />Lihat website</Link><button type="button" onClick={logout}><LogOut size={14} />Keluar</button></div> : null}</div></div>
        </header>

        <div className={`cms-content${activeView === 'overview' ? ' is-overview' : ''}`}>
          {activeView === 'overview' ? (
            <section className="cms-overview">
              <header className="cms-overview-hero"><div><i /><span>CMS PORTOFOLIO</span><h1>Ikhtisar Konten</h1><p>Kelola seluruh konten portofolio Anda di satu tempat.<br />Perbarui, tambah, dan kembangkan cerita profesional Anda.</p></div></header>
              <div className="cms-overview-stats">{stats.map((stat) => <article key={stat.label}><span>{stat.label}</span><strong>{stat.value}</strong><small>{stat.note}</small></article>)}</div>
              <div className="cms-overview-grid">
                <section className="cms-recent"><header><div><i /><h2>Terakhir Diperbarui</h2></div><button type="button" onClick={() => navigate('projects')}>Lihat Semua <ChevronRight size={17} /></button></header><div className="cms-recent-head"><span>Judul</span><span>Tipe</span><span>Status</span><span>Tanggal</span><span /></div><div className="cms-recent-list">{recentRecords.map((record) => { const moduleDefinition = cmsModules.find((item) => item.collection === record.collection)!; const Icon = moduleIcons[record.collection]; const updated = formatUpdatedAt(record.updatedAt); const image = recordImage(record); return <button type="button" onClick={() => editRecord(record)} key={record.id}><span className="cms-recent-title">{image ? <Image src={image} width={62} height={44} unoptimized alt="" /> : <i><Icon size={18} /></i>}<span><strong>{recordTitle(record, moduleDefinition)}</strong><small>{recordSummary(record, moduleDefinition.description)}</small></span></span><span className="cms-recent-type"><Icon size={16} />{moduleDefinition.label}</span><span className={`cms-recent-status ${record.status}`}><i />{record.status === 'published' ? 'Dipublikasikan' : 'Draft'}</span><span className="cms-recent-date">{updated.date}<small>{updated.time}</small></span><MoreHorizontal size={18} /></button>; })}</div></section>
                <aside className="cms-quick-actions"><header><i /><h2>Aksi Cepat</h2><p>Tambah konten baru ke portofolio Anda.</p></header><div>{([['projects','Tambah Proyek'],['experience','Tambah Pengalaman'],['certifications','Tambah Sertifikasi'],['articles','Tambah Artikel']] as [CmsCollection,string][]).map(([collection,label]) => { const Icon = moduleIcons[collection]; return <button type="button" onClick={() => createIn(collection)} key={collection}><Icon size={18} /><span>{label}</span><ChevronRight size={17} /></button>; })}<button type="button" onClick={() => navigate('media')}><ImageIcon size={18} /><span>Unggah Media</span><ChevronRight size={17} /></button></div><footer><i /><p><span>{published}</span> dari <span>{totalContent}</span> konten telah dipublikasikan.</p></footer></aside>
              </div>
            </section>
          ) : activeView === 'media' ? <MediaLibrary /> : activeModule ? (
            <section className="cms-module-page">
              <header className="cms-module-header"><div><span>Modul konten</span><h1>{activeModule.label}</h1><p>{activeModule.description}</p></div>{!activeModule.singleton ? <Button className="cms-primary-button" onClick={() => setEditor({ module: activeModule, record: newRecord(activeModule) })}><Plus size={16} />Tambah {activeModule.singular}</Button> : null}</header>
              <div className="cms-module-toolbar"><label><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Cari ${activeModule.label.toLowerCase()}...`} /></label><span>{records.length} konten</span></div>
              <div className="cms-record-list">
                <div className="cms-record-head"><span>Urutan</span><span>Konten</span><span>Status</span><span>Aksi</span></div>
                {filteredRecords.map((record, index) => <article key={record.id}>
                  <div className="cms-record-order"><button type="button" onClick={() => move(record, -1)} disabled={index === 0} aria-label="Geser ke atas"><ArrowUp size={14} /></button><button type="button" onClick={() => move(record, 1)} disabled={index === filteredRecords.length - 1} aria-label="Geser ke bawah"><ArrowDown size={14} /></button></div>
                  <div className="cms-record-copy"><strong>{recordTitle(record, activeModule)}</strong><p>{recordSummary(record, activeModule.description)}</p><small>Diperbarui {new Date(record.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</small></div>
                  <span className={`cms-record-status ${record.status}`}>{record.status === 'published' ? 'Ditampilkan' : 'Draft'}</span>
                  <div className="cms-record-actions"><Button variant="outline" onClick={() => setEditor({ module: activeModule, record })}>Sunting</Button>{!activeModule.singleton ? <button className="cms-delete-button" type="button" onClick={() => remove(record)} aria-label="Hapus"><Trash2 size={16} /></button> : null}</div>
                </article>)}
                {filteredRecords.length === 0 ? <div className="cms-empty"><BookOpen size={30} /><h2>Belum ada konten</h2><p>Tambahkan konten pertama untuk modul ini.</p></div> : null}
              </div>
            </section>
          ) : null}
        </div>
      </div>
      {editor ? <ContentEditor key={editor.record.id} module={editor.module} record={editor.record} onClose={() => setEditor(null)} onSaved={saveRecord} /> : null}
    </main>
  );
}
