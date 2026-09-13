import { NextResponse } from 'next/server';
import { requireCmsAdmin } from '@/lib/cms-auth';
import { CmsRepositoryError } from '@/lib/cms/repository-contract';
import { CMS_COLLECTIONS, type CmsCollection, type CmsStatus } from '@/lib/cms/types';

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

export async function requireCmsApiAdmin() {
  try {
    return await requireCmsAdmin();
  } catch {
    return null;
  }
}

export const unauthorizedResponse = () => NextResponse.json(
  { error: 'Sesi admin tidak tersedia atau telah berakhir.' },
  { status: 401, headers: { 'Cache-Control': 'private, no-store' } },
);

export const invalidOriginResponse = () => NextResponse.json(
  { error: 'Permintaan tidak dapat diverifikasi.' },
  { status: 403, headers: { 'Cache-Control': 'private, no-store' } },
);

export function cmsRepositoryErrorResponse(error: unknown) {
  if (error instanceof CmsRepositoryError) {
    const status = error.code === 'duplicate'
      ? 409
      : error.code === 'conflict'
        ? 409
        : error.code === 'not_found'
          ? 404
          : error.code === 'forbidden'
            ? 403
            : error.code === 'invalid'
              ? 422
              : 503;
    return NextResponse.json(
      { error: error.message },
      { status, headers: { 'Cache-Control': 'private, no-store' } },
    );
  }

  console.error('[cms-repository] Unexpected repository failure.', {
    name: error instanceof Error ? error.name : 'UnknownError',
  });
  return NextResponse.json(
    { error: 'Repository CMS tidak dapat menyelesaikan permintaan.' },
    { status: 503, headers: { 'Cache-Control': 'private, no-store' } },
  );
}
