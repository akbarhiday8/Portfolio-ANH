import { NextResponse } from 'next/server';
import { cmsRepositoryErrorResponse, requireCmsApiAdmin, unauthorizedResponse } from '@/lib/cms-api';
import { getCmsSnapshot } from '@/lib/cms-repository';

export async function GET() {
  if (!await requireCmsApiAdmin()) return unauthorizedResponse();
  try {
    return NextResponse.json({ collections: await getCmsSnapshot() }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    return cmsRepositoryErrorResponse(error);
  }
}
