-- Native Next.js media runtime without service-role credentials.
-- Every callable function verifies the authenticated one-person CMS allowlist.

create policy portfolio_public_objects_admin_insert on storage.objects for insert
to authenticated with check (
  bucket_id = 'portfolio-public' and public.cms_is_admin()
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy portfolio_public_objects_admin_update on storage.objects for update
to authenticated using (
  bucket_id = 'portfolio-public' and public.cms_is_admin()
  and (storage.foldername(name))[1] = auth.uid()::text
) with check (
  bucket_id = 'portfolio-public' and public.cms_is_admin()
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy portfolio_public_objects_admin_delete on storage.objects for delete
to authenticated using (
  bucket_id = 'portfolio-public' and public.cms_is_admin()
  and (storage.foldername(name))[1] = auth.uid()::text
);

create or replace function public.cms_register_ready_media(
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
      message = 'Public object key must start with the administrator user ID';
  end if;
  select * into existing_media from public.cms_media media
  where media.bucket = 'portfolio-public'
    and media.checksum_sha256 = lower(media_checksum_sha256)
    and media.status = 'ready'
  limit 1;
  if found then return existing_media; end if;

  insert into public.cms_media (
    bucket, object_key, original_name, mime_type, original_size,
    optimized_size, width, height, checksum_sha256, status
  ) values (
    'portfolio-public', media_object_key, media_original_name,
    media_mime_type, media_original_size, media_optimized_size,
    media_width, media_height, lower(media_checksum_sha256), 'ready'
  ) returning * into created_media;

  insert into public.cms_audit_log (action, actor_user_id, title, metadata)
  values (
    'media_ready', actor_id, media_original_name,
    jsonb_build_object('media_id', created_media.id, 'object_key', created_media.object_key)
  );
  return created_media;
end;
$$;

create or replace function public.cms_queue_media_deletion_admin(media_id_value uuid)
returns public.cms_media_deletion_queue
language plpgsql security definer set search_path = '' as $$
declare
  actor_id uuid := public.cms_assert_admin();
  media_row public.cms_media%rowtype;
  queue_row public.cms_media_deletion_queue%rowtype;
begin
  select * into media_row from public.cms_media media
  where media.id = media_id_value for update;
  if not found then
    raise exception using errcode = 'P0002', message = 'Media not found';
  end if;
  if exists (
    select 1 from public.cms_record_media link where link.media_id = media_row.id
  ) then
    raise exception using errcode = '23503', message = 'Media is still referenced';
  end if;

  if media_row.status <> 'pending_delete' then
    update public.cms_media media set status = 'pending_delete'
    where media.id = media_row.id;
  end if;
  insert into public.cms_media_deletion_queue (media_id, bucket, object_key)
  values (media_row.id, media_row.bucket, media_row.object_key)
  on conflict (bucket, object_key) where processed_at is null
  do update set available_at = least(public.cms_media_deletion_queue.available_at, now())
  returning * into queue_row;

  insert into public.cms_audit_log (action, actor_user_id, title, metadata)
  values (
    'media_queue', actor_id, media_row.original_name,
    jsonb_build_object('media_id', media_row.id, 'object_key', media_row.object_key)
  );
  return queue_row;
end;
$$;

create or replace function public.cms_queue_unused_media_admin(
  older_than_seconds integer default 3600
)
returns integer language plpgsql security definer set search_path = '' as $$
declare
  actor_id uuid := public.cms_assert_admin();
  unused_ids uuid[];
  queued_count integer;
begin
  if older_than_seconds < 300 or older_than_seconds > 2592000 then
    raise exception using errcode = '22023',
      message = 'Cleanup age must be between 300 and 2592000 seconds';
  end if;
  select array_agg(media.id), count(*)::integer
  into unused_ids, queued_count
  from public.cms_media media
  where media.status = 'ready'
    and media.created_at < now() - make_interval(secs => older_than_seconds)
    and not exists (
      select 1 from public.cms_record_media link where link.media_id = media.id
    );
  perform public.cms_queue_orphan_media(unused_ids);
  return coalesce(queued_count, 0);
end;
$$;

create or replace function public.cms_claim_media_deletion_batch_admin(
  batch_size integer default 20
)
returns setof public.cms_media_deletion_queue
language plpgsql security definer set search_path = '' as $$
begin
  perform public.cms_assert_admin();
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

create or replace function public.cms_complete_media_deletion_admin(
  queue_id bigint, succeeded boolean, error_message text default null
)
returns void language plpgsql security definer set search_path = '' as $$
begin
  perform public.cms_assert_admin();
  perform public.cms_complete_media_deletion(queue_id, succeeded, error_message);
end;
$$;

revoke execute on function public.cms_register_ready_media(
  text, text, text, bigint, bigint, integer, integer, text
) from public;
revoke execute on function public.cms_queue_media_deletion_admin(uuid) from public;
revoke execute on function public.cms_queue_unused_media_admin(integer) from public;
revoke execute on function public.cms_claim_media_deletion_batch_admin(integer) from public;
revoke execute on function public.cms_complete_media_deletion_admin(bigint, boolean, text) from public;

grant execute on function public.cms_register_ready_media(
  text, text, text, bigint, bigint, integer, integer, text
) to authenticated;
grant execute on function public.cms_queue_media_deletion_admin(uuid) to authenticated;
grant execute on function public.cms_queue_unused_media_admin(integer) to authenticated;
grant execute on function public.cms_claim_media_deletion_batch_admin(integer) to authenticated;
grant execute on function public.cms_complete_media_deletion_admin(bigint, boolean, text) to authenticated;
