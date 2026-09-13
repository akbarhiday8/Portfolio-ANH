import { NextResponse } from 'next/server';
import { cmsRepositoryErrorResponse, invalidOriginResponse, isCmsCollection, mutationOriginIsValid, parseStatus, requireCmsApiAdmin, unauthorizedResponse } from '@/lib/cms-api';
import { createCmsRecord, listCmsRecords, reorderCmsRecords } from '@/lib/cms-repository';
import { validateCmsRecord } from '@/lib/cms-validation';

type RouteProps = { params: Promise<{ collection: string }> };

export async function POST(request: Request, { params }: RouteProps) {
  if (!mutationOriginIsValid(request)) return invalidOriginResponse();
  if (!await requireCmsApiAdmin()) return unauthorizedResponse();
  const { collection } = await params;
  if (!isCmsCollection(collection) || collection === 'profile' || collection === 'siteContent') {
    return NextResponse.json({ error: 'Modul konten tidak valid.' }, { status: 400 });
  }
  const body = await request.json().catch(() => null) as {
    data?: Record<string, unknown>;
    status?: unknown;
    ids?: string[];
    expectedVersions?: Record<string, number>;
  } | null;
  if (body?.ids) {
    try {
      const reordered = await reorderCmsRecords(collection, body.ids, body.expectedVersions);
      return reordered
        ? NextResponse.json({
            ok: true,
            records: await listCmsRecords({ collection, includeDrafts: true }),
          })
        : NextResponse.json({ error: 'Urutan konten tidak lengkap atau tidak valid.' }, { status: 400 });
    } catch (error) {
      return cmsRepositoryErrorResponse(error);
    }
  }
  if (!body?.data || typeof body.data !== 'object') return NextResponse.json({ error: 'Data konten tidak lengkap.' }, { status: 400 });
  const status = parseStatus(body.status);
  const validated = validateCmsRecord(collection, body.data, status);
  if (!validated.success) return NextResponse.json({ error: 'Konten belum valid.', details: validated.errors }, { status: 422 });
  try {
    return NextResponse.json({ record: await createCmsRecord(collection, validated.data, status) }, { status: 201 });
  } catch (error) {
    if (String(error).toLowerCase().includes('unique')) return NextResponse.json({ error: 'Alamat halaman sudah digunakan.' }, { status: 409 });
    return cmsRepositoryErrorResponse(error);
  }
}
