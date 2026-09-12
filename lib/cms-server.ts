import 'server-only';

import { env } from 'cloudflare:workers';
import { portfolioData } from '@/lib/portfolio-data';

export const CMS_COLLECTIONS = [
  'siteContent',
  'profile',
  'statistics',
  'capabilities',
  'education',
  'experience',
  'projects',
  'certifications',
  'articles',
  'socials',
] as const;

export type CmsCollection = (typeof CMS_COLLECTIONS)[number];
export type CmsStatus = 'draft' | 'published';

export type CmsRecord = {
  id: string;
  collection: CmsCollection;
  slug: string | null;
  sortOrder: number;
  status: CmsStatus;
  data: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

type CmsBindings = { DB: D1Database; MEDIA: R2Bucket };
const bindings = () => env as unknown as CmsBindings;

const schemaStatements = [
  `CREATE TABLE IF NOT EXISTS cms_admins (
    id INTEGER PRIMARY KEY CHECK (id = 1), email TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL, password_hash TEXT NOT NULL,
    password_salt TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS cms_sessions (
    token_hash TEXT PRIMARY KEY, admin_id INTEGER NOT NULL,
    expires_at TEXT NOT NULL, created_at TEXT NOT NULL,
    FOREIGN KEY (admin_id) REFERENCES cms_admins(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS cms_records (
    id TEXT PRIMARY KEY, collection TEXT NOT NULL, slug TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published')),
    data_json TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_cms_records_collection_slug
    ON cms_records(collection, slug) WHERE slug IS NOT NULL`,
  `CREATE INDEX IF NOT EXISTS idx_cms_records_collection_order
    ON cms_records(collection, sort_order)`,
  `CREATE INDEX IF NOT EXISTS idx_cms_records_public
    ON cms_records(collection, status, sort_order)`,
  `CREATE TABLE IF NOT EXISTS cms_media (
    id TEXT PRIMARY KEY, object_key TEXT NOT NULL UNIQUE,
    original_name TEXT NOT NULL, content_type TEXT NOT NULL,
    size_bytes INTEGER NOT NULL, created_at TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_cms_media_created_at ON cms_media(created_at DESC)`,
];

let schemaReady: Promise<void> | null = null;

export async function ensureCmsSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      const db = bindings().DB;
      await db.batch(schemaStatements.map((statement) => db.prepare(statement)));
      await seedCmsContent();
    })().catch((error) => {
      schemaReady = null;
      throw error;
    });
  }
  return schemaReady;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || crypto.randomUUID();
}

function seedEntries() {
  return CMS_COLLECTIONS.flatMap((collection) => {
    const source = portfolioData[collection];
    const values: readonly unknown[] = Array.isArray(source) ? source as readonly unknown[] : [source];
    return values.map((value, index) => {
      const data = JSON.parse(JSON.stringify(value)) as Record<string, unknown>;
      const naturalKey = String(data.slug ?? data.label ?? data.name ?? data.title ?? collection);
      const suffix = Array.isArray(source) ? `-${index + 1}` : '';
      const id = Array.isArray(source) ? `${collection}-${slugify(naturalKey)}${suffix}` : collection;
      const slug = typeof data.slug === 'string' ? data.slug : id;
      return { id, collection, slug, sortOrder: index, data };
    });
  });
}

async function seedCmsContent() {
  const db = bindings().DB;
  const count = await db.prepare('SELECT COUNT(*) AS count FROM cms_records').first<{ count: number }>();
  if (Number(count?.count ?? 0) > 0) return;

  const now = new Date().toISOString();
  const statements = seedEntries().map((entry) => db.prepare(
    `INSERT OR IGNORE INTO cms_records
      (id, collection, slug, sort_order, status, data_json, created_at, updated_at)
     VALUES (?, ?, ?, ?, 'published', ?, ?, ?)`,
  ).bind(entry.id, entry.collection, entry.slug, entry.sortOrder, JSON.stringify(entry.data), now, now));

  for (let index = 0; index < statements.length; index += 50) {
    await db.batch(statements.slice(index, index + 50));
  }
}

