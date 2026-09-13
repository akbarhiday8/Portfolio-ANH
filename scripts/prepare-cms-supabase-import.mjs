import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const EXPECTED_TOTAL = 33;
const EXPECTED_COLLECTION_COUNTS = {
  articles: 3,
  capabilities: 6,
  certifications: 4,
  education: 2,
  experience: 3,
  profile: 1,
  projects: 4,
  siteContent: 1,
  socials: 5,
  statistics: 4,
};

const backupDirectory = process.argv[2];
if (!backupDirectory) {
  throw new Error('Usage: node scripts/prepare-cms-supabase-import.mjs <production-backup-directory>');
}

const repositoryRoot = process.cwd();
const sourcePath = path.resolve(backupDirectory, 'production-cms-records.json');
const manifestPath = path.resolve(backupDirectory, 'SHA256SUMS.production.json');
const sqlPath = path.join(repositoryRoot, 'supabase', 'imports', '20260913_production_d1_cms_records.sql');
const reportPath = path.join(repositoryRoot, 'docs', 'CMS-MIGRATION-RECONCILIATION-2026-09-13.md');

const sha256 = (value) => createHash('sha256').update(value).digest('hex').toUpperCase();
const fail = (message) => { throw new Error(`Source validation failed: ${message}`); };
const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
const sqlLiteral = (value) => value === null
  ? 'NULL'
  : `'${String(value).replaceAll("'", "''")}'`;
const markdownCell = (value) => String(value ?? 'NULL').replaceAll('|', '\\|').replaceAll('\n', ' ');

const sourceBuffer = await readFile(sourcePath);
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const expectedChecksum = manifest?.files?.['production-cms-records.json']?.sha256?.toUpperCase();
const sourceChecksum = sha256(sourceBuffer);
if (!expectedChecksum || sourceChecksum !== expectedChecksum) fail('SHA-256 checksum does not match the production manifest');

const sourceDocument = JSON.parse(sourceBuffer.toString('utf8'));
const records = sourceDocument.records;
if (!Array.isArray(records) || records.length !== EXPECTED_TOTAL) {
  fail(`expected ${EXPECTED_TOTAL} records, received ${Array.isArray(records) ? records.length : 'non-array data'}`);
}

const requiredFields = [
  'id', 'collection', 'slug', 'sort_order', 'status', 'data_json', 'created_at', 'updated_at',
];
const ids = new Set();
const collectionSlugs = new Set();
const counts = {};
const slugAdjustments = [];
const sourceVersionPresence = new Set();
const sourcePublishedAtPresence = new Set();

const prepared = records.map((record, index) => {
  for (const field of requiredFields) {
    if (!hasOwn(record, field)) fail(`record ${index + 1} is missing ${field}`);
  }
  if (typeof record.id !== 'string' || !record.id.trim()) fail(`record ${index + 1} has an invalid id`);
  if (ids.has(record.id)) fail(`duplicate id: ${record.id}`);
  ids.add(record.id);

  if (!hasOwn(EXPECTED_COLLECTION_COUNTS, record.collection)) fail(`unknown collection: ${record.collection}`);
  counts[record.collection] = (counts[record.collection] ?? 0) + 1;

  if (record.slug !== null && typeof record.slug !== 'string') fail(`invalid slug type for ${record.id}`);
  if (record.slug !== null) {
    const slugKey = `${record.collection}\u0000${record.slug}`;
    if (collectionSlugs.has(slugKey)) fail(`duplicate collection/slug: ${record.collection}/${record.slug}`);
    collectionSlugs.add(slugKey);
  }
  let targetSlug = record.slug;
  if (record.slug !== null && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(record.slug)) {
    if (record.collection === 'siteContent' && record.id === 'siteContent' && record.slug === 'siteContent') {
      targetSlug = null;
      slugAdjustments.push({ id: record.id, source: record.slug, target: null });
    } else {
      fail(`invalid slug for ${record.id}`);
    }
  }
  if (['projects', 'articles'].includes(record.collection) && !targetSlug) fail(`missing detail slug for ${record.id}`);

  if (!Number.isInteger(record.sort_order) || record.sort_order < 0) fail(`invalid sort_order for ${record.id}`);
  if (record.status !== 'published') fail(`record ${record.id} is not published`);

  const dataJsonText = typeof record.data_json === 'string'
    ? record.data_json
    : JSON.stringify(record.data_json);
  let parsedData;
  try {
    parsedData = JSON.parse(dataJsonText);
  } catch {
    fail(`malformed data_json for ${record.id}`);
  }
  if (!parsedData || Array.isArray(parsedData) || typeof parsedData !== 'object') {
    fail(`data_json must be an object for ${record.id}`);
  }
  if (['projects', 'articles'].includes(record.collection) && parsedData.slug !== targetSlug) {
    fail(`data_json.slug does not match record slug for ${record.id}`);
  }

  const createdAt = Date.parse(record.created_at);
  const updatedAt = Date.parse(record.updated_at);
  if (!Number.isFinite(createdAt) || !Number.isFinite(updatedAt)) fail(`invalid timestamp for ${record.id}`);
  if (updatedAt < createdAt) fail(`updated_at precedes created_at for ${record.id}`);

  const hasVersion = hasOwn(record, 'version');
  const hasPublishedAt = hasOwn(record, 'published_at');
  sourceVersionPresence.add(hasVersion);
  sourcePublishedAtPresence.add(hasPublishedAt);
  const version = hasVersion ? record.version : 1;
  const publishedAt = hasPublishedAt ? record.published_at : record.created_at;
  if (!Number.isInteger(version) || version < 1) fail(`invalid version for ${record.id}`);
  if (!publishedAt || !Number.isFinite(Date.parse(publishedAt))) fail(`invalid published_at for ${record.id}`);

  return {
    ...record,
    source_slug: record.slug,
    slug: targetSlug,
    data_json_text: dataJsonText,
    version,
    published_at: publishedAt,
  };
});

