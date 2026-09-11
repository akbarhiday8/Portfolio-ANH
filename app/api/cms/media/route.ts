import { NextResponse } from 'next/server';
import { getCmsDatabase, getMediaBucket, ensureCmsSchema } from '@/lib/cms-server';
import { invalidOriginResponse, mutationOriginIsValid, requireCmsApiAdmin, unauthorizedResponse } from '@/lib/cms-api';

const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']);
const MAX_SIZE = 12 * 1024 * 1024;

export async function GET(request: Request) {
  if (!await requireCmsApiAdmin(request)) return unauthorizedResponse();
  await ensureCmsSchema();
  const result = await getCmsDatabase().prepare('SELECT * FROM cms_media ORDER BY created_at DESC').all<Record<string, unknown>>();
  return NextResponse.json({ media: result.results.map((row) => ({
    id: String(row.id),
    url: `/media/${String(row.object_key).split('/').map(encodeURIComponent).join('/')}`,
    name: String(row.original_name),
    contentType: String(row.content_type),
    size: Number(row.size_bytes),
    createdAt: String(row.created_at),
  })) });
}

export async function POST(request: Request) {
  if (!mutationOriginIsValid(request)) return invalidOriginResponse();
  if (!await requireCmsApiAdmin(request)) return unauthorizedResponse();
  const formData = await request.formData();
  const file = formData.get('file');
  if (!(file instanceof File)) return NextResponse.json({ error: 'Pilih berkas yang ingin diunggah.' }, { status: 400 });
  if (!allowedTypes.has(file.type) || file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'Gunakan JPG, PNG, WebP, GIF, atau PDF dengan ukuran maksimal 12 MB.' }, { status: 400 });
  }
  await ensureCmsSchema();
  const id = crypto.randomUUID();
  const extension = file.name.includes('.') ? file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
  const objectKey = `cms/${id}${extension ? `.${extension}` : ''}`;
  await getMediaBucket().put(objectKey, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type, cacheControl: 'public, max-age=31536000, immutable' },
    customMetadata: { originalName: file.name },
  });
  const now = new Date().toISOString();
  await getCmsDatabase().prepare(
    'INSERT INTO cms_media (id, object_key, original_name, content_type, size_bytes, created_at) VALUES (?, ?, ?, ?, ?, ?)',
  ).bind(id, objectKey, file.name, file.type, file.size, now).run();
  return NextResponse.json({ media: {
    id,
    url: `/media/${objectKey.split('/').map(encodeURIComponent).join('/')}`,
    name: file.name,
    contentType: file.type,
    size: file.size,
    createdAt: now,
  } }, { status: 201 });
}
