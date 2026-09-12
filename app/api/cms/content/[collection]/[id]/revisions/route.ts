import { NextResponse } from 'next/server';
import { isCmsCollection, requireCmsApiAdmin, unauthorizedResponse } from '@/lib/cms-api';
import { getCmsRevisions } from '@/lib/cms-server';

type RouteProps = { params: Promise<{ collection: string; id: string }> };

export async function GET(request: Request, { params }: RouteProps) {
  if (!await requireCmsApiAdmin(request)) return unauthorizedResponse();
  const { collection, id } = await params;
  if (!isCmsCollection(collection)) return NextResponse.json({ error: 'Modul konten tidak valid.' }, { status: 400 });
  return NextResponse.json({ revisions: await getCmsRevisions(collection, id) }, { headers: { 'Cache-Control': 'no-store' } });
}

