# Deployment Portfolio ANH

## Arsitektur produksi

Repository ini memakai native Next.js dan ditujukan untuk Vercel. Seluruh data
CMS berada di Supabase PostgreSQL, autentikasi admin memakai Supabase Auth, dan
media baru memakai Supabase Storage. Cloudflare D1, R2, Workers, Sites, serta
Vinext telah dipensiunkan dari runtime dan tidak didukung oleh aplikasi ini.

## Environment variables

Atur nilai berikut pada Vercel untuk Production, Preview, dan Development:

```dotenv
NEXT_PUBLIC_SITE_URL=https://domain-final.example
NEXT_PUBLIC_SUPABASE_URL=https://project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_PUBLIC_BUCKET=portfolio-public
```

`SUPABASE_PUBLIC_BUCKET` opsional dan akan memakai `portfolio-public` bila tidak
diisi. Jangan menambahkan service-role atau secret key: runtime bekerja dengan
publishable key, sesi pengguna, RLS, dan RPC yang memverifikasi allowlist admin.

## Pengembangan lokal

Salin `.env.example` menjadi `.env.local`, isi nilai Supabase, lalu jalankan:

```bash
npm install
npm run dev
```

- Website: `http://localhost:3000`
- CMS: `http://localhost:3000/admin`

`.env.local` diabaikan Git. Tidak ada database atau storage lokal Cloudflare.

## Pemeriksaan sebelum Vercel

```bash
npm run typecheck
npm run lint
npm run build
npm audit
```

Pastikan migration Supabase `0001`, `0002`, dan `0003` sudah diterapkan,
`cms_records` berisi 33 record hasil rekonsiliasi, dan satu pengguna admin aktif
di `cms_admin_users`. Hubungkan repository GitHub ke Vercel, isi environment
variables, lalu gunakan build command standar `npm run build`.

Deployment Cloudflare lama boleh tetap hidup sementara sebagai rollback
eksternal, tetapi tidak boleh menjadi dependency deployment Vercel.
