import { NextResponse } from 'next/server';

import {
  invalidOriginResponse,
  mutationOriginIsValid,
  requireCmsApiAdmin,
  unauthorizedResponse,
} from '@/lib/cms-api';
import {
  getCmsPublicBucket,
  mapSupabaseMedia,
  processPendingMediaDeletions,
} from '@/lib/cms/media';
import { MAX_DOCUMENT_SIZE, MAX_OPTIMIZED_IMAGE_SIZE } from '@/lib/media-policy';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const MIME_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.ms-powerpoint': 'ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  'application/vnd.oasis.opendocument.text': 'odt',
  'application/vnd.oasis.opendocument.spreadsheet': 'ods',
  'application/vnd.oasis.opendocument.presentation': 'odp',
  'text/plain': 'txt',
  'text/csv': 'csv',
};

const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const UNUSED_MEDIA_GRACE_SECONDS = 60 * 60;
const MEDIA_COLUMNS = [
  'id',
  'bucket',
  'object_key',
  'original_name',
  'mime_type',
  'original_size',
  'optimized_size',
  'width',
  'height',
  'status',
  'created_at',
].join(',');

type UploadRequest = {
  action?: 'prepare' | 'complete' | 'abort';
  objectKey?: string;
  name?: string;
  contentType?: string;
  size?: number;
  originalSize?: number;
  width?: number;
  height?: number;
  optimized?: boolean;
  checksum?: string;
};

function cleanPositiveInteger(value: unknown) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
}

function validateUploadMetadata(body: UploadRequest) {
  const name = body.name?.replace(/[\r\n]/g, ' ').trim().slice(0, 180) ?? '';
  const contentType = body.contentType?.trim().toLowerCase() ?? '';
  const size = cleanPositiveInteger(body.size);
  const originalSize = cleanPositiveInteger(body.originalSize) ?? size;
  const checksum = body.checksum?.trim().toLowerCase() ?? '';
  const width = IMAGE_TYPES.has(contentType) ? cleanPositiveInteger(body.width) : null;
  const height = IMAGE_TYPES.has(contentType) ? cleanPositiveInteger(body.height) : null;
  const maximumSize = IMAGE_TYPES.has(contentType)
    ? MAX_OPTIMIZED_IMAGE_SIZE
    : MAX_DOCUMENT_SIZE;

  if (!name || !MIME_EXTENSIONS[contentType] || !size || !originalSize) {
    return { error: 'Metadata berkas tidak lengkap.' } as const;
  }
  if (size > maximumSize || originalSize > MAX_DOCUMENT_SIZE) {
    return {
      error: IMAGE_TYPES.has(contentType)
        ? 'Gambar hasil optimasi maksimal 8 MB.'
        : 'Dokumen maksimal 24 MB.',
    } as const;
  }
  if (!/^[0-9a-f]{64}$/.test(checksum)) {
    return { error: 'Checksum berkas tidak valid.' } as const;
  }
  if (IMAGE_TYPES.has(contentType) && (!width || !height)) {
    return { error: 'Dimensi gambar tidak tersedia.' } as const;
  }
  return {
    name,
    contentType,
    size,
    originalSize,
    width,
    height,
    checksum,
  } as const;
}

function ownedObjectKey(userId: string, objectKey: string | undefined) {
  return Boolean(
    objectKey
      && objectKey.startsWith(`${userId}/`)
      && /^[0-9a-f-]{36}\.[a-z0-9]+$/.test(objectKey.slice(userId.length + 1)),
  );
}

export async function GET() {
  if (!await requireCmsApiAdmin()) return unauthorizedResponse();
  const supabase = await createSupabaseServerClient();
  await supabase.rpc('cms_queue_unused_media_admin', {
    older_than_seconds: UNUSED_MEDIA_GRACE_SECONDS,
  });
  await processPendingMediaDeletions(supabase).catch(() => undefined);

  const { data, error } = await supabase
    .from('cms_media')
    .select(MEDIA_COLUMNS)
    .neq('status', 'pending_delete')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[supabase-media] list failed', { code: error.code });
    return NextResponse.json({ error: 'Pustaka media tidak dapat dimuat.' }, { status: 503 });
  }
  return NextResponse.json(
    {
      media: (data ?? []).map((row) =>
        mapSupabaseMedia(supabase, row as unknown as Record<string, unknown>),
      ),
    },
    { headers: { 'Cache-Control': 'private, no-store' } },
  );
}

