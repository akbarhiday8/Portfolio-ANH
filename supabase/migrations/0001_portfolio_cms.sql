-- Final Stage 1 schema for the future Vercel + Supabase runtime.
-- Apply first to an empty Supabase project. The current Cloudflare runtime
-- remains unchanged and does not use this migration yet.

create extension if not exists pgcrypto;

create table public.cms_admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (length(btrim(display_name)) between 1 and 120),
  created_at timestamptz not null default now()
);
create unique index cms_admin_users_single_account
  on public.cms_admin_users ((true));

create table public.cms_records (
  id text primary key check (length(btrim(id)) between 1 and 160),
  collection text not null check (collection in (
    'siteContent', 'profile', 'statistics', 'capabilities', 'education',
    'experience', 'projects', 'certifications', 'articles', 'socials'
  )),
  slug text,
  sort_order integer not null default 0 check (sort_order >= 0),
  status text not null default 'draft' check (status in ('draft', 'published')),
  data_json jsonb not null default '{}'::jsonb check (jsonb_typeof(data_json) = 'object'),
  version integer not null default 1 check (version >= 1),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cms_records_slug_format check (
    slug is null or slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  constraint cms_records_detail_slug_required check (
    collection not in ('projects', 'articles') or slug is not null
  ),
  constraint cms_records_singleton_id check (
    collection not in ('profile', 'siteContent') or id = collection
  ),
  constraint cms_records_publication_timestamp check (
    (status = 'draft' and published_at is null)
    or (status = 'published' and published_at is not null)
  )
);

create unique index cms_records_collection_slug_unique
  on public.cms_records (collection, slug) where slug is not null;
create unique index cms_records_singleton_unique
  on public.cms_records (collection) where collection in ('profile', 'siteContent');
create index cms_records_public_lookup
  on public.cms_records (collection, sort_order, id) where status = 'published';
create index cms_records_admin_lookup
  on public.cms_records (collection, sort_order, updated_at desc);

create table public.cms_revisions (
  id uuid primary key default gen_random_uuid(),
  record_id text not null references public.cms_records(id) on delete cascade,
  collection text not null check (collection in (
    'siteContent', 'profile', 'statistics', 'capabilities', 'education',
    'experience', 'projects', 'certifications', 'articles', 'socials'
  )),
  slug text,
  sort_order integer not null,
  data_json jsonb not null check (jsonb_typeof(data_json) = 'object'),
  status text not null check (status in ('draft', 'published')),
  version integer not null check (version >= 1),
  published_at timestamptz,
  actor_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (record_id, version),
  constraint cms_revisions_publication_timestamp check (
    (status = 'draft' and published_at is null)
    or (status = 'published' and published_at is not null)
  )
);
create index cms_revisions_record_history
  on public.cms_revisions (record_id, created_at desc, id desc);

create table public.cms_audit_log (
  id uuid primary key default gen_random_uuid(),
  action text not null check (action in (
    'create', 'update', 'publish', 'unpublish', 'delete', 'reorder',
    'media_stage', 'media_ready', 'media_attach', 'media_detach',
    'media_queue', 'media_deleted', 'media_delete_failed'
  )),
  record_id text,
  collection text check (collection is null or collection in (
    'siteContent', 'profile', 'statistics', 'capabilities', 'education',
    'experience', 'projects', 'certifications', 'articles', 'socials'
  )),
  actor_user_id uuid references auth.users(id) on delete set null,
  title text,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now()
);
create index cms_audit_log_created_at on public.cms_audit_log (created_at desc, id desc);
create index cms_audit_log_record
  on public.cms_audit_log (record_id, created_at desc) where record_id is not null;

create table public.cms_media (
  id uuid primary key default gen_random_uuid(),
  bucket text not null check (bucket in ('portfolio-public', 'portfolio-staging')),
  object_key text not null check (
    length(object_key) between 1 and 512
    and object_key !~ '(^|/)\.\.(/|$)'
    and object_key !~ '^/'
    and object_key !~ '[\\]'
  ),
  original_name text not null check (length(btrim(original_name)) between 1 and 255),
  mime_type text not null check (length(btrim(mime_type)) between 1 and 150),
  original_size bigint not null check (original_size >= 0),
  optimized_size bigint not null check (optimized_size >= 0),
  width integer check (width is null or width > 0),
  height integer check (height is null or height > 0),
  checksum_sha256 text not null check (checksum_sha256 ~ '^[0-9a-f]{64}$'),
  status text not null default 'staged' check (status in ('staged', 'ready', 'pending_delete')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (bucket, object_key),
  constraint cms_media_status_location check (
    (status = 'staged' and bucket = 'portfolio-staging')
    or status in ('ready', 'pending_delete')
  )
);
create unique index cms_media_bucket_checksum_unique
  on public.cms_media (bucket, checksum_sha256) where status <> 'pending_delete';
create index cms_media_duplicate_lookup
  on public.cms_media (checksum_sha256, mime_type, optimized_size)
  where status <> 'pending_delete';
create index cms_media_status_age on public.cms_media (status, created_at);

create table public.cms_record_media (
  record_id text not null references public.cms_records(id) on delete cascade,
  media_id uuid not null references public.cms_media(id) on delete restrict,
  field_path text not null check (
    length(field_path) between 1 and 240
    and field_path ~ '^[A-Za-z0-9_.\[\]-]+$'
  ),
  created_at timestamptz not null default now(),
  primary key (record_id, media_id, field_path),
  unique (record_id, field_path)
);
create index cms_record_media_media_lookup on public.cms_record_media (media_id, record_id);

create table public.cms_media_deletion_queue (
  id bigint generated always as identity primary key,
  media_id uuid references public.cms_media(id) on delete set null,
  bucket text not null check (bucket in ('portfolio-public', 'portfolio-staging')),
  object_key text not null check (
    length(object_key) between 1 and 512
    and object_key !~ '(^|/)\.\.(/|$)'
    and object_key !~ '^/'
    and object_key !~ '[\\]'
  ),
  attempts integer not null default 0 check (attempts >= 0),
  available_at timestamptz not null default now(),
  locked_at timestamptz,
  processed_at timestamptz,
  last_error text,
  created_at timestamptz not null default now()
);
create unique index cms_media_deletion_queue_active_object
  on public.cms_media_deletion_queue (bucket, object_key) where processed_at is null;
create index cms_media_deletion_queue_claim
  on public.cms_media_deletion_queue (available_at, id)
  where processed_at is null and locked_at is null;

create table public.cms_auth_attempts (
  attempt_key text primary key check (attempt_key ~ '^[0-9a-f]{64}$'),
  attempts integer not null default 0 check (attempts >= 0),
  window_started timestamptz not null default now(),
  last_attempt_at timestamptz not null default now(),
  blocked_until timestamptz,
  expires_at timestamptz not null default (now() + interval '24 hours')
);
create index cms_auth_attempts_cleanup on public.cms_auth_attempts (expires_at);
create index cms_auth_attempts_blocked
  on public.cms_auth_attempts (blocked_until) where blocked_until is not null;

create or replace function public.cms_set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
create trigger cms_records_set_updated_at before update on public.cms_records
for each row execute function public.cms_set_updated_at();
create trigger cms_media_set_updated_at before update on public.cms_media
for each row execute function public.cms_set_updated_at();

create or replace function public.cms_is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and exists (
    select 1 from public.cms_admin_users admin_user
    where admin_user.user_id = auth.uid()
  );
$$;

create or replace function public.cms_assert_admin()
returns uuid language plpgsql stable security definer set search_path = '' as $$
declare actor_id uuid := auth.uid();
begin
  if actor_id is null or not public.cms_is_admin() then
    raise exception using errcode = '42501', message = 'CMS administrator access required';
  end if;
  return actor_id;
end;
$$;

create or replace function public.cms_record_title(record_data jsonb, fallback text)
returns text language sql immutable set search_path = '' as $$
  select coalesce(
    nullif(btrim(record_data ->> 'title'), ''),
    nullif(btrim(record_data ->> 'name'), ''),
    nullif(btrim(record_data ->> 'role'), ''),
    nullif(btrim(record_data ->> 'label'), ''),
    nullif(btrim(record_data ->> 'value'), ''), fallback
  );
$$;

create or replace function public.cms_validate_record(
  record_collection text, record_status text, record_data jsonb
)
returns void language plpgsql immutable set search_path = '' as $$
declare
  required_keys text[] := array[]::text[];
  list_key text;
  key_name text;
begin
  if record_collection not in (
    'siteContent', 'profile', 'statistics', 'capabilities', 'education',
    'experience', 'projects', 'certifications', 'articles', 'socials'
  ) then
    raise exception using errcode = '23514', message = 'Invalid CMS collection';
  end if;
  if record_status not in ('draft', 'published') then
    raise exception using errcode = '23514', message = 'Invalid CMS status';
  end if;
  if jsonb_typeof(record_data) is distinct from 'object' then
    raise exception using errcode = '23514', message = 'CMS data_json must be an object';
  end if;
  if record_status = 'draft' then return; end if;

  required_keys := case record_collection
    when 'siteContent' then array['brandSubtitle']
    when 'profile' then array['name', 'monogram', 'introduction', 'artwork']
    when 'statistics' then array['value', 'label']
    when 'capabilities' then array['title', 'description']
    when 'education' then array['period', 'title', 'description']
    when 'experience' then array['role', 'period', 'description', 'image']
    when 'projects' then array['slug', 'title', 'category', 'summary', 'image', 'role', 'discipline', 'artifactType', 'challenge', 'approach', 'outcome']
    when 'certifications' then array['name', 'issuer', 'image', 'description']
    when 'articles' then array['slug', 'title', 'excerpt', 'lead', 'closing']
    when 'socials' then array['label', 'href']
    else array[]::text[]
  end;
  foreach key_name in array required_keys loop
    if jsonb_typeof(record_data -> key_name) is distinct from 'string'
       or length(btrim(record_data ->> key_name)) = 0 then
      raise exception using errcode = '23514',
        message = format('Required field is missing: %s', key_name);
    end if;
  end loop;

  list_key := case record_collection
    when 'experience' then 'responsibilities'
    when 'projects' then 'scope'
    when 'certifications' then 'topics'
    when 'articles' then 'sections'
    else null
  end;
  if list_key is not null and (
    jsonb_typeof(record_data -> list_key) is distinct from 'array'
    or jsonb_array_length(record_data -> list_key) = 0
  ) then
    raise exception using errcode = '23514',
      message = format('Required list is empty: %s', list_key);
  end if;
  if record_collection = 'projects' and (
    jsonb_typeof(record_data -> 'process') is distinct from 'array'
    or jsonb_array_length(record_data -> 'process') = 0
  ) then
    raise exception using errcode = '23514', message = 'Required list is empty: process';
  end if;
end;
$$;

create or replace function public.cms_insert_revision(
  old_record public.cms_records, actor_id uuid
)
returns void language plpgsql security definer set search_path = '' as $$
begin
  insert into public.cms_revisions (
    record_id, collection, slug, sort_order, data_json, status,
    version, published_at, actor_user_id
  ) values (
    old_record.id, old_record.collection, old_record.slug, old_record.sort_order,
    old_record.data_json, old_record.status, old_record.version,
    old_record.published_at, actor_id
  );
  delete from public.cms_revisions revision where revision.id in (
    select older.id from public.cms_revisions older
    where older.record_id = old_record.id
    order by older.created_at desc, older.id desc offset 10
  );
end;
$$;

create or replace function public.cms_queue_orphan_media(media_ids uuid[])
returns void language plpgsql security definer set search_path = '' as $$
declare
  media_id_value uuid;
  media_row public.cms_media%rowtype;
begin
  foreach media_id_value in array coalesce(media_ids, array[]::uuid[]) loop
    if not exists (
      select 1 from public.cms_record_media link where link.media_id = media_id_value
    ) then
      update public.cms_media media set status = 'pending_delete'
      where media.id = media_id_value returning media.* into media_row;
      if found then
        insert into public.cms_media_deletion_queue (media_id, bucket, object_key)
        values (media_row.id, media_row.bucket, media_row.object_key)
        on conflict (bucket, object_key) where processed_at is null do nothing;

        insert into public.cms_audit_log (
          action, actor_user_id, title, metadata
        ) values (
          'media_queue', auth.uid(), media_row.original_name,
          jsonb_build_object(
            'media_id', media_row.id,
            'bucket', media_row.bucket,
            'object_key', media_row.object_key
          )
        );
      end if;
    end if;
  end loop;
end;
$$;

create or replace function public.cms_sync_record_media(
  target_record_id text, media_links jsonb, require_public_ready boolean
)
returns void language plpgsql security definer set search_path = '' as $$
declare
  old_media_ids uuid[];
  requested_count integer;
  valid_count integer;
begin
  if jsonb_typeof(media_links) is distinct from 'array' then
    raise exception using errcode = '23514', message = 'Media links must be a JSON array';
  end if;
  if exists (
    select 1 from jsonb_array_elements(media_links) item
    where jsonb_typeof(item) is distinct from 'object'
      or coalesce(item ->> 'media_id', '') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
      or coalesce(item ->> 'field_path', '') !~ '^[A-Za-z0-9_.\[\]-]+$'
  ) then
    raise exception using errcode = '23514', message = 'Invalid media link payload';
  end if;
  requested_count := jsonb_array_length(media_links);
  select count(*) into valid_count
  from jsonb_array_elements(media_links) item
  join public.cms_media media on media.id = (item ->> 'media_id')::uuid
  where media.status <> 'pending_delete'
    and (not require_public_ready
      or (media.bucket = 'portfolio-public' and media.status = 'ready'));
  if valid_count <> requested_count then
    raise exception using errcode = '23514',
      message = 'Media link is missing, pending deletion, or not public-ready';
  end if;
  if (select count(*) from (
    select distinct item ->> 'field_path'
    from jsonb_array_elements(media_links) item
  ) unique_paths) <> requested_count then
    raise exception using errcode = '23505', message = 'Duplicate media field_path';
  end if;

  select array_agg(distinct link.media_id) into old_media_ids
  from public.cms_record_media link where link.record_id = target_record_id;
  delete from public.cms_record_media link where link.record_id = target_record_id;
  insert into public.cms_record_media (record_id, media_id, field_path)
  select target_record_id, (item ->> 'media_id')::uuid, item ->> 'field_path'
  from jsonb_array_elements(media_links) item;
  perform public.cms_queue_orphan_media(old_media_ids);
end;
$$;

create or replace function public.cms_create_record(
  record_id text, record_collection text, record_slug text,
  record_sort_order integer, record_status text, record_data jsonb,
  media_links jsonb, audit_metadata jsonb
)
returns public.cms_records language plpgsql security definer set search_path = '' as $$
declare
  actor_id uuid := public.cms_assert_admin();
  created_record public.cms_records%rowtype;
begin
  perform public.cms_validate_record(record_collection, record_status, record_data);
  if record_collection in ('projects', 'articles')
     and record_slug is distinct from nullif(btrim(record_data ->> 'slug'), '') then
    raise exception using errcode = '23514',
      message = 'Record slug must match data_json.slug';
  end if;
  insert into public.cms_records (
    id, collection, slug, sort_order, status, data_json, version, published_at
  ) values (
    record_id, record_collection, record_slug, record_sort_order,
    record_status, record_data, 1,
    case when record_status = 'published' then now() else null end
  ) returning * into created_record;
  perform public.cms_sync_record_media(
    created_record.id, coalesce(media_links, '[]'::jsonb),
    created_record.status = 'published'
  );
  insert into public.cms_audit_log (
    action, record_id, collection, actor_user_id, title, metadata
  ) values (
    'create', created_record.id, created_record.collection, actor_id,
    public.cms_record_title(created_record.data_json, created_record.id),
    coalesce(audit_metadata, '{}'::jsonb)
  );
  return created_record;
end;
$$;

create or replace function public.cms_update_record(
  record_id text, expected_version integer, record_slug text,
  record_sort_order integer, record_status text, record_data jsonb,
  media_links jsonb, audit_metadata jsonb
)
returns public.cms_records language plpgsql security definer set search_path = '' as $$
declare
  actor_id uuid := public.cms_assert_admin();
  old_record public.cms_records%rowtype;
  updated_record public.cms_records%rowtype;
  audit_action text := 'update';
begin
  select * into old_record from public.cms_records record
  where record.id = record_id for update;
  if not found then
    raise exception using errcode = 'P0002', message = 'CMS record not found';
  end if;
  if old_record.version <> expected_version then
    raise exception using errcode = '40001', message = 'CMS record version conflict';
  end if;
  perform public.cms_validate_record(old_record.collection, record_status, record_data);
  if old_record.collection in ('projects', 'articles')
     and record_slug is distinct from nullif(btrim(record_data ->> 'slug'), '') then
    raise exception using errcode = '23514',
      message = 'Record slug must match data_json.slug';
  end if;
  perform public.cms_insert_revision(old_record, actor_id);
  if old_record.status = 'draft' and record_status = 'published' then
    audit_action := 'publish';
  elsif old_record.status = 'published' and record_status = 'draft' then
    audit_action := 'unpublish';
  end if;
  update public.cms_records record set
    slug = record_slug, sort_order = record_sort_order, status = record_status,
    data_json = record_data, version = old_record.version + 1,
    published_at = case
      when record_status = 'draft' then null
      when old_record.published_at is not null then old_record.published_at
      else now()
    end
  where record.id = record_id returning * into updated_record;
  perform public.cms_sync_record_media(
    updated_record.id, coalesce(media_links, '[]'::jsonb),
    updated_record.status = 'published'
  );
  insert into public.cms_audit_log (
    action, record_id, collection, actor_user_id, title, metadata
  ) values (
    audit_action, updated_record.id, updated_record.collection, actor_id,
    public.cms_record_title(updated_record.data_json, updated_record.id),
    coalesce(audit_metadata, '{}'::jsonb)
  );
  return updated_record;
end;
$$;

create or replace function public.cms_set_publication(
  record_id text, expected_version integer, publish boolean, audit_metadata jsonb
)
returns public.cms_records language plpgsql security definer set search_path = '' as $$
declare
  actor_id uuid := public.cms_assert_admin();
  old_record public.cms_records%rowtype;
  updated_record public.cms_records%rowtype;
  next_status text := case when publish then 'published' else 'draft' end;
begin
  select * into old_record from public.cms_records record
  where record.id = record_id for update;
  if not found then
    raise exception using errcode = 'P0002', message = 'CMS record not found';
  end if;
  if old_record.version <> expected_version then
    raise exception using errcode = '40001', message = 'CMS record version conflict';
  end if;
  if old_record.status = next_status then return old_record; end if;
  perform public.cms_validate_record(old_record.collection, next_status, old_record.data_json);
  if publish and exists (
    select 1 from public.cms_record_media link
    join public.cms_media media on media.id = link.media_id
    where link.record_id = old_record.id
      and (media.bucket <> 'portfolio-public' or media.status <> 'ready')
  ) then
    raise exception using errcode = '23514',
      message = 'Published records may reference only public-ready media';
  end if;
  perform public.cms_insert_revision(old_record, actor_id);
  update public.cms_records record set
    status = next_status, version = old_record.version + 1,
    published_at = case when publish then coalesce(old_record.published_at, now()) else null end
  where record.id = record_id returning * into updated_record;
  insert into public.cms_audit_log (
    action, record_id, collection, actor_user_id, title, metadata
  ) values (
    case when publish then 'publish' else 'unpublish' end,
    updated_record.id, updated_record.collection, actor_id,
    public.cms_record_title(updated_record.data_json, updated_record.id),
    coalesce(audit_metadata, '{}'::jsonb)
  );
  return updated_record;
end;
$$;

create or replace function public.cms_delete_record(
  record_id text, expected_version integer, audit_metadata jsonb
)
returns void language plpgsql security definer set search_path = '' as $$
declare
  actor_id uuid := public.cms_assert_admin();
  old_record public.cms_records%rowtype;
  detached_media_ids uuid[];
  detached_media_links jsonb := '[]'::jsonb;
begin
  select * into old_record from public.cms_records record
  where record.id = record_id for update;
  if not found then
    raise exception using errcode = 'P0002', message = 'CMS record not found';
  end if;
  if old_record.collection in ('profile', 'siteContent') then
    raise exception using errcode = '23514', message = 'Singleton CMS records cannot be deleted';
  end if;
  if old_record.version <> expected_version then
    raise exception using errcode = '40001', message = 'CMS record version conflict';
  end if;
  select array_agg(distinct link.media_id) into detached_media_ids
  from public.cms_record_media link where link.record_id = old_record.id;
  select coalesce(
    jsonb_agg(
      jsonb_build_object('media_id', link.media_id, 'field_path', link.field_path)
      order by link.field_path
    ),
    '[]'::jsonb
  ) into detached_media_links
  from public.cms_record_media link where link.record_id = old_record.id;
  delete from public.cms_records record where record.id = old_record.id;
  perform public.cms_queue_orphan_media(detached_media_ids);
  insert into public.cms_audit_log (
    action, record_id, collection, actor_user_id, title, metadata
  ) values (
    'delete', old_record.id, old_record.collection, actor_id,
    public.cms_record_title(old_record.data_json, old_record.id),
    coalesce(audit_metadata, '{}'::jsonb) || jsonb_build_object(
      'deleted_version', old_record.version,
      'deleted_status', old_record.status,
      'deleted_snapshot', jsonb_build_object(
        'id', old_record.id,
        'collection', old_record.collection,
        'slug', old_record.slug,
        'sort_order', old_record.sort_order,
        'status', old_record.status,
        'data_json', old_record.data_json,
        'version', old_record.version,
        'published_at', old_record.published_at,
        'created_at', old_record.created_at,
        'updated_at', old_record.updated_at,
        'media_links', detached_media_links
      )
    )
  );
end;
$$;

create or replace function public.cms_reorder_collection(
  record_collection text, ordered_ids text[], expected_versions jsonb,
  audit_metadata jsonb
)
returns setof public.cms_records language plpgsql security definer set search_path = '' as $$
declare
  actor_id uuid := public.cms_assert_admin();
  item record;
  old_record public.cms_records%rowtype;
  collection_count integer;
begin
  if record_collection in ('profile', 'siteContent') then
    raise exception using errcode = '23514', message = 'Singleton collections cannot be reordered';
  end if;
  if ordered_ids is null or jsonb_typeof(expected_versions) is distinct from 'object' then
    raise exception using errcode = '23514',
      message = 'Ordered IDs and expected versions are required';
  end if;
  if cardinality(ordered_ids) <> (
    select count(distinct ordered.value)
    from unnest(ordered_ids) as ordered(value)
  ) then
    raise exception using errcode = '23505', message = 'Duplicate record ID in reorder request';
  end if;
  perform 1 from public.cms_records record
  where record.collection = record_collection order by record.id for update;
  select count(*) into collection_count from public.cms_records record
  where record.collection = record_collection;
  if collection_count <> cardinality(ordered_ids) or exists (
    select record.id from public.cms_records record
    where record.collection = record_collection
    except
    select ordered.value from unnest(ordered_ids) as ordered(value)
  ) then
    raise exception using errcode = '23514',
      message = 'Reorder request must include the complete collection exactly once';
  end if;
  for item in
    select ordered.id, (ordered.position - 1)::integer as position
    from unnest(ordered_ids) with ordinality as ordered(id, position)
  loop
    select * into old_record from public.cms_records record
    where record.id = item.id and record.collection = record_collection;
    if not (expected_versions ? old_record.id)
       or old_record.version <> (expected_versions ->> old_record.id)::integer then
      raise exception using errcode = '40001',
        message = format('CMS record version conflict: %s', old_record.id);
    end if;
    perform public.cms_insert_revision(old_record, actor_id);
    update public.cms_records record
    set sort_order = item.position, version = old_record.version + 1
    where record.id = old_record.id;
  end loop;
  insert into public.cms_audit_log (
    action, collection, actor_user_id, title, metadata
  ) values (
    'reorder', record_collection, actor_id, record_collection,
    coalesce(audit_metadata, '{}'::jsonb) || jsonb_build_object('ordered_ids', ordered_ids)
  );
  return query select record.* from public.cms_records record
  where record.collection = record_collection order by record.sort_order, record.id;
end;
$$;

create or replace function public.cms_register_staged_media(
  media_object_key text, media_original_name text, media_mime_type text,
  media_original_size bigint, media_optimized_size bigint,
  media_width integer, media_height integer, media_checksum_sha256 text
)
returns public.cms_media language plpgsql security definer set search_path = '' as $$
declare
  actor_id uuid := public.cms_assert_admin();
  existing_media public.cms_media%rowtype;
  created_media public.cms_media%rowtype;
begin
  if split_part(media_object_key, '/', 1) <> actor_id::text then
    raise exception using errcode = '23514',
      message = 'Staging object key must start with the administrator user ID';
  end if;
  select * into existing_media from public.cms_media media
  where media.bucket = 'portfolio-staging'
    and media.checksum_sha256 = lower(media_checksum_sha256)
    and media.status <> 'pending_delete' limit 1;
  if found then return existing_media; end if;
  insert into public.cms_media (
    bucket, object_key, original_name, mime_type, original_size,
    optimized_size, width, height, checksum_sha256, status
  ) values (
    'portfolio-staging', media_object_key, media_original_name,
    media_mime_type, media_original_size, media_optimized_size,
    media_width, media_height, lower(media_checksum_sha256), 'staged'
  ) returning * into created_media;
  insert into public.cms_audit_log (action, actor_user_id, title, metadata)
  values (
    'media_stage', actor_id, media_original_name,
    jsonb_build_object('media_id', created_media.id, 'object_key', created_media.object_key)
  );
  return created_media;
end;
$$;

create or replace function public.cms_mark_media_ready(
  media_id_value uuid, public_object_key text
)
returns public.cms_media language plpgsql security definer set search_path = '' as $$
declare
  actor_id uuid := public.cms_assert_admin();
  old_media public.cms_media%rowtype;
  ready_media public.cms_media%rowtype;
begin
  select * into old_media from public.cms_media media
  where media.id = media_id_value for update;
  if not found
     or old_media.bucket <> 'portfolio-staging'
     or old_media.status <> 'staged' then
    raise exception using errcode = 'P0002', message = 'Staged media not found';
  end if;
  insert into public.cms_media_deletion_queue (media_id, bucket, object_key)
  values (old_media.id, old_media.bucket, old_media.object_key)
  on conflict (bucket, object_key) where processed_at is null do nothing;
  update public.cms_media media
  set bucket = 'portfolio-public', object_key = public_object_key, status = 'ready'
  where media.id = old_media.id returning * into ready_media;
  insert into public.cms_audit_log (action, actor_user_id, title, metadata)
  values (
    'media_ready', actor_id, ready_media.original_name,
    jsonb_build_object('media_id', ready_media.id, 'object_key', ready_media.object_key)
  );
  return ready_media;
end;
$$;

create or replace function public.cms_claim_media_deletion_batch(batch_size integer default 20)
returns setof public.cms_media_deletion_queue
language plpgsql security definer set search_path = '' as $$
begin
  if batch_size < 1 or batch_size > 100 then
    raise exception using errcode = '22023', message = 'Batch size must be between 1 and 100';
  end if;
  return query
  with candidates as (
    select queue.id from public.cms_media_deletion_queue queue
    where queue.processed_at is null and queue.available_at <= now()
      and (queue.locked_at is null or queue.locked_at < now() - interval '10 minutes')
    order by queue.available_at, queue.id for update skip locked limit batch_size
  )
  update public.cms_media_deletion_queue queue
  set locked_at = now(), attempts = queue.attempts + 1
  from candidates where queue.id = candidates.id returning queue.*;
end;
$$;

create or replace function public.cms_complete_media_deletion(
  queue_id bigint, succeeded boolean, error_message text default null
)
returns void language plpgsql security definer set search_path = '' as $$
declare queue_row public.cms_media_deletion_queue%rowtype;
begin
  select * into queue_row from public.cms_media_deletion_queue queue
  where queue.id = queue_id for update;
  if not found then
    raise exception using errcode = 'P0002', message = 'Media deletion queue item not found';
  end if;
  if succeeded then
    update public.cms_media_deletion_queue queue
    set processed_at = now(), locked_at = null, last_error = null
    where queue.id = queue_row.id;
    delete from public.cms_media media
    where media.id = queue_row.media_id and media.bucket = queue_row.bucket
      and media.object_key = queue_row.object_key and media.status = 'pending_delete'
      and not exists (
        select 1 from public.cms_record_media link where link.media_id = media.id
      );
    insert into public.cms_audit_log (action, title, metadata)
    values ('media_deleted', queue_row.object_key, jsonb_build_object('queue_id', queue_row.id));
  else
    update public.cms_media_deletion_queue queue set
      locked_at = null,
      last_error = left(coalesce(error_message, 'Unknown storage deletion error'), 2000),
      available_at = now() + (
        power(2, least(greatest(queue.attempts, 1), 11))::integer * interval '1 second'
      )
    where queue.id = queue_row.id;
    insert into public.cms_audit_log (action, title, metadata)
    values (
      'media_delete_failed', queue_row.object_key,
      jsonb_build_object('queue_id', queue_row.id, 'attempts', queue_row.attempts)
    );
  end if;
end;
$$;

create or replace function public.cms_cleanup_auth_attempts()
returns bigint language plpgsql security definer set search_path = '' as $$
declare deleted_count bigint;
begin
  delete from public.cms_auth_attempts attempt where attempt.expires_at < now();
  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('portfolio-public', 'portfolio-public', true, 25165824, array[
    'image/jpeg', 'image/png', 'image/webp', 'image/avif', 'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.oasis.opendocument.text',
    'application/vnd.oasis.opendocument.spreadsheet',
    'application/vnd.oasis.opendocument.presentation', 'text/plain', 'text/csv'
  ]::text[]),
  ('portfolio-staging', 'portfolio-staging', false, 25165824, array[
    'image/jpeg', 'image/png', 'image/webp', 'image/avif', 'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.oasis.opendocument.text',
    'application/vnd.oasis.opendocument.spreadsheet',
    'application/vnd.oasis.opendocument.presentation', 'text/plain', 'text/csv'
  ]::text[])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

alter table public.cms_admin_users enable row level security;
alter table public.cms_records enable row level security;
alter table public.cms_revisions enable row level security;
alter table public.cms_audit_log enable row level security;
alter table public.cms_media enable row level security;
alter table public.cms_record_media enable row level security;
alter table public.cms_media_deletion_queue enable row level security;
alter table public.cms_auth_attempts enable row level security;

create policy cms_records_public_read on public.cms_records for select
to anon, authenticated using (status = 'published');
create policy cms_records_admin_read on public.cms_records for select
to authenticated using (public.cms_is_admin());
create policy cms_admin_users_self_read on public.cms_admin_users for select
to authenticated using (user_id = auth.uid() and public.cms_is_admin());
create policy cms_revisions_admin_read on public.cms_revisions for select
to authenticated using (public.cms_is_admin());
create policy cms_audit_log_admin_read on public.cms_audit_log for select
to authenticated using (public.cms_is_admin());
create policy cms_media_public_read on public.cms_media for select
to anon, authenticated using (bucket = 'portfolio-public' and status = 'ready');
create policy cms_media_admin_read on public.cms_media for select
to authenticated using (public.cms_is_admin());
create policy cms_record_media_public_read on public.cms_record_media for select
to anon, authenticated using (
  exists (
    select 1 from public.cms_records record
    join public.cms_media media on media.id = cms_record_media.media_id
    where record.id = cms_record_media.record_id and record.status = 'published'
      and media.bucket = 'portfolio-public' and media.status = 'ready'
  )
);
create policy cms_record_media_admin_read on public.cms_record_media for select
to authenticated using (public.cms_is_admin());
create policy cms_media_deletion_queue_admin_read
on public.cms_media_deletion_queue for select to authenticated
using (public.cms_is_admin());
create policy cms_auth_attempts_admin_read on public.cms_auth_attempts for select
to authenticated using (public.cms_is_admin());

create policy portfolio_public_objects_read on storage.objects for select
to anon, authenticated using (bucket_id = 'portfolio-public');
create policy portfolio_staging_objects_admin_read on storage.objects for select
to authenticated using (
  bucket_id = 'portfolio-staging' and public.cms_is_admin()
  and (storage.foldername(name))[1] = auth.uid()::text
);
create policy portfolio_staging_objects_admin_insert on storage.objects for insert
to authenticated with check (
  bucket_id = 'portfolio-staging' and public.cms_is_admin()
  and (storage.foldername(name))[1] = auth.uid()::text
);
create policy portfolio_staging_objects_admin_update on storage.objects for update
to authenticated using (
  bucket_id = 'portfolio-staging' and public.cms_is_admin()
  and (storage.foldername(name))[1] = auth.uid()::text
) with check (
  bucket_id = 'portfolio-staging' and public.cms_is_admin()
  and (storage.foldername(name))[1] = auth.uid()::text
);
create policy portfolio_staging_objects_admin_delete on storage.objects for delete
to authenticated using (
  bucket_id = 'portfolio-staging' and public.cms_is_admin()
  and (storage.foldername(name))[1] = auth.uid()::text
);

revoke all on table public.cms_admin_users from anon, authenticated;
revoke all on table public.cms_records from anon, authenticated;
revoke all on table public.cms_revisions from anon, authenticated;
revoke all on table public.cms_audit_log from anon, authenticated;
revoke all on table public.cms_media from anon, authenticated;
revoke all on table public.cms_record_media from anon, authenticated;
revoke all on table public.cms_media_deletion_queue from anon, authenticated;
revoke all on table public.cms_auth_attempts from anon, authenticated;

grant select on table public.cms_records to anon, authenticated;
grant select on table public.cms_admin_users to authenticated;
grant select on table public.cms_revisions to authenticated;
grant select on table public.cms_audit_log to authenticated;
grant select on table public.cms_media to anon, authenticated;
grant select on table public.cms_record_media to anon, authenticated;
grant select on table public.cms_media_deletion_queue to authenticated;
grant select on table public.cms_auth_attempts to authenticated;

grant all on table public.cms_admin_users to service_role;
grant all on table public.cms_records to service_role;
grant all on table public.cms_revisions to service_role;
grant all on table public.cms_audit_log to service_role;
grant all on table public.cms_media to service_role;
grant all on table public.cms_record_media to service_role;
grant all on table public.cms_media_deletion_queue to service_role;
grant all on table public.cms_auth_attempts to service_role;
grant usage, select on sequence public.cms_media_deletion_queue_id_seq to service_role;

revoke execute on function public.cms_is_admin() from public;
revoke execute on function public.cms_set_updated_at() from public;
revoke execute on function public.cms_assert_admin() from public;
revoke execute on function public.cms_record_title(jsonb, text) from public;
revoke execute on function public.cms_validate_record(text, text, jsonb) from public;
revoke execute on function public.cms_insert_revision(public.cms_records, uuid) from public;
revoke execute on function public.cms_queue_orphan_media(uuid[]) from public;
revoke execute on function public.cms_sync_record_media(text, jsonb, boolean) from public;
revoke execute on function public.cms_create_record(text, text, text, integer, text, jsonb, jsonb, jsonb) from public;
revoke execute on function public.cms_update_record(text, integer, text, integer, text, jsonb, jsonb, jsonb) from public;
revoke execute on function public.cms_set_publication(text, integer, boolean, jsonb) from public;
revoke execute on function public.cms_delete_record(text, integer, jsonb) from public;
revoke execute on function public.cms_reorder_collection(text, text[], jsonb, jsonb) from public;
revoke execute on function public.cms_register_staged_media(text, text, text, bigint, bigint, integer, integer, text) from public;
revoke execute on function public.cms_mark_media_ready(uuid, text) from public;
revoke execute on function public.cms_claim_media_deletion_batch(integer) from public;
revoke execute on function public.cms_complete_media_deletion(bigint, boolean, text) from public;
revoke execute on function public.cms_cleanup_auth_attempts() from public;

grant execute on function public.cms_is_admin() to anon, authenticated;
grant execute on function public.cms_create_record(text, text, text, integer, text, jsonb, jsonb, jsonb) to authenticated;
grant execute on function public.cms_update_record(text, integer, text, integer, text, jsonb, jsonb, jsonb) to authenticated;
grant execute on function public.cms_set_publication(text, integer, boolean, jsonb) to authenticated;
grant execute on function public.cms_delete_record(text, integer, jsonb) to authenticated;
grant execute on function public.cms_reorder_collection(text, text[], jsonb, jsonb) to authenticated;
grant execute on function public.cms_register_staged_media(text, text, text, bigint, bigint, integer, integer, text) to authenticated;
grant execute on function public.cms_mark_media_ready(uuid, text) to authenticated;
grant execute on function public.cms_claim_media_deletion_batch(integer) to service_role;
grant execute on function public.cms_complete_media_deletion(bigint, boolean, text) to service_role;
grant execute on function public.cms_cleanup_auth_attempts() to service_role;

comment on table public.cms_admin_users is
  'Allowlist Supabase Auth users permitted to administer the CMS. No self-registration policy exists.';
comment on table public.cms_record_media is
  'Explicit media usage graph. Stage 2 must keep this table synchronized through CMS RPCs.';
comment on table public.cms_media_deletion_queue is
  'Transactional outbox. A trusted worker deletes Storage objects through the Storage API, then acknowledges the queue item.';
comment on table public.cms_auth_attempts is
  'Optional defense-in-depth rate-limit state. Store only hashed attempt keys, never raw email or IP values.';
