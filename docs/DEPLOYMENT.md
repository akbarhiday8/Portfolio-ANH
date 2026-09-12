# Deployment Portfolio ANH

## Kondisi runtime saat ini

Kode aplikasi saat ini menggunakan Vinext dan binding Cloudflare:

- `DB` untuk D1
- `MEDIA` untuk R2

Karena itu build lokal yang lulus saat ini siap untuk runtime Cloudflare/Sites. Menambahkan environment variable Supabase saja belum membuat build kompatibel dengan Vercel; `lib/cms-server.ts` dan `lib/cms-auth.ts` masih memakai binding D1/R2.

## Target Vercel + Supabase

Langkah migrasi yang harus dilakukan sebelum deployment Vercel:

1. Buat project Supabase dan bucket privat/publik sesuai kebutuhan.
2. Jalankan `supabase/migrations/0001_portfolio_cms.sql` melalui SQL Editor Supabase.
3. Implementasikan provider database/storage Supabase pada server, lalu hapus import `cloudflare:workers` dari runtime aplikasi.
4. Pastikan seluruh operasi admin memakai service role hanya di server. Jangan pernah memakai service role pada variabel `NEXT_PUBLIC_*`.
5. Tambahkan environment variables Vercel:
   - `NEXT_PUBLIC_SITE_URL`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_MEDIA_BUCKET`
6. Jalankan preview deployment dan checklist audit sebelum mengarahkan domain.

## Pengembangan lokal saat ini

```bash
npm install
npm run dev
```

Buka:

- Website: `http://localhost:3000`
- CMS: `http://localhost:3000/admin`

Database, akun admin, sesi, dan media lokal tersimpan di `.wrangler/` dan tidak dikirim ke Git.

## Pemeriksaan wajib

```bash
npm run lint
npm run build
npm audit
```

Semua perintah harus lulus sebelum push atau deployment produksi.