export async function POST(request: Request) {
  if (!mutationOriginIsValid(request)) return invalidOriginResponse();
  const admin = await requireCmsApiAdmin();
  if (!admin) return unauthorizedResponse();
  const body = await request.json().catch(() => null) as UploadRequest | null;
  if (!body?.action) {
    return NextResponse.json({ error: 'Permintaan upload tidak valid.' }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const bucket = getCmsPublicBucket();

  if (body.action === 'abort') {
    if (!ownedObjectKey(admin.id, body.objectKey)) {
      return NextResponse.json({ error: 'Path media tidak valid.' }, { status: 400 });
    }
    const { data: registered, error: registeredError } = await supabase
      .from('cms_media')
      .select('id')
      .eq('bucket', bucket)
      .eq('object_key', body.objectKey!)
      .maybeSingle();
    if (registeredError) {
      console.error('[supabase-media] abort registration check failed', {
        code: registeredError.code,
      });
      return NextResponse.json({ error: 'Status media tidak dapat diperiksa.' }, { status: 503 });
    }
    if (registered) return NextResponse.json({ ok: true });

    const { error } = await supabase.storage.from(bucket).remove([body.objectKey!]);
    return error
      ? NextResponse.json({ error: 'Upload yang dibatalkan belum dapat dibersihkan.' }, { status: 503 })
      : NextResponse.json({ ok: true });
  }

  const metadata = validateUploadMetadata(body);
  if ('error' in metadata) {
    return NextResponse.json({ error: metadata.error }, { status: 400 });
  }

  if (body.action === 'prepare') {
    const { data: existing, error: duplicateError } = await supabase
      .from('cms_media')
      .select(MEDIA_COLUMNS)
      .eq('bucket', bucket)
      .eq('checksum_sha256', metadata.checksum)
      .eq('mime_type', metadata.contentType)
      .eq('optimized_size', metadata.size)
      .eq('status', 'ready')
      .maybeSingle();
    if (duplicateError) {
      console.error('[supabase-media] duplicate check failed', { code: duplicateError.code });
      return NextResponse.json({ error: 'Media tidak dapat diperiksa.' }, { status: 503 });
    }
    if (existing) {
      return NextResponse.json({
        media: mapSupabaseMedia(supabase, existing as unknown as Record<string, unknown>),
        reused: true,
      });
    }

    const extension = MIME_EXTENSIONS[metadata.contentType];
    const objectKey = `${admin.id}/${crypto.randomUUID()}.${extension}`;
    const { data: signed, error: signedError } = await supabase.storage
      .from(bucket)
      .createSignedUploadUrl(objectKey);
    if (signedError || !signed?.signedUrl) {
      console.error('[supabase-media] signed upload URL failed', {
        statusCode: signedError?.statusCode,
      });
      return NextResponse.json({ error: 'Alamat upload tidak dapat dibuat.' }, { status: 503 });
    }
    return NextResponse.json({ upload: { objectKey, signedUrl: signed.signedUrl } });
  }

  if (body.action !== 'complete' || !ownedObjectKey(admin.id, body.objectKey)) {
    return NextResponse.json({ error: 'Penyelesaian upload tidak valid.' }, { status: 400 });
  }

  const objectKey = body.objectKey!;
  const { data: objectInfo, error: infoError } = await supabase.storage
    .from(bucket)
    .info(objectKey);
  const storedSize = cleanPositiveInteger(objectInfo?.size);
  const storedContentType = objectInfo?.contentType?.toLowerCase();
  if (
    infoError
      || storedSize !== metadata.size
      || (storedContentType && storedContentType !== metadata.contentType)
  ) {
    await supabase.storage.from(bucket).remove([objectKey]).catch(() => undefined);
    return NextResponse.json({ error: 'Berkas tersimpan tidak sesuai metadata upload.' }, { status: 422 });
  }

  const { data: registered, error: registerError } = await supabase.rpc(
    'cms_register_ready_media',
    {
      media_object_key: objectKey,
      media_original_name: metadata.name,
      media_mime_type: metadata.contentType,
      media_original_size: metadata.originalSize,
      media_optimized_size: metadata.size,
      media_width: metadata.width,
      media_height: metadata.height,
      media_checksum_sha256: metadata.checksum,
    },
  );
  if (registerError || !registered) {
    await supabase.storage.from(bucket).remove([objectKey]).catch(() => undefined);
    console.error('[supabase-media] metadata registration failed', { code: registerError?.code });
    return NextResponse.json({ error: 'Metadata media tidak dapat disimpan.' }, { status: 503 });
  }

  const row = Array.isArray(registered) ? registered[0] : registered;
  if (!row || typeof row !== 'object') {
    await supabase.storage.from(bucket).remove([objectKey]).catch(() => undefined);
    return NextResponse.json({ error: 'Respons penyimpanan media tidak valid.' }, { status: 503 });
  }
  if (String(row.object_key) !== objectKey) {
    await supabase.storage.from(bucket).remove([objectKey]).catch(() => undefined);
  }
  return NextResponse.json(
    { media: mapSupabaseMedia(supabase, row as Record<string, unknown>) },
    { status: 201 },
  );
}