if (sourceVersionPresence.size !== 1 || sourcePublishedAtPresence.size !== 1) {
  fail('version or published_at is present on only part of the source records');
}
const sourceHasVersion = sourceVersionPresence.has(true);
const sourceHasPublishedAt = sourcePublishedAtPresence.has(true);

for (const [collection, expectedCount] of Object.entries(EXPECTED_COLLECTION_COUNTS)) {
  if ((counts[collection] ?? 0) !== expectedCount) {
    fail(`collection ${collection} expected ${expectedCount}, received ${counts[collection] ?? 0}`);
  }
  const orders = prepared
    .filter((record) => record.collection === collection)
    .map((record) => record.sort_order)
    .sort((left, right) => left - right);
  if (!orders.every((order, index) => order === index)) fail(`sort_order is not contiguous for ${collection}`);
}

for (const singleton of ['profile', 'siteContent']) {
  const matches = prepared.filter((record) => record.collection === singleton);
  if (matches.length !== 1 || matches[0].id !== singleton) fail(`required singleton ${singleton} is missing or invalid`);
}

const expectedCountsSql = Object.entries(EXPECTED_COLLECTION_COUNTS)
  .map(([collection, count]) => `      (${sqlLiteral(collection)}, ${count})`)
  .join(',\n');
const valuesSql = prepared
  .map((record) => [
    '  (',
    `    ${sqlLiteral(record.id)}, ${sqlLiteral(record.collection)}, ${sqlLiteral(record.slug)},`,
    `    ${record.sort_order}, ${sqlLiteral(record.status)}, ${sqlLiteral(record.data_json_text)},`,
    `    ${record.version}, ${sqlLiteral(record.published_at)}::timestamptz,`,
    `    ${sqlLiteral(record.created_at)}::timestamptz, ${sqlLiteral(record.updated_at)}::timestamptz`,
    '  )',
  ].join('\n'))
  .join(',\n');

