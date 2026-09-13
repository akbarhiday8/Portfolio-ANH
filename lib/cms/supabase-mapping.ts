import type { CmsCollection, CmsRecord, CmsRevision, CmsStatus } from '@/lib/cms-server';

const COLLECTIONS = new Set([
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
]);
const STATUSES = new Set(['draft', 'published']);

function recordObject(value: unknown, field: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`Invalid Supabase CMS ${field}`);
  }
  return value as Record<string, unknown>;
}

function nullableString(value: unknown) {
  return typeof value === 'string' && value ? value : null;
}

function requiredString(value: unknown, field: string) {
  if (typeof value !== 'string' || !value) throw new Error(`Invalid Supabase CMS ${field}`);
  return value;
}

function requiredNumber(value: unknown, field: string) {
  const number = Number(value);
  if (!Number.isInteger(number)) throw new Error(`Invalid Supabase CMS ${field}`);
  return number;
}

function collection(value: unknown) {
  const parsed = requiredString(value, 'collection');
  if (!COLLECTIONS.has(parsed)) throw new Error('Invalid Supabase CMS collection');
  return parsed as CmsCollection;
}

function status(value: unknown) {
  const parsed = requiredString(value, 'status');
  if (!STATUSES.has(parsed)) throw new Error('Invalid Supabase CMS status');
  return parsed as CmsStatus;
}

export function mapSupabaseCmsRecord(row: Record<string, unknown>): CmsRecord {
  return {
    id: requiredString(row.id, 'record id'),
    collection: collection(row.collection),
    slug: nullableString(row.slug),
    sortOrder: requiredNumber(row.sort_order, 'record sort order'),
    status: status(row.status),
    data: recordObject(row.data_json, 'record data'),
    version: requiredNumber(row.version, 'record version'),
    publishedAt: nullableString(row.published_at),
    createdAt: requiredString(row.created_at, 'record created_at'),
    updatedAt: requiredString(row.updated_at, 'record updated_at'),
  };
}

export function mapSupabaseCmsRevision(row: Record<string, unknown>): CmsRevision {
  return {
    id: requiredString(row.id, 'revision id'),
    recordId: requiredString(row.record_id, 'revision record id'),
    collection: collection(row.collection),
    slug: nullableString(row.slug),
    sortOrder: requiredNumber(row.sort_order, 'revision sort order'),
    status: status(row.status),
    data: recordObject(row.data_json, 'revision data'),
    version: requiredNumber(row.version, 'revision version'),
    publishedAt: nullableString(row.published_at),
    createdAt: requiredString(row.created_at, 'revision created_at'),
  };
}
