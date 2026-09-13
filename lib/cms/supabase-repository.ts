import 'server-only';

import { CMS_COLLECTIONS, type CmsCollection, type CmsRecord } from '@/lib/cms/types';
import { processPendingMediaDeletions } from '@/lib/cms/media';
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

type MediaLink = { media_id: string; field_path: string };

function publicStorageObjectKey(value: string) {
  let pathname = value;
  try {
    pathname = new URL(value).pathname;
  } catch {
    return null;
  }

  const marker = '/storage/v1/object/public/portfolio-public/';
  const markerIndex = pathname.indexOf(marker);
  if (markerIndex < 0) return null;
  const encodedKey = pathname.slice(markerIndex + marker.length);
  if (!encodedKey) return null;
  try {
    return encodedKey.split('/').map(decodeURIComponent).join('/');
  } catch {
    return null;
  }
}

function collectMediaFieldPaths(
  value: unknown,
  path = '',
  result = new Map<string, string>(),
) {
  if (typeof value === 'string') {
    const objectKey = publicStorageObjectKey(value);
    if (objectKey && path && path.length <= 240) result.set(objectKey, path);
    return result;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectMediaFieldPaths(item, `${path}[${index}]`, result));
    return result;
  }
  if (value && typeof value === 'object') {
    Object.entries(value as Record<string, unknown>).forEach(([key, item]) => {
      collectMediaFieldPaths(item, path ? `${path}.${key}` : key, result);
    });
  }
  return result;
}

async function resolveMediaLinks(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  data: Record<string, unknown>,
): Promise<MediaLink[]> {
  const fields = collectMediaFieldPaths(data);
  const objectKeys = [...fields.keys()];
  if (!objectKeys.length) return [];

  const { data: media, error } = await supabase
    .from('cms_media')
    .select('id,object_key')
    .eq('bucket', 'portfolio-public')
    .eq('status', 'ready')
    .in('object_key', objectKeys);
  if (error) repositoryFailure('resolve record media links', error);

  const links = (media ?? []).flatMap((item) => {
    const fieldPath = fields.get(String(item.object_key));
    return fieldPath ? [{ media_id: String(item.id), field_path: fieldPath }] : [];
  });
  if (links.length !== objectKeys.length) {
    throw new CmsRepositoryError(
      'invalid',
      'Salah satu media Supabase belum siap digunakan. Unggah ulang media lalu simpan kembali.',
    );
  }
  return links;
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
    const mediaLinks = await resolveMediaLinks(supabase, nextData);

    const { data: created, error } = await supabase.rpc('cms_create_record', {
      record_id: id,
      record_collection: collection,
      record_slug: slug,
      record_sort_order: sortOrder,
      record_status: status,
      record_data: nextData,
      media_links: mediaLinks,
      audit_metadata: {},
    });
    if (error) repositoryFailure('create record', error);
    return mapRecordResult(created, 'map created record');
  },

  async updateRecord(collection, id, data, status, expectedVersion) {
    const versioned = await versionedRecord(collection, id, expectedVersion);
    if (!versioned) return null;
    const supabase = await createSupabaseServerClient();
    const nextData = { ...data };
    let slug = versioned.existing.slug;
    if ((collection === 'projects' || collection === 'articles') && typeof nextData.slug === 'string') {
      slug = slugify(nextData.slug);
      nextData.slug = slug;
    }
    const mediaLinks = await resolveMediaLinks(supabase, nextData);

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
    const record = mapRecordResult(updated, 'map updated record');
    await processPendingMediaDeletions(supabase).catch((cleanupError: unknown) => {
      console.error('[supabase-media] deferred cleanup failed after update', {
        name: cleanupError instanceof Error ? cleanupError.name : 'UnknownError',
      });
    });
    return record;
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
    await processPendingMediaDeletions(supabase).catch((cleanupError: unknown) => {
      console.error('[supabase-media] deferred cleanup failed after delete', {
        name: cleanupError instanceof Error ? cleanupError.name : 'UnknownError',
      });
    });
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