function mapRecord(row: Record<string, unknown>): CmsRecord {
  return {
    id: String(row.id),
    collection: String(row.collection) as CmsCollection,
    slug: row.slug ? String(row.slug) : null,
    sortOrder: Number(row.sort_order),
    status: String(row.status) as CmsStatus,
    data: JSON.parse(String(row.data_json)) as Record<string, unknown>,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function extractMediaObjectKeys(value: unknown, result = new Set<string>()) {
  if (typeof value === 'string') {
    const matches = value.match(/\/media\/cms\/[A-Za-z0-9_.-]+/g) ?? [];
    for (const match of matches) {
      const key = match.replace(/^\/media\//, '');
      result.add(key.split('/').map((part) => decodeURIComponent(part)).join('/'));
    }
  } else if (Array.isArray(value)) {
    value.forEach((item) => extractMediaObjectKeys(item, result));
  } else if (value && typeof value === 'object') {
    Object.values(value as Record<string, unknown>).forEach((item) => extractMediaObjectKeys(item, result));
  }
  return result;
}

async function removeUnreferencedMedia(objectKeys: Iterable<string>) {
  const db = bindings().DB;
  const bucket = bindings().MEDIA;
  const uniqueKeys = [...new Set(objectKeys)].filter((key) => key.startsWith('cms/'));
  let removed = 0;
  for (const objectKey of uniqueKeys) {
    const mediaUrl = `/media/${objectKey}`;
    const reference = await db.prepare('SELECT id FROM cms_records WHERE data_json LIKE ? LIMIT 1')
      .bind(`%${mediaUrl}%`)
      .first();
    if (reference) continue;
    const row = await db.prepare('SELECT id FROM cms_media WHERE object_key = ?').bind(objectKey).first<{ id: string }>();
    if (!row) continue;
    await bucket.delete(objectKey);
    await db.prepare('DELETE FROM cms_media WHERE id = ?').bind(row.id).run();
    removed += 1;
  }
  return removed;
}

async function cleanupReplacedMedia(previousData: Record<string, unknown>, nextData?: Record<string, unknown>) {
  const previousKeys = extractMediaObjectKeys(previousData);
  const nextKeys = nextData ? extractMediaObjectKeys(nextData) : new Set<string>();
  const removedKeys = [...previousKeys].filter((key) => !nextKeys.has(key));
  if (removedKeys.length) await removeUnreferencedMedia(removedKeys);
}

export async function listCmsRecords(options: { includeDrafts?: boolean; collection?: CmsCollection } = {}) {
  await ensureCmsSchema();
  const conditions: string[] = [];
  const params: string[] = [];
  if (options.collection) {
    conditions.push('collection = ?');
    params.push(options.collection);
  }
  if (!options.includeDrafts) conditions.push("status = 'published'");
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const result = await bindings().DB.prepare(
    `SELECT * FROM cms_records ${where} ORDER BY collection, sort_order, created_at`,
  ).bind(...params).all<Record<string, unknown>>();
  return result.results.map(mapRecord);
}

export async function getPortfolioContent() {
  try {
    const records = await listCmsRecords();
    const fallback = JSON.parse(JSON.stringify(portfolioData)) as Record<string, unknown>;
    for (const collection of CMS_COLLECTIONS) {
      const matches = records.filter((record) => record.collection === collection);
      if (!matches.length) continue;
      const defaultValue = fallback[collection];
      if (collection === 'profile' || collection === 'siteContent') {
        fallback[collection] = { ...(defaultValue as Record<string, unknown>), ...matches[0].data };
      } else {
        const defaults = Array.isArray(defaultValue) ? defaultValue as Record<string, unknown>[] : [];
        fallback[collection] = matches.map((record) => {
          const key = record.data.slug ?? record.data.label ?? record.data.name ?? record.data.title;
          const defaultRecord = defaults.find((item) => (item.slug ?? item.label ?? item.name ?? item.title) === key);
          return { ...defaultRecord, ...record.data };
        });
      }
    }
    return fallback as unknown as typeof portfolioData;
  } catch {
    return portfolioData;
  }
}

export async function getCmsSnapshot() {
  const records = await listCmsRecords({ includeDrafts: true });
  return CMS_COLLECTIONS.reduce<Record<string, CmsRecord[]>>((result, collection) => {
    result[collection] = records.filter((record) => record.collection === collection);
    return result;
  }, {});
}

export async function createCmsRecord(collection: CmsCollection, data: Record<string, unknown>, status: CmsStatus) {
  await ensureCmsSchema();
  const db = bindings().DB;
  const id = crypto.randomUUID();
  const naturalSlug = String(data.slug ?? data.label ?? data.name ?? data.title ?? id);
  let slug = slugify(naturalSlug);
  const duplicate = await db.prepare('SELECT id FROM cms_records WHERE collection = ? AND slug = ?').bind(collection, slug).first();
  if (duplicate) slug = `${slug}-${id.slice(0, 6)}`;
  if (collection === 'projects' || collection === 'articles') data.slug = slug;
  const max = await db.prepare('SELECT MAX(sort_order) AS value FROM cms_records WHERE collection = ?').bind(collection).first<{ value: number | null }>();
  const sortOrder = Number(max?.value ?? -1) + 1;
  const now = new Date().toISOString();
  await db.prepare(
    `INSERT INTO cms_records (id, collection, slug, sort_order, status, data_json, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  ).bind(id, collection, slug, sortOrder, status, JSON.stringify(data), now, now).run();
  return { id, collection, slug, sortOrder, status, data, createdAt: now, updatedAt: now } satisfies CmsRecord;
}

export async function updateCmsRecord(id: string, data: Record<string, unknown>, status: CmsStatus) {
  await ensureCmsSchema();
  const existing = await bindings().DB.prepare('SELECT * FROM cms_records WHERE id = ?').bind(id).first<Record<string, unknown>>();
  if (!existing) return null;
  const previous = mapRecord(existing);
  const collection = String(existing.collection) as CmsCollection;
  let slug = String(existing.slug ?? id);
  if ((collection === 'projects' || collection === 'articles') && typeof data.slug === 'string') {
    slug = slugify(data.slug);
    data.slug = slug;
  }
  const now = new Date().toISOString();
  await bindings().DB.prepare(
    'UPDATE cms_records SET slug = ?, status = ?, data_json = ?, updated_at = ? WHERE id = ?',
  ).bind(slug, status, JSON.stringify(data), now, id).run();
  await cleanupReplacedMedia(previous.data, data);
  return { ...previous, slug, status, data, updatedAt: now };
}

export async function deleteCmsRecord(id: string) {
  await ensureCmsSchema();
  const existing = await bindings().DB.prepare(
    "SELECT * FROM cms_records WHERE id = ? AND collection NOT IN ('profile', 'siteContent')",
  ).bind(id).first<Record<string, unknown>>();
  if (!existing) return null;
  const deleted = await bindings().DB.prepare(
    "DELETE FROM cms_records WHERE id = ? AND collection NOT IN ('profile', 'siteContent')",
  ).bind(id).run();
  await cleanupReplacedMedia(mapRecord(existing).data);
  return deleted;
}

export async function reorderCmsRecords(collection: CmsCollection, ids: string[]) {
  await ensureCmsSchema();
  const db = bindings().DB;
  await db.batch(ids.map((id, index) => db.prepare(
    'UPDATE cms_records SET sort_order = ?, updated_at = ? WHERE id = ? AND collection = ?',
  ).bind(index, new Date().toISOString(), id, collection)));
}

export async function cleanupUnusedCmsMedia() {
  await ensureCmsSchema();
  const result = await bindings().DB.prepare("SELECT object_key FROM cms_media WHERE object_key LIKE 'cms/%'")
    .all<{ object_key: string }>();
  return removeUnreferencedMedia(result.results.map((row) => row.object_key));
}

export function getMediaBucket() {
  return bindings().MEDIA;
}

export function getCmsDatabase() {
  return bindings().DB;
}
