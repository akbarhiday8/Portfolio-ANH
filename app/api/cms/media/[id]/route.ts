import { NextResponse } from 'next/server';
import { ensureCmsSchema, getCmsDatabase, getMediaBucket } from '@/lib/cms-server';
import { invalidOriginResponse, mutationOriginIsValid, requireCmsApiAdmin, unauthorizedResponse } from '@/lib/cms-api';

type RouteProps = { params: Promise<{ id: string }> };

export async function DELETE(request: Request, { params }: RouteProps) {
  if (!mutationOriginIsValid(request)) return invalidOriginResponse();
  if (!await requireCmsApiAdmin(request)) return unauthorizedResponse();
  await ensureCmsSchema();
  const { id } = await params;
  const row = await getCmsDatabase().prepare('SELECT object_key FROM cms_media WHERE id = ?').bind(id).first<{ object_key: string }>();
  if (!row) return NextResponse.json({ error: 'Media tidak ditemukan.' }, { status: 404 });
  const mediaUrl = `/media/${row.object_key}`;
  const reference = await getCmsDatabase().prepare('SELECT id FROM cms_records WHERE data_json LIKE ? LIMIT 1').bind(`%${mediaUrl}%`).first();
  if (reference) return NextResponse.json({ error: 'Media masih digunakan oleh konten. Ganti media pada konten tersebut terlebih dahulu.' }, { status: 409 });
  await getMediaBucket().delete(row.object_key);
  await getCmsDatabase().prepare('DELETE FROM cms_media WHERE id = ?').bind(id).run();
  return NextResponse.json({ ok: true });
}
