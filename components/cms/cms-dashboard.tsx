'use client';

import { useMemo, useRef, useState } from 'react';
import {
  ArrowDown, ArrowLeft, ArrowUp, BarChart3, BookOpen, BriefcaseBusiness,
  Check, ChevronRight, Eye, FileBadge2, FileText, FolderKanban, GraduationCap,
  ImageIcon, LayoutDashboard, Link2, LogOut, Menu, Plus, Save, Search,
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
  return value === null || value === undefined ? '' : String(value);
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
  return String(data.title ?? data.name ?? data.role ?? data.label ?? data.value ?? module.singular);
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
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

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

  async function save(event: React.FormEvent) {
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
      onSaved(result.record);
    }
    setBusy(false);
  }

  return (
    <div className="cms-editor-layer">
      <form className="cms-editor" onSubmit={save}>
        <header className="cms-editor-header">
          <button type="button" onClick={onClose} aria-label="Tutup editor"><ArrowLeft size={18} /></button>
          <div><span>{record.id === 'new' ? 'Konten baru' : 'Sunting konten'}</span><h2>{record.id === 'new' ? `Tambah ${module.singular}` : recordTitle(record, module)}</h2></div>
          <Button className="cms-save-button" type="submit" disabled={busy}><Save size={16} />{busy ? 'Menyimpan...' : 'Simpan'}</Button>
        </header>

        <div className="cms-editor-status">
          <div><strong>Tampilkan di website</strong><p>Konten draft hanya terlihat di CMS.</p></div>
          <Switch checked={module.singleton || status === 'published'} disabled={module.singleton} onCheckedChange={(checked) => setStatus(checked ? 'published' : 'draft')} aria-label="Status publikasi" />
        </div>

        <div className="cms-editor-fields">
          {module.fields.map((field) => {
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
                    {value ? <img src={value} alt="Pratinjau media" /> : <div className="cms-media-empty"><ImageIcon size={24} /><span>Belum ada media</span></div>}
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
          })}
        </div>
        {message ? <p className={`cms-editor-message${message.includes('tersimpan') ? ' is-success' : ''}`} role="status">{message.includes('tersimpan') ? <Check size={15} /> : null}{message}</p> : null}
        <footer className="cms-editor-footer"><Button type="button" variant="outline" onClick={onClose}>Batal</Button><Button className="cms-save-button" type="submit" disabled={busy}><Save size={16} />Simpan perubahan</Button></footer>
      </form>
    </div>
  );
}

