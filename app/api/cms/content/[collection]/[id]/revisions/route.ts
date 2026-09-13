import { NextResponse } from 'next/server';
import { cmsRepositoryErrorResponse, isCmsCollection, requireCmsApiAdmin, unauthorizedResponse } from '@/lib/cms-api';
import { getCmsRevisions } from '@/lib/cms-repository';

type RouteProps = { params: Promise<{ collection: string; id: string }> };

export async function GET(_request: Request, { params }: RouteProps) {
  if (!await requireCmsApiAdmin()) return unauthorizedResponse();
  const { collection, id } = await params;
  if (!isCmsCollection(collection)) return NextResponse.json({ error: 'Modul konten tidak valid.' }, { status: 400 });
  try {
    return NextResponse.json({ revisions: await getCmsRevisions(collection, id) }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    return cmsRepositoryErrorResponse(error);
  }
}
