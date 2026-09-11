import { NextResponse } from 'next/server';
import { deleteCmsRecord, updateCmsRecord } from '@/lib/cms-server';
import { invalidOriginResponse, isCmsCollection, mutationOriginIsValid, parseStatus, requireCmsApiAdmin, unauthorizedResponse } from '@/lib/cms-api';

type RouteProps = { params: Promise<{ collection: string; id: string }> };

export async function PUT(request: Request, { params }: RouteProps) {
  if (!mutationOriginIsValid(request)) return invalidOriginResponse();
  if (!await requireCmsApiAdmin(request)) return unauthorizedResponse();
  const { collection, id } = await params;
  if (!isCmsCollection(collection)) return NextResponse.json({ error: 'Modul konten tidak valid.' }, { status: 400 });
  const body = await request.json().catch(() => null) as { data?: Record<string, unknown>; status?: unknown } | null;
  if (!body?.data || typeof body.data !== 'object') return NextResponse.json({ error: 'Data konten tidak lengkap.' }, { status: 400 });
  const record = await updateCmsRecord(id, body.data, parseStatus(body.status));
  return record ? NextResponse.json({ record }) : NextResponse.json({ error: 'Konten tidak ditemukan.' }, { status: 404 });
}

export async function DELETE(request: Request, { params }: RouteProps) {
  if (!mutationOriginIsValid(request)) return invalidOriginResponse();
  if (!await requireCmsApiAdmin(request)) return unauthorizedResponse();
  const { collection, id } = await params;
  if (!isCmsCollection(collection)) return NextResponse.json({ error: 'Modul konten tidak valid.' }, { status: 400 });
  if (collection === 'profile' || collection === 'siteContent') return NextResponse.json({ error: 'Modul utama tidak dapat dihapus.' }, { status: 400 });
  await deleteCmsRecord(id);
  return NextResponse.json({ ok: true });
}
