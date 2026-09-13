import { NextResponse } from 'next/server';
import { cmsRepositoryErrorResponse, requireCmsApiAdmin, unauthorizedResponse } from '@/lib/cms-api';
import { getCmsDataBackend } from '@/lib/cms-repository';

/** Safe, admin-only confirmation of the active content backend. */
export async function GET() {
  try {
    const backend = getCmsDataBackend();
    if (!await requireCmsApiAdmin()) {
      const response = unauthorizedResponse();
      // Local verification can establish the selected repository before an
      // admin session exists. Production keeps this diagnostic admin-only.
      if (process.env.NODE_ENV !== 'production') response.headers.set('X-CMS-Backend', backend);
      return response;
    }
    return NextResponse.json({ backend }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    return cmsRepositoryErrorResponse(error);
  }
}
