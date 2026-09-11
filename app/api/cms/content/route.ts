import { NextResponse } from 'next/server';
import { requireCmsApiAdmin, unauthorizedResponse } from '@/lib/cms-api';
import { getCmsSnapshot } from '@/lib/cms-server';

export async function GET(request: Request) {
  if (!await requireCmsApiAdmin(request)) return unauthorizedResponse();
  return NextResponse.json({ collections: await getCmsSnapshot() });
}
