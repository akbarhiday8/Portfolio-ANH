ALTER TABLE cms_media ADD COLUMN original_size_bytes INTEGER;
ALTER TABLE cms_media ADD COLUMN width INTEGER;
ALTER TABLE cms_media ADD COLUMN height INTEGER;
ALTER TABLE cms_media ADD COLUMN optimized INTEGER NOT NULL DEFAULT 0;
ALTER TABLE cms_media ADD COLUMN temporary INTEGER NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_cms_media_created_at ON cms_media(created_at DESC);
PRAGMA optimize;
