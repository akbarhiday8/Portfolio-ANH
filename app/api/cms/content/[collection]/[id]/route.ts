import { NextResponse } from 'next/server';
import { deleteCmsRecord, updateCmsRecord } from '@/lib/cms-repository';
import { cmsRepositoryErrorResponse, invalidOriginResponse, isCmsCollection, mutationOriginIsValid, parseStatus, requireCmsApiAdmin, unauthorizedResponse } from '@/lib/cms-api';
import { validateCmsRecord } from '@/lib/cms-validation';

type RouteProps = { params: Promise<{ collection: string; id: string }> };

export async function PUT(request: Request, { params }: RouteProps) {
  if (!mutationOriginIsValid(request)) return invalidOriginResponse();
  if (!await requireCmsApiAdmin()) return unauthorizedResponse();
  const { collection, id } = await params;
  if (!isCmsCollection(collection)) return NextResponse.json({ error: 'Modul konten tidak valid.' }, { status: 400 });
  const body = await request.json().catch(() => null) as { data?: Record<string, unknown>; status?: unknown; version?: number } | null;
  if (!body?.data || typeof body.data !== 'object') return NextResponse.json({ error: 'Data konten tidak lengkap.' }, { status: 400 });
  const status = parseStatus(body.status);
  const validated = validateCmsRecord(collection, body.data, status);
  if (!validated.success) return NextResponse.json({ error: 'Konten belum valid.', details: validated.errors }, { status: 422 });
  try {
    const record = await updateCmsRecord(collection, id, validated.data, status, body.version);
    return record ? NextResponse.json({ record }) : NextResponse.json({ error: 'Konten tidak ditemukan.' }, { status: 404 });
  } catch (error) {
    if (String(error).toLowerCase().includes('unique')) return NextResponse.json({ error: 'Alamat halaman sudah digunakan.' }, { status: 409 });
    return cmsRepositoryErrorResponse(error);
  }
}

export async function DELETE(request: Request, { params }: RouteProps) {
  if (!mutationOriginIsValid(request)) return invalidOriginResponse();
  if (!await requireCmsApiAdmin()) return unauthorizedResponse();
  const { collection, id } = await params;
  if (!isCmsCollection(collection)) return NextResponse.json({ error: 'Modul konten tidak valid.' }, { status: 400 });
  if (collection === 'profile' || collection === 'siteContent') return NextResponse.json({ error: 'Modul utama tidak dapat dihapus.' }, { status: 400 });
  const body = await request.json().catch(() => null) as { version?: number } | null;
  try {
    const deleted = await deleteCmsRecord(collection, id, body?.version);
    return deleted ? NextResponse.json({ ok: true }) : NextResponse.json({ error: 'Konten tidak ditemukan.' }, { status: 404 });
  } catch (error) {
    return cmsRepositoryErrorResponse(error);
  }
}
