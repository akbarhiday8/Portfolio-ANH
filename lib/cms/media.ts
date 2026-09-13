import 'server-only';

import type { MediaItem } from '@/lib/media-policy';
import { createSupabaseServerClient } from '@/lib/supabase/server';

type SupabaseRequestClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

export const DEFAULT_CMS_PUBLIC_BUCKET = 'portfolio-public';

export function getCmsPublicBucket() {
  const bucket = process.env.SUPABASE_PUBLIC_BUCKET?.trim() || DEFAULT_CMS_PUBLIC_BUCKET;
  if (bucket !== DEFAULT_CMS_PUBLIC_BUCKET) {
    throw new Error('SUPABASE_PUBLIC_BUCKET harus bernilai portfolio-public.');
  }
  return bucket;
}

function optionalPositiveNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : undefined;
}

export function mapSupabaseMedia(
  client: SupabaseRequestClient,
  row: Record<string, unknown>,
): MediaItem {
  const bucket = String(row.bucket);
  const objectKey = String(row.object_key);
  const { data } = client.storage.from(bucket).getPublicUrl(objectKey);
  const originalSize = Number(row.original_size);
  const optimizedSize = Number(row.optimized_size);

  return {
    id: String(row.id),
    url: data.publicUrl,
    name: String(row.original_name),
    contentType: String(row.mime_type),
    size: optimizedSize,
    originalSize,
    width: optionalPositiveNumber(row.width),
    height: optionalPositiveNumber(row.height),
    optimized: optimizedSize < originalSize,
    temporary: false,
    createdAt: String(row.created_at),
  };
}

export async function processPendingMediaDeletions(
  client: SupabaseRequestClient,
  batchSize = 20,
) {
  const { data: claimed, error: claimError } = await client.rpc(
    'cms_claim_media_deletion_batch_admin',
    { batch_size: batchSize },
  );
  if (claimError) throw claimError;

  let failed = 0;
  for (const value of claimed ?? []) {
    const row = value as Record<string, unknown>;
    const queueId = Number(row.id);
    const bucket = String(row.bucket);
    const objectKey = String(row.object_key);
    const { error: storageError } = await client.storage.from(bucket).remove([objectKey]);
    const { error: completionError } = await client.rpc(
      'cms_complete_media_deletion_admin',
      {
        queue_id: queueId,
        succeeded: !storageError,
        error_message: storageError?.message ?? null,
      },
    );
    if (storageError || completionError) failed += 1;
  }

  return { processed: (claimed ?? []).length, failed };
}
