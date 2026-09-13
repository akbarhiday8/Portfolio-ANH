# Status migrasi produksi

Cutover repository ke arsitektur final telah selesai:

- runtime: native Next.js;
- database CMS: Supabase PostgreSQL;
- autentikasi: Supabase Auth + allowlist `cms_admin_users`;
- media CMS baru: Supabase Storage;
- target deployment: Vercel.

Sebanyak 33 record CMS dari backup D1 produksi telah diimpor dan direkonsiliasi
di `cms_records`. Local D1 bukan sumber data dan tidak lagi dipakai. Data R2
tidak dimigrasikan karena metadata media produksi kosong dan record CMS tidak
mereferensikan objek R2. Aset visual bawaan tetap dilayani dari `/public`.

## Komponen legacy

Cloudflare D1, R2, Workers, Sites, dan Vinext telah dihapus dari runtime,
dependency, skrip build, binding, dan konfigurasi repository. Backup D1 serta
deployment Cloudflare lama berada di luar runtime baru dan boleh dipertahankan
sementara hanya untuk audit/rollback. Jangan menambahkan kembali pemilih
backend atau jalur dual-write.

Artefak `supabase/imports/20260913_production_d1_cms_records.sql` dan laporan
rekonsiliasi dipertahankan sebagai bukti migrasi, bukan sebagai runtime.

## Sisa langkah operasional

1. Verifikasi migration Supabase terbaru telah diterapkan.
2. Jalankan pemeriksaan native Next.js pada environment lokal.
3. Konfigurasikan environment variables di Vercel.
4. Buat preview deployment dan uji website serta `/admin`.
5. Deploy production setelah smoke test lulus.

Konfigurasi domain dan SMTP dilakukan setelah deployment Vercel dan berada di
luar cakupan cutover repository ini.
