CREATE TABLE IF NOT EXISTS cms_admins (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cms_sessions (
  token_hash TEXT PRIMARY KEY,
  admin_id INTEGER NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (admin_id) REFERENCES cms_admins(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cms_records (
  id TEXT PRIMARY KEY,
  collection TEXT NOT NULL,
  slug TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  data_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_cms_records_collection_slug
ON cms_records(collection, slug)
WHERE slug IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_cms_records_collection_order
ON cms_records(collection, sort_order);

CREATE INDEX IF NOT EXISTS idx_cms_records_public
ON cms_records(collection, status, sort_order);

CREATE TABLE IF NOT EXISTS cms_media (
  id TEXT PRIMARY KEY,
  object_key TEXT NOT NULL UNIQUE,
  original_name TEXT NOT NULL,
  content_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cms_media_created_at
ON cms_media(created_at DESC);
