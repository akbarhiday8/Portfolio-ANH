export type SupabasePublicConfig = Readonly<{
  url: string;
  publishableKey: string;
}>;

function requiredEnvironmentVariable(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(
      `Supabase belum dikonfigurasi: environment variable ${name} wajib diisi.`,
    );
  }

  return value;
}

/**
 * Membaca konfigurasi yang aman digunakan oleh browser maupun server.
 * Pemanggilan dibuat lazy agar proses build tidak membutuhkan .env.local.
 */
export function getSupabasePublicConfig(): SupabasePublicConfig {
  const url = requiredEnvironmentVariable('NEXT_PUBLIC_SUPABASE_URL');

  try {
    new URL(url);
  } catch {
    throw new Error(
      'Supabase belum dikonfigurasi: NEXT_PUBLIC_SUPABASE_URL harus berupa URL yang valid.',
    );
  }

  return {
    url,
    publishableKey: requiredEnvironmentVariable(
      'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
    ),
  };
}
