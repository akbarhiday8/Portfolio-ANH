import { NextResponse } from 'next/server';
import { cmsRepositoryErrorResponse, requireCmsApiAdmin, unauthorizedResponse } from '@/lib/cms-api';
import { getCmsSnapshot } from '@/lib/cms-repository';

export async function GET() {
  if (!await requireCmsApiAdmin()) return unauthorizedResponse();
  try {
    const payload = JSON.stringify({ exportedAt: new Date().toISOString(), collections: await getCmsSnapshot() }, null, 2);
    return new NextResponse(payload, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="portfolio-cms-${new Date().toISOString().slice(0, 10)}.json"`,
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (error) {
    return cmsRepositoryErrorResponse(error);
  }
}
