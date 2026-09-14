import { NextResponse } from 'next/server';

import { mutationOriginIsValid } from '@/lib/cms-api';
import { SITE_URL } from '@/lib/site-url';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const noStoreHeaders = { 'Cache-Control': 'private, no-store' };
const genericSuccess = () => NextResponse.json(
  { ok: true, message: 'Jika email tersebut terdaftar, tautan reset password telah dikirim.' },
  { headers: noStoreHeaders },
);

export async function POST(request: Request) {
  if (!mutationOriginIsValid(request)) {
    return NextResponse.json({ error: 'Permintaan tidak valid.' }, { status: 403, headers: noStoreHeaders });
  }

  const body = await request.json().catch(() => null) as { email?: string } | null;
  const email = body?.email?.trim().toLowerCase() ?? '';
  if (!email || email.length > 254 || !email.includes('@')) {
    return NextResponse.json({ error: 'Masukkan alamat email yang valid.' }, { status: 400, headers: noStoreHeaders });
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${SITE_URL}/admin/reset-password`,
    });
    if (error) {
      console.error('[cms-auth] Password reset request was not accepted.', { code: error.code });
    }
    return genericSuccess();
  } catch (error) {
    console.error('[cms-auth] Password reset service is unavailable.', {
      name: error instanceof Error ? error.name : 'UnknownError',
    });
    return NextResponse.json(
      { error: 'Layanan pemulihan sedang tidak dapat dijangkau. Coba kembali.' },
      { status: 503, headers: noStoreHeaders },
    );
  }
}
