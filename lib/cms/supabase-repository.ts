import 'server-only';

import { CMS_COLLECTIONS, type CmsCollection, type CmsRecord } from '@/lib/cms-server';
import type { CmsRepository, PortfolioContent } from '@/lib/cms/repository-contract';
import { CmsRepositoryError } from '@/lib/cms/repository-contract';
import { mapSupabaseCmsRecord, mapSupabaseCmsRevision } from '@/lib/cms/supabase-mapping';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const RECORD_COLUMNS = [
  'id',
  'collection',
  'slug',
  'sort_order',
  'status',
  'data_json',
  'version',
  'published_at',
  'created_at',
  'updated_at',
].join(',');

const REVISION_COLUMNS = [
  'id',
  'record_id',
  'collection',
  'slug',
  'sort_order',
  'status',
  'data_json',
  'version',
  'published_at',
  'created_at',
].join(',');

function scalarString(value: unknown, fallback: string) {
  return typeof value === 'string' || typeof value === 'number' ? String(value) : fallback;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || crypto.randomUUID();
}

function isCmsCollection(value: unknown): value is CmsCollection {
  return typeof value === 'string' && (CMS_COLLECTIONS as readonly string[]).includes(value);
}

function repositoryFailure(
  operation: string,
  error: { code?: string } | null | undefined,
): never {
  const code = error?.code ?? 'unknown';
  console.error(`[supabase-cms] ${operation} failed`, { code });

  if (code === '23505') {
    throw new CmsRepositoryError('duplicate', 'Alamat halaman atau data unik sudah digunakan.');
  }
  if (code === '40001') {
    throw new CmsRepositoryError('conflict', 'Konten telah berubah. Muat ulang sebelum menyimpan kembali.');
  }
  if (code === 'P0002') {
    throw new CmsRepositoryError('not_found', 'Konten tidak ditemukan.');
  }
  if (code === '42501') {
    throw new CmsRepositoryError('forbidden', 'Akses administrator diperlukan.');
  }
  if (code === '23514') {
    throw new CmsRepositoryError('invalid', 'Data konten tidak memenuhi aturan penyimpanan.');
  }
  throw new CmsRepositoryError('unavailable', 'Repository Supabase tidak dapat menyelesaikan permintaan.');
}

function mapRecordRows(rows: unknown[], operation: string) {
  try {
    return rows.map((row) => {
      if (!row || typeof row !== 'object' || Array.isArray(row)) throw new Error('Invalid row');
      const record = mapSupabaseCmsRecord(row as Record<string, unknown>);
      if (!isCmsCollection(record.collection)) throw new Error('Invalid collection');
      return record;
    });
  } catch {
    repositoryFailure(operation, { code: 'invalid_response' });
  }
}

function mapRecordResult(data: unknown, operation: string) {
  const row = Array.isArray(data) ? data[0] : data;
  const records = mapRecordRows(row ? [row] : [], operation);
  if (!records.length) repositoryFailure(operation, { code: 'invalid_response' });
  return records[0];
}

function emptyPortfolioContent(records: CmsRecord[]): PortfolioContent {
  const content: Record<string, unknown> = {};
  for (const collection of CMS_COLLECTIONS) {
    const matches = records.filter((record) => record.collection === collection);
    content[collection] = collection === 'profile' || collection === 'siteContent'
      ? matches[0]?.data ?? {}
      : matches.map((record) => record.data);
  }
  return content as PortfolioContent;
}

async function listRecords(
  options: Parameters<CmsRepository['listRecords']>[0] = {},
): Promise<CmsRecord[]> {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from('cms_records')
    .select(RECORD_COLUMNS)
    .order('collection', { ascending: true })
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (options.collection) query = query.eq('collection', options.collection);
  if (!options.includeDrafts) query = query.eq('status', 'published');

  const { data, error } = await query;
  if (error) repositoryFailure('list records', error);
  return mapRecordRows(data ?? [], 'map record list');
}

async function getRecord(
  collection: CmsCollection,
  id: string,
  options: { includeDrafts?: boolean } = {},
) {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from('cms_records')
    .select(RECORD_COLUMNS)
    .eq('collection', collection)
    .eq('id', id);
  if (!options.includeDrafts) query = query.eq('status', 'published');

  const { data, error } = await query.maybeSingle();
  if (error) repositoryFailure('get record', error);
  return data ? mapRecordResult(data, 'map record') : null;
}

async function versionedRecord(
  collection: CmsCollection,
  id: string,
  expectedVersion?: number,
) {
  const existing = await getRecord(collection, id, { includeDrafts: true });
  if (!existing) return null;
  const version = expectedVersion ?? existing.version;
  if (!Number.isInteger(version) || Number(version) < 1) {
    throw new CmsRepositoryError('conflict', 'Versi konten tidak tersedia. Muat ulang lalu coba kembali.');
  }
  return { existing, version: Number(version) };
}

async function getExistingMediaLinks(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  recordId: string,
) {
  const { data, error } = await supabase
    .from('cms_record_media')
    .select('media_id,field_path')
    .eq('record_id', recordId)
    .order('field_path', { ascending: true });
  if (error) repositoryFailure('list record media links', error);

  return (data ?? []).map((link) => ({
    media_id: link.media_id,
    field_path: link.field_path,
  }));
}

