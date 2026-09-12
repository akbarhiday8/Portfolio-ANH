import { NextResponse } from 'next/server';
import { cleanupUnusedCmsMedia, getCmsDatabase, getMediaBucket, ensureCmsSchema } from '@/lib/cms-server';
import { invalidOriginResponse, mutationOriginIsValid, requireCmsApiAdmin, unauthorizedResponse } from '@/lib/cms-api';
import { MAX_DOCUMENT_SIZE, MAX_OPTIMIZED_IMAGE_SIZE } from '@/lib/media-policy';

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

const EXTENSION_MIMES = Object.fromEntries(Object.entries(MIME_EXTENSIONS).map(([mime, extension]) => [extension, mime]));
const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ZIP_TYPES = new Set([
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.oasis.opendocument.text',
  'application/vnd.oasis.opendocument.spreadsheet',
  'application/vnd.oasis.opendocument.presentation',
]);
const LEGACY_OFFICE_TYPES = new Set(['application/msword', 'application/vnd.ms-excel', 'application/vnd.ms-powerpoint']);
const UNUSED_MEDIA_GRACE_MS = 60 * 60 * 1000;

function asPositiveInteger(value: FormDataEntryValue | null) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
}

function resolvedContentType(file: File) {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
  const byExtension = EXTENSION_MIMES[extension];
  if (file.type && MIME_EXTENSIONS[file.type]) return file.type;
  return byExtension ?? '';
}

function startsWith(bytes: Uint8Array, signature: number[]) {
  return signature.every((value, index) => bytes[index] === value);
}

function signatureMatches(contentType: string, bytes: Uint8Array) {
  if (contentType === 'image/jpeg') return startsWith(bytes, [0xff, 0xd8, 0xff]);
  if (contentType === 'image/png') return startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (contentType === 'image/webp') return startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP';
  if (contentType === 'application/pdf') return String.fromCharCode(...bytes.slice(0, 5)) === '%PDF-';
  if (ZIP_TYPES.has(contentType)) return startsWith(bytes, [0x50, 0x4b, 0x03, 0x04]) || startsWith(bytes, [0x50, 0x4b, 0x05, 0x06]);
  if (LEGACY_OFFICE_TYPES.has(contentType)) return startsWith(bytes, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
  if (contentType === 'text/plain' || contentType === 'text/csv') return !bytes.slice(0, 512).includes(0);
  return false;
}

function mapMediaRow(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    url: `/media/${String(row.object_key).split('/').map(encodeURIComponent).join('/')}`,
    name: String(row.original_name),
    contentType: String(row.content_type),
    size: Number(row.size_bytes),
    originalSize: Number(row.original_size_bytes ?? row.size_bytes),
    width: row.width ? Number(row.width) : undefined,
    height: row.height ? Number(row.height) : undefined,
    optimized: Boolean(row.optimized),
    temporary: Boolean(row.temporary),
    createdAt: String(row.created_at),
  };
}

export async function GET(request: Request) {
  if (!await requireCmsApiAdmin(request)) return unauthorizedResponse();
  await ensureCmsSchema();
  await cleanupUnusedCmsMedia({ olderThanMs: UNUSED_MEDIA_GRACE_MS }).catch(() => undefined);
  const result = await getCmsDatabase().prepare('SELECT * FROM cms_media ORDER BY created_at DESC').all<Record<string, unknown>>();
  return NextResponse.json({ media: result.results.map(mapMediaRow) });
}

export async function POST(request: Request) {
  if (!mutationOriginIsValid(request)) return invalidOriginResponse();
  if (!await requireCmsApiAdmin(request)) return unauthorizedResponse();
  const formData = await request.formData();
  const file = formData.get('file');
  if (!(file instanceof File)) return NextResponse.json({ error: 'Pilih berkas yang ingin diunggah.' }, { status: 400 });

  const contentType = resolvedContentType(file);
  if (!contentType) return NextResponse.json({ error: 'Format berkas belum didukung oleh CMS.' }, { status: 400 });
  const maximumSize = IMAGE_TYPES.has(contentType) ? MAX_OPTIMIZED_IMAGE_SIZE : MAX_DOCUMENT_SIZE;
  if (file.size > maximumSize) {
    return NextResponse.json({ error: IMAGE_TYPES.has(contentType) ? 'Gambar hasil optimasi maksimal 8 MB.' : 'Dokumen maksimal 24 MB.' }, { status: 400 });
  }

  const buffer = await file.arrayBuffer();
  if (!signatureMatches(contentType, new Uint8Array(buffer))) {
    return NextResponse.json({ error: 'Isi berkas tidak sesuai dengan formatnya. Ekspor ulang berkas lalu coba lagi.' }, { status: 400 });
  }

  await ensureCmsSchema();
  const id = crypto.randomUUID();
  const extension = MIME_EXTENSIONS[contentType];
  const objectKey = `cms/${id}.${extension}`;
  const originalSize = asPositiveInteger(formData.get('originalSize')) ?? file.size;
  const width = IMAGE_TYPES.has(contentType) ? asPositiveInteger(formData.get('width')) : null;
  const height = IMAGE_TYPES.has(contentType) ? asPositiveInteger(formData.get('height')) : null;
  const optimized = formData.get('optimized') === '1';
  const temporary = formData.get('temporary') !== '0';
  const originalName = file.name.replace(/[\r\n]/g, ' ').slice(0, 180);
  await getMediaBucket().put(objectKey, buffer, {
    httpMetadata: { contentType, cacheControl: 'public, max-age=31536000, immutable' },
    customMetadata: { originalName, originalSize: String(originalSize), optimized: optimized ? '1' : '0' },
  });
  const now = new Date().toISOString();
  await getCmsDatabase().prepare(
    `INSERT INTO cms_media
      (id, object_key, original_name, content_type, size_bytes, original_size_bytes, width, height, optimized, temporary, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).bind(id, objectKey, originalName, contentType, file.size, originalSize, width, height, optimized ? 1 : 0, temporary ? 1 : 0, now).run();
  return NextResponse.json({ media: mapMediaRow({
    id, object_key: objectKey, original_name: originalName, content_type: contentType,
    size_bytes: file.size, original_size_bytes: originalSize, width, height, optimized: optimized ? 1 : 0, temporary: temporary ? 1 : 0, created_at: now,
  }) }, { status: 201 });
}
