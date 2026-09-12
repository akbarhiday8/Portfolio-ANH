import { NextResponse } from 'next/server';
import { getCmsAdminFromToken, getCmsTokenFromRequest } from '@/lib/cms-auth';
import { CMS_COLLECTIONS, type CmsCollection, type CmsStatus } from '@/lib/cms-server';

export function isCmsCollection(value: string): value is CmsCollection {
  return (CMS_COLLECTIONS as readonly string[]).includes(value);
}

export function parseStatus(value: unknown): CmsStatus {
  return value === 'published' ? 'published' : 'draft';
}

export function mutationOriginIsValid(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin) return process.env.NODE_ENV !== 'production';
  return origin === new URL(request.url).origin;
}

export async function requireCmsApiAdmin(request: Request) {
  return getCmsAdminFromToken(getCmsTokenFromRequest(request));
}

export const unauthorizedResponse = () => NextResponse.json(
  { error: 'Sesi admin tidak tersedia atau telah berakhir.' },
  { status: 401, headers: { 'Cache-Control': 'no-store' } },
);

export const invalidOriginResponse = () => NextResponse.json(
  { error: 'Permintaan tidak dapat diverifikasi.' },
  { status: 403, headers: { 'Cache-Control': 'no-store' } },
);