function MediaLibrary() {
  const [media, setMedia] = useState<MediaItem[] | null>(null);
  const [message, setMessage] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    const response = await fetch('/api/cms/media');
    const result = await response.json() as { media?: MediaItem[] };
    setMedia(result.media ?? []);
  }
  if (media === null) void load();

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
          <div className="cms-media-thumbnail">{item.contentType.startsWith('image/') ? <img src={item.url} alt="" /> : <FileText size={30} />}</div>
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeModule = cmsModules.find((module) => module.collection === activeView);
  const records = activeModule ? collections[activeModule.collection] ?? [] : [];
  const filteredRecords = useMemo(() => records.filter((record) => JSON.stringify(record.data).toLowerCase().includes(query.toLowerCase())), [records, query]);
  const totalContent = Object.values(collections).reduce((sum, values) => sum + values.length, 0);
  const published = Object.values(collections).flat().filter((record) => record.status === 'published').length;

  function navigate(view: ActiveView) { setActiveView(view); setSidebarOpen(false); setQuery(''); }
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
        <div className="cms-sidebar-brand"><a href="/" aria-label="Buka portfolio"><strong>ANH</strong><span>Content<br />Management</span></a><button type="button" onClick={() => setSidebarOpen(false)} aria-label="Tutup menu"><X size={18} /></button></div>
        <nav aria-label="Navigasi CMS">
          <button className={activeView === 'overview' ? 'active' : ''} type="button" onClick={() => navigate('overview')}><LayoutDashboard size={17} /><span>Ringkasan</span></button>
          <p>Konten website</p>
          {cmsModules.map((module) => { const Icon = moduleIcons[module.collection]; return <button className={activeView === module.collection ? 'active' : ''} type="button" onClick={() => navigate(module.collection)} key={module.collection}><Icon size={17} /><span>{module.label}</span><b>{collections[module.collection]?.length ?? 0}</b></button>; })}
          <p>Aset</p>
          <button className={activeView === 'media' ? 'active' : ''} type="button" onClick={() => navigate('media')}><ImageIcon size={17} /><span>Media</span></button>
        </nav>
        <div className="cms-sidebar-user"><span>{admin.displayName.slice(0, 1).toUpperCase()}</span><div><strong>{admin.displayName}</strong><small>{admin.email}</small></div><button type="button" onClick={logout} aria-label="Keluar"><LogOut size={16} /></button></div>
      </aside>
      {sidebarOpen ? <button className="cms-sidebar-backdrop" type="button" aria-label="Tutup menu" onClick={() => setSidebarOpen(false)} /> : null}

      <div className="cms-workspace">
        <header className="cms-topbar">
          <button className="cms-menu-button" type="button" onClick={() => setSidebarOpen(true)} aria-label="Buka menu"><Menu size={19} /></button>
          <div><span>CMS Portfolio</span><strong>{activeView === 'overview' ? 'Ringkasan' : activeView === 'media' ? 'Media' : activeModule?.label}</strong></div>
          <div><a href="/" target="_blank" rel="noreferrer"><Eye size={15} />Lihat website</a><ThemeToggle /></div>
        </header>

        <div className="cms-content">
          {activeView === 'overview' ? (
            <section className="cms-overview">
              <header><span>Selamat datang, {admin.displayName.split(' ')[0]}</span><h1>Kendalikan seluruh isi<br />portfolio dari satu tempat.</h1><p>Konten disusun per bagian agar pembaruan tetap cepat, konsisten, dan mudah ditinjau.</p></header>
              <div className="cms-metrics"><article><span>Total konten</span><strong>{totalContent}</strong><small>Semua modul</small></article><article><span>Sudah terbit</span><strong>{published}</strong><small>Tampil di website</small></article><article><span>Draft</span><strong>{totalContent - published}</strong><small>Belum dipublikasikan</small></article></div>
              <div className="cms-overview-grid">
                <section><div className="cms-block-heading"><div><span>Akses cepat</span><h2>Kelola konten utama</h2></div></div><div className="cms-quick-grid">{cmsModules.filter((module) => ['profile','experience','projects','certifications','articles','socials'].includes(module.collection)).map((module) => { const Icon = moduleIcons[module.collection]; return <button type="button" onClick={() => navigate(module.collection)} key={module.collection}><Icon size={19} /><span><strong>{module.label}</strong><small>{collections[module.collection]?.length ?? 0} konten</small></span><ChevronRight size={16} /></button>; })}</div></section>
                <aside><span>Status sistem</span><h2>Siap dikelola</h2><p>Akun admin tunggal aktif. Semua perubahan tersimpan secara terpusat dan konten draft tidak akan tampil di website.</p><ul><li><Check size={14} />Basis data terhubung</li><li><Check size={14} />Pustaka media aktif</li><li><Check size={14} />Registrasi terkunci setelah akun dibuat</li></ul></aside>
              </div>
            </section>
          ) : activeView === 'media' ? <MediaLibrary /> : activeModule ? (
            <section className="cms-module-page">
              <header className="cms-module-header"><div><span>Modul konten</span><h1>{activeModule.label}</h1><p>{activeModule.description}</p></div>{!activeModule.singleton ? <Button className="cms-primary-button" onClick={() => setEditor({ module: activeModule, record: newRecord(activeModule) })}><Plus size={16} />Tambah {activeModule.singular}</Button> : null}</header>
              <div className="cms-module-toolbar"><label><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Cari ${activeModule.label.toLowerCase()}...`} /></label><span>{records.length} konten</span></div>
              <div className="cms-record-list">
                {filteredRecords.map((record, index) => <article key={record.id}>
                  <div className="cms-record-order"><button type="button" onClick={() => move(record, -1)} disabled={index === 0} aria-label="Geser ke atas"><ArrowUp size={14} /></button><button type="button" onClick={() => move(record, 1)} disabled={index === filteredRecords.length - 1} aria-label="Geser ke bawah"><ArrowDown size={14} /></button></div>
                  <div className="cms-record-index">{String(index + 1).padStart(2, '0')}</div>
                  <div className="cms-record-copy"><div><strong>{recordTitle(record, activeModule)}</strong><span className={record.status}>{record.status === 'published' ? 'Terbit' : 'Draft'}</span></div><p>{String(record.data.description ?? record.data.summary ?? record.data.excerpt ?? record.data.introduction ?? activeModule.description)}</p><small>Diperbarui {new Date(record.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</small></div>
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