export const supabaseCmsRepository = {
  listRecords,
  getRecord,

  async getPortfolioContent() {
    return emptyPortfolioContent(await listRecords());
  },

  async getSnapshot() {
    const records = await listRecords({ includeDrafts: true });
    return CMS_COLLECTIONS.reduce<Record<string, CmsRecord[]>>((snapshot, collection) => {
      snapshot[collection] = records.filter((record) => record.collection === collection);
      return snapshot;
    }, {});
  },

  async createRecord(collection, data, status) {
    const supabase = await createSupabaseServerClient();
    const id = collection === 'profile' || collection === 'siteContent'
      ? collection
      : crypto.randomUUID();
    const nextData = { ...data };
    const naturalSlug = scalarString(
      nextData.slug ?? nextData.label ?? nextData.name ?? nextData.title,
      id,
    );
    const slug = slugify(naturalSlug);
    if (collection === 'projects' || collection === 'articles') nextData.slug = slug;
    const existing = await listRecords({ collection, includeDrafts: true });
    const sortOrder = existing.reduce((maximum, record) => Math.max(maximum, record.sortOrder), -1) + 1;

    const { data: created, error } = await supabase.rpc('cms_create_record', {
      record_id: id,
      record_collection: collection,
      record_slug: slug,
      record_sort_order: sortOrder,
      record_status: status,
      record_data: nextData,
      media_links: [],
      audit_metadata: {},
    });
    if (error) repositoryFailure('create record', error);
    return mapRecordResult(created, 'map created record');
  },

  async updateRecord(collection, id, data, status, expectedVersion) {
    const versioned = await versionedRecord(collection, id, expectedVersion);
    if (!versioned) return null;
    const supabase = await createSupabaseServerClient();
    // Media upload remains on D1/R2 during Stage 4A. Preserve any Supabase
    // relation that already exists instead of detaching it during a text edit.
    const mediaLinks = await getExistingMediaLinks(supabase, id);
    const nextData = { ...data };
    let slug = versioned.existing.slug;
    if ((collection === 'projects' || collection === 'articles') && typeof nextData.slug === 'string') {
      slug = slugify(nextData.slug);
      nextData.slug = slug;
    }

    const { data: updated, error } = await supabase.rpc('cms_update_record', {
      record_id: id,
      expected_version: versioned.version,
      record_slug: slug,
      record_sort_order: versioned.existing.sortOrder,
      record_status: status,
      record_data: nextData,
      media_links: mediaLinks,
      audit_metadata: {},
    });
    if (error) repositoryFailure('update record', error);
    return mapRecordResult(updated, 'map updated record');
  },

  async setPublication(collection, id, publish, expectedVersion) {
    const versioned = await versionedRecord(collection, id, expectedVersion);
    if (!versioned) return null;
    const supabase = await createSupabaseServerClient();
    const { data: updated, error } = await supabase.rpc('cms_set_publication', {
      record_id: id,
      expected_version: versioned.version,
      publish,
      audit_metadata: {},
    });
    if (error) repositoryFailure('set publication', error);
    return mapRecordResult(updated, 'map publication record');
  },

  async deleteRecord(collection, id, expectedVersion) {
    const versioned = await versionedRecord(collection, id, expectedVersion);
    if (!versioned) return null;
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.rpc('cms_delete_record', {
      record_id: id,
      expected_version: versioned.version,
      audit_metadata: {},
    });
    if (error) repositoryFailure('delete record', error);
    return true;
  },

  async reorderRecords(collection, ids, expectedVersions) {
    if (!ids.length || new Set(ids).size !== ids.length) return false;
    const records = await listRecords({ collection, includeDrafts: true });
    const currentIds = records.map((record) => record.id).sort();
    const requestedIds = [...ids].sort();
    if (
      currentIds.length !== requestedIds.length
      || currentIds.some((id, index) => id !== requestedIds[index])
    ) return false;

    const versions = expectedVersions ?? Object.fromEntries(
      records.map((record) => [record.id, record.version]),
    );
    if (Object.values(versions).some((version) => !Number.isInteger(version) || Number(version) < 1)) {
      throw new CmsRepositoryError('conflict', 'Versi urutan konten tidak lengkap. Muat ulang lalu coba kembali.');
    }

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.rpc('cms_reorder_collection', {
      record_collection: collection,
      ordered_ids: ids,
      expected_versions: versions,
      audit_metadata: {},
    });
    if (error) repositoryFailure('reorder collection', error);
    return true;
  },

  async getRevisions(collection, recordId) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('cms_revisions')
      .select(REVISION_COLUMNS)
      .eq('collection', collection)
      .eq('record_id', recordId)
      .order('created_at', { ascending: false })
      .limit(10);
    if (error) repositoryFailure('list revisions', error);
    try {
      return (data ?? []).map((row) =>
        mapSupabaseCmsRevision(row as unknown as Record<string, unknown>),
      );
    } catch {
      repositoryFailure('map revisions', { code: 'invalid_response' });
    }
  },
} satisfies CmsRepository;
