import { NextResponse } from 'next/server';
import { CMS_SESSION_COOKIE, resetCmsAdminAccount } from '@/lib/cms-auth';
import { invalidOriginResponse, mutationOriginIsValid, requireCmsApiAdmin, unauthorizedResponse } from '@/lib/cms-api';

export async function POST(request: Request) {
  if (!mutationOriginIsValid(request)) return invalidOriginResponse();
  if (!await requireCmsApiAdmin(request)) return unauthorizedResponse();
  await resetCmsAdminAccount();
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: CMS_SESSION_COOKIE,
    value: '',
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
  return response;
}
