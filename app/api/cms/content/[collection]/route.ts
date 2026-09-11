import { NextResponse } from 'next/server';
import { invalidOriginResponse, isCmsCollection, mutationOriginIsValid, parseStatus, requireCmsApiAdmin, unauthorizedResponse } from '@/lib/cms-api';
import { createCmsRecord, reorderCmsRecords } from '@/lib/cms-server';

type RouteProps = { params: Promise<{ collection: string }> };

export async function POST(request: Request, { params }: RouteProps) {
  if (!mutationOriginIsValid(request)) return invalidOriginResponse();
  if (!await requireCmsApiAdmin(request)) return unauthorizedResponse();
  const { collection } = await params;
  if (!isCmsCollection(collection) || collection === 'profile' || collection === 'siteContent') {
    return NextResponse.json({ error: 'Modul konten tidak valid.' }, { status: 400 });
  }
  const body = await request.json().catch(() => null) as { data?: Record<string, unknown>; status?: unknown; ids?: string[] } | null;
  if (body?.ids) {
    await reorderCmsRecords(collection, body.ids);
    return NextResponse.json({ ok: true });
  }
  if (!body?.data || typeof body.data !== 'object') return NextResponse.json({ error: 'Data konten tidak lengkap.' }, { status: 400 });
  return NextResponse.json({ record: await createCmsRecord(collection, body.data, parseStatus(body.status)) }, { status: 201 });
}
