import { NextResponse } from 'next/server';

import { mutationOriginIsValid } from '@/lib/cms-api';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  if (!mutationOriginIsValid(request)) {
    return NextResponse.json(
      { error: 'Permintaan tidak valid.' },
      { status: 403, headers: { 'Cache-Control': 'private, no-store' } },
    );
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    return NextResponse.json(
      { error: 'Sesi tidak dapat diakhiri. Coba kembali.' },
      { status: 500, headers: { 'Cache-Control': 'private, no-store' } },
    );
  }

  return NextResponse.json(
    { ok: true },
    { headers: { 'Cache-Control': 'private, no-store' } },
  );
}
