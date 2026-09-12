create extension if not exists pgcrypto;

create table if not exists public.cms_admins (
  id smallint primary key default 1 check (id = 1),
  email text not null unique,
  display_name text not null,
  password_hash text not null,
  password_salt text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cms_sessions (
  token_hash text primary key,
  admin_id smallint not null references public.cms_admins(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.cms_records (
  id uuid primary key default gen_random_uuid(),
  collection text not null,
  slug text,
  sort_order integer not null default 0,
  status text not null default 'published' check (status in ('draft', 'published')),
  data_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_cms_records_collection_slug
  on public.cms_records(collection, slug)
  where slug is not null;

create index if not exists idx_cms_records_collection_order
  on public.cms_records(collection, sort_order);

create index if not exists idx_cms_records_public
  on public.cms_records(collection, status, sort_order);

create table if not exists public.cms_media (
  id uuid primary key default gen_random_uuid(),
  object_key text not null unique,
  original_name text not null,
  content_type text not null,
  size_bytes bigint not null,
  original_size_bytes bigint,
  width integer,
  height integer,
  optimized boolean not null default false,
  temporary boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_cms_media_created_at
  on public.cms_media(created_at desc);

create index if not exists idx_cms_media_temporary
  on public.cms_media(temporary, created_at)
  where temporary = true;

insert into storage.buckets (id, name, public, file_size_limit)
values ('portfolio-media', 'portfolio-media', true, 25165824)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit;

alter table public.cms_admins enable row level security;
alter table public.cms_sessions enable row level security;
alter table public.cms_records enable row level security;
alter table public.cms_media enable row level security;

-- Seluruh operasi CMS dilakukan melalui route server dengan service role.
-- Tidak ada policy tulis untuk browser, sehingga pengunjung tidak dapat
-- mengubah konten atau mengunggah berkas langsung ke Supabase.
