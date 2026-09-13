import { NextResponse } from 'next/server';
import { requireCmsApiAdmin, unauthorizedResponse } from '@/lib/cms-api';
import { getCmsSnapshot } from '@/lib/cms-server';

export async function GET() {
  if (!await requireCmsApiAdmin()) return unauthorizedResponse();
  return NextResponse.json({ collections: await getCmsSnapshot() }, { headers: { 'Cache-Control': 'private, no-store' } });
}