const sql = `-- Prepared from the authoritative production D1 backup.
-- Source: production-d1-20260913/production-cms-records.json
-- Source SHA-256: ${sourceChecksum}
-- This is a one-time import artifact, not an automatically applied schema migration.
-- The source has no version or published_at columns. The import initializes version=1
-- and uses created_at as the deterministic published_at for each published record.

begin;

set local lock_timeout = '10s';
set local statement_timeout = '60s';

lock table public.cms_records in exclusive mode;

create temporary table cms_records_import_source (
  id text,
  collection text,
  slug text,
  sort_order integer,
  status text,
  data_json_text text,
  version integer,
  published_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
) on commit drop;

insert into cms_records_import_source (
  id, collection, slug, sort_order, status, data_json_text,
  version, published_at, created_at, updated_at
) values
${valuesSql};

do $$
begin
  if (select count(*) from pg_temp.cms_records_import_source) <> ${EXPECTED_TOTAL} then
    raise exception 'CMS import aborted: expected ${EXPECTED_TOTAL} staged records';
  end if;

  if exists (
    select 1 from pg_temp.cms_records_import_source group by id having count(*) > 1
  ) then
    raise exception 'CMS import aborted: duplicate record ID';
  end if;

  if exists (
    select 1 from pg_temp.cms_records_import_source
    where slug is not null
    group by collection, slug having count(*) > 1
  ) then
    raise exception 'CMS import aborted: duplicate collection/slug';
  end if;

  begin
    perform source.data_json_text::jsonb
    from pg_temp.cms_records_import_source source;
  exception when others then
    raise exception 'CMS import aborted: malformed data_json';
  end;

  if exists (
    select 1 from pg_temp.cms_records_import_source source
    where jsonb_typeof(source.data_json_text::jsonb) is distinct from 'object'
  ) then
    raise exception 'CMS import aborted: data_json must be a JSON object';
  end if;

  if exists (
    select 1 from pg_temp.cms_records_import_source source
    where source.id is null or btrim(source.id) = ''
       or source.collection not in (
         'siteContent', 'profile', 'statistics', 'capabilities', 'education',
         'experience', 'projects', 'certifications', 'articles', 'socials'
       )
       or source.sort_order < 0
       or source.status not in ('draft', 'published')
       or source.version < 1
       or source.created_at is null
       or source.updated_at is null
       or source.updated_at < source.created_at
       or (source.slug is not null and source.slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
       or (source.collection in ('projects', 'articles') and source.slug is null)
       or (source.status = 'draft' and source.published_at is not null)
       or (source.status = 'published' and source.published_at is null)
  ) then
    raise exception 'CMS import aborted: invalid staged record state';
  end if;

  if exists (
    select 1 from pg_temp.cms_records_import_source source
    where source.collection in ('projects', 'articles')
      and nullif(btrim(source.data_json_text::jsonb ->> 'slug'), '') is distinct from source.slug
  ) then
    raise exception 'CMS import aborted: detail slug does not match data_json.slug';
  end if;

  if (select count(*) from pg_temp.cms_records_import_source where collection = 'profile') <> 1
     or (select count(*) from pg_temp.cms_records_import_source where collection = 'profile' and id = 'profile') <> 1
     or (select count(*) from pg_temp.cms_records_import_source where collection = 'siteContent') <> 1
     or (select count(*) from pg_temp.cms_records_import_source where collection = 'siteContent' and id = 'siteContent') <> 1 then
    raise exception 'CMS import aborted: required singleton profile/siteContent is missing or invalid';
  end if;

  if exists (
    with expected(collection, expected_count) as (
      values
${expectedCountsSql}
    ), actual as (
      select collection, count(*)::integer as actual_count
      from pg_temp.cms_records_import_source group by collection
    )
    select 1 from expected full join actual using (collection)
    where expected.expected_count is distinct from actual.actual_count
  ) then
    raise exception 'CMS import aborted: collection counts do not match the production checkpoint';
  end if;

  if exists (select 1 from public.cms_records) then
    raise exception 'CMS import aborted: target cms_records must be empty';
  end if;
end;
$$;

insert into public.cms_records (
  id, collection, slug, sort_order, status, data_json,
  version, published_at, created_at, updated_at
)
select
  source.id,
  source.collection,
  source.slug,
  source.sort_order,
  source.status,
  source.data_json_text::jsonb,
  source.version,
  source.published_at,
  source.created_at,
  source.updated_at
from pg_temp.cms_records_import_source source
order by source.collection, source.sort_order, source.id;

do $$
begin
  if (select count(*) from public.cms_records) <> ${EXPECTED_TOTAL} then
    raise exception 'CMS import reconciliation failed: target count is not ${EXPECTED_TOTAL}';
  end if;

  if exists (
    select 1
    from (
      (
        select id, collection, slug, sort_order, status, data_json_text::jsonb as data_json,
          version, published_at, created_at, updated_at
        from pg_temp.cms_records_import_source
        except all
        select id, collection, slug, sort_order, status, data_json,
          version, published_at, created_at, updated_at
        from public.cms_records
      )
      union all
      (
        select id, collection, slug, sort_order, status, data_json,
          version, published_at, created_at, updated_at
        from public.cms_records
        except all
        select id, collection, slug, sort_order, status, data_json_text::jsonb,
          version, published_at, created_at, updated_at
        from pg_temp.cms_records_import_source
      )
    ) mismatch
  ) then
    raise exception 'CMS import reconciliation failed: staged and target values differ';
  end if;
end;
$$;

commit;
`;

const preservedProjection = (record) => ({
  id: record.id,
  collection: record.collection,
  slug: record.source_slug,
  sort_order: record.sort_order,
  status: record.status,
  data_json: record.data_json_text,
  created_at: record.created_at,
  updated_at: record.updated_at,
});
const sourceProjectionChecksum = sha256(JSON.stringify(records.map((record) => preservedProjection({
  ...record,
  source_slug: record.slug,
  data_json_text: typeof record.data_json === 'string' ? record.data_json : JSON.stringify(record.data_json),
}))));
const preparedProjectionChecksum = sha256(JSON.stringify(prepared.map(preservedProjection)));
const sqlChecksum = sha256(sql);

