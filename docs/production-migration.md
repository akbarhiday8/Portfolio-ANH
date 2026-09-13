# Migrasi produksi: Vercel + Supabase

Website masih memakai D1/R2 agar seluruh fitur `/admin` tetap berjalan selama
migrasi. Skema dan hardening Supabase telah diterapkan, client serta Supabase
Auth sudah terhubung, dan Stage 4A menyediakan repository konten Supabase secara
paralel. Konten tetap memakai D1 secara default; cutover produksi belum terjadi.

Backup D1 produksi dengan 33 record adalah sumber migrasi resmi. Jangan memakai
D1 lokal sebagai sumber utama karena 11 `data_json` berbeda dan seluruh
timestamp produksi lebih baru.

## Urutan aktivasi

1. Pertahankan `CMS_DATA_BACKEND=d1` atau biarkan tidak diset selama persiapan.
2. Migrasikan 33 record dari backup D1 produksi, lalu cocokkan ID, koleksi,
   slug, status, urutan, JSON, dan timestamp.
3. Uji pembacaan, draft/publish, revision, reorder, dan optimistic concurrency
   pada environment non-produksi dengan `CMS_DATA_BACKEND=supabase`.
4. Migrasikan aset yang benar-benar digunakan dan isi `cms_record_media`.
5. Rekonsiliasi ulang jumlah/checksum data, lalu lakukan controlled cutover
   dengan `CMS_DATA_BACKEND=supabase`; jangan menyediakan fallback tersembunyi.
6. Hubungkan repository GitHub ke Vercel dan pasang variabel lingkungan yang
   sama pada Production serta Preview.
7. Isi `NEXT_PUBLIC_SITE_URL` dengan domain Vercel final, lalu jalankan build.

Rincian tabel, RLS, bucket, RPC, dan variabel lingkungan tersedia di
`docs/SUPABASE-SCHEMA.md`. Repository aplikasi hanya memakai publishable key dan
sesi pengguna; service role tidak dipakai oleh runtime. Rahasia tidak boleh
diberi awalan `NEXT_PUBLIC_` atau dimasukkan ke Git.
