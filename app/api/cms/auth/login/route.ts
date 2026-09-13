import { NextResponse } from 'next/server';

import { requireCmsAdmin } from '@/lib/cms-auth';
import { mutationOriginIsValid } from '@/lib/cms-api';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const genericLoginError = () => NextResponse.json(
  { error: 'Email, kata sandi, atau akses admin tidak sesuai.' },
  { status: 401, headers: { 'Cache-Control': 'private, no-store' } },
);

export async function POST(request: Request) {
  if (!mutationOriginIsValid(request)) {
    return NextResponse.json(
      { error: 'Permintaan tidak valid.' },
      { status: 403, headers: { 'Cache-Control': 'private, no-store' } },
    );
  }

  const body = await request.json().catch(() => null) as {
    email?: string;
    password?: string;
  } | null;
  const email = body?.email?.trim().toLowerCase() ?? '';
  const password = body?.password ?? '';

  if (!email || !password) {
    return genericLoginError();
  }

  const supabase = await createSupabaseServerClient();
  let signInError = false;
  try {
    const result = await supabase.auth.signInWithPassword({ email, password });
    signInError = Boolean(result.error);
  } catch {
    signInError = true;
  }

  if (signInError) {
    return genericLoginError();
  }

  try {
    await requireCmsAdmin(supabase);
  } catch {
    await supabase.auth.signOut().catch(() => undefined);
    return genericLoginError();
  }

  return NextResponse.json(
    { ok: true },
    { headers: { 'Cache-Control': 'private, no-store' } },
  );
}