const collectionRows = Object.entries(EXPECTED_COLLECTION_COUNTS)
  .map(([collection, expected]) => `| ${collection} | ${counts[collection]} | ${expected} | PASS |`)
  .join('\n');
const recordRows = [...prepared]
  .sort((left, right) => left.collection.localeCompare(right.collection)
    || left.sort_order - right.sort_order
    || left.id.localeCompare(right.id))
  .map((record) => `| ${markdownCell(record.collection)} | ${markdownCell(record.id)} | ${markdownCell(record.source_slug)} | ${markdownCell(record.slug)} | ${record.sort_order} | ${record.version} | ${markdownCell(record.published_at)} | ${markdownCell(record.created_at)} | ${markdownCell(record.updated_at)} |`)
  .join('\n');

const report = `# Rekonsiliasi Migrasi CMS Produksi D1 ke Supabase

Status: **PASS — artefak siap, belum dieksekusi ke Supabase remote.**

## Sumber otoritatif

- Direktori: \`${path.resolve(backupDirectory)}\`
- File record: \`production-cms-records.json\`
- SHA-256 sumber: \`${sourceChecksum}\`
- SHA-256 pada manifest: \`${expectedChecksum}\`
- Checksum cocok: **ya**
- Local D1 digunakan sebagai sumber: **tidak**

## Validasi sumber

- Jumlah record: **${prepared.length}/${EXPECTED_TOTAL}**
- Status record: **33 published**
- ID duplikat: **0**
- Pasangan collection/slug duplikat: **0**
- JSON malformed: **0**
- JSON bukan object: **0**
- Timestamp invalid: **0**
- Urutan setiap koleksi kontinu mulai dari 0: **ya**
- Singleton \`profile\`: **1, ID sesuai**
- Singleton \`siteContent\`: **1, ID sesuai**

## Jumlah per koleksi

| Koleksi | Sumber | Artefak | Hasil |
| --- | ---: | ---: | --- |
${collectionRows}

## Pemetaan nilai

| Nilai | Sumber D1 | Artefak Supabase |
| --- | --- | --- |
| id, collection, sort_order, status | Tersedia | Dipertahankan persis |
| slug | Tersedia | ${slugAdjustments.length === 0 ? 'Dipertahankan persis' : `${prepared.length - slugAdjustments.length} dipertahankan; slug singleton siteContent dipetakan ke NULL agar memenuhi constraint lowercase Supabase`} |
| data_json | Tersedia sebagai teks JSON valid | Nilai semantik dipertahankan sebagai JSONB |
| created_at, updated_at | Tersedia | Dipertahankan persis |
| version | ${sourceHasVersion ? 'Tersedia' : 'Tidak tersedia pada schema/export D1'} | ${sourceHasVersion ? 'Dipertahankan persis' : 'Diinisialisasi menjadi 1'} |
| published_at | ${sourceHasPublishedAt ? 'Tersedia' : 'Tidak tersedia pada schema/export D1'} | ${sourceHasPublishedAt ? 'Dipertahankan persis' : 'Ditentukan dari created_at karena seluruh record published'} |

Checksum proyeksi field yang dipertahankan:

- Sumber: \`${sourceProjectionChecksum}\`
- Artefak: \`${preparedProjectionChecksum}\`
- Cocok: **${sourceProjectionChecksum === preparedProjectionChecksum ? 'ya' : 'tidak'}**

## Indeks rekonsiliasi record

| Koleksi | ID | Slug sumber | Slug target | Urutan | Versi target | Published at target | Created at | Updated at |
| --- | --- | --- | --- | ---: | ---: | --- | --- | --- |
${recordRows}

## Keamanan eksekusi SQL

Artefak SQL menggunakan satu transaksi, mengunci \`cms_records\` selama impor,
mensyaratkan target kosong, memvalidasi count/koleksi/ID/slug/JSON/singleton/
status/timestamp/urutan, dan melakukan perbandingan dua arah dengan \`EXCEPT ALL\`
sebelum \`COMMIT\`. Setiap kegagalan membatalkan seluruh transaksi.

- SQL: \`supabase/imports/20260913_production_d1_cms_records.sql\`
- SHA-256 SQL: \`${sqlChecksum}\`
- R2/media dimigrasikan: **tidak**
- Eksekusi remote dilakukan: **tidak**
`;

await mkdir(path.dirname(sqlPath), { recursive: true });
await writeFile(sqlPath, sql, 'utf8');
await writeFile(reportPath, report, 'utf8');

console.log(JSON.stringify({
  sourcePath,
  sourceChecksum,
  recordCount: prepared.length,
  collectionCounts: counts,
  requiredSingletons: ['profile', 'siteContent'],
  sourceHasVersion,
  sourceHasPublishedAt,
  sqlPath,
  sqlChecksum,
  reportPath,
}, null, 2));
